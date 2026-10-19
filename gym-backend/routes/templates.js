import express from 'express';
import dotenv from 'dotenv';
import pool from '../db/pool.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

dotenv.config();
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        console.log(`Received request for list of workouts from ${userId}`);

        const workoutTemplatesQuery = await pool.query(
            `WITH sets AS (
                SELECT
                    s.workout_template_exercise_id,
                    jsonb_agg(
                        jsonb_build_object(
                            'setIndex', s.set_index,
                            'setType', st.name,
                            'isUnilateralSet', s.is_unilateral
                        )
                        ORDER BY s.set_index
                    ) AS sets
                    FROM workout_template_exercise_sets s
                    JOIN set_types st ON s.set_type = st.id
                    GROUP BY s.workout_template_exercise_id
            ),
            optionalSetModifiers AS (
                SELECT
                    e.id,
                    jsonb_build_object(
                        'unilateral', e.opt_set_mod_unilateral,
                        'belt', e.opt_set_mod_belt,
                        'straps', e.opt_set_mod_straps
                    ) AS optionalSetModifiers
                FROM exercises e
                GROUP BY e.id
            ),
            exercises AS (
                SELECT
                    e.workout_template_id,
                    jsonb_agg(
                        jsonb_build_object(
                            'exerciseIndex', e.exercise_index,
                            'exerciseName', ex.name,
                            'exerciseId', e.exercise_id,
                            'exerciseNotes', es.setup_notes,
                            'repRangeLower', e.rep_range_lower,
                            'repRangeUpper', e.rep_range_upper,
                            'unilateralExercise', ex.is_unilateral,
                            'optionalSetModifiers', osm.optionalSetModifiers,
                            'sets', COALESCE(sl.sets, '[]'::jsonb)
                        )
                        ORDER BY e.exercise_index ASC
                    ) AS exercises
                FROM workout_template_exercises e
                JOIN exercises ex ON e.exercise_id = ex.id
                LEFT JOIN users_exercises_setup_notes es ON ex.id = es.exercise_id
                JOIN optionalSetModifiers osm ON ex.id = osm.id
                JOIN sets sl ON e.id = sl.workout_template_exercise_id
                GROUP BY e.workout_template_id
            )
            SELECT 
                w.workout_name AS "workoutName",
                w.privacy AS "privacy",
                w.active AS "isActive",
                w.id AS "workoutId",
                COALESCE(e.exercises, '[]'::jsonb) AS exercises
            FROM workout_templates w
            LEFT JOIN exercises e ON w.id = e.workout_template_id
            WHERE w.user_id = $1`,
            [userId]
        )

        console.log('query finished');

        return res.status(200).json({
            workouts: workoutTemplatesQuery.rows,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message
        });
    }
});

router.post('/templates/create', async(req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('Received new workout template');
        const { username, workoutName, privacy } = req.body;
        const dateCreated = new Date();

        //Check username submitting request exists in DB:
        const usernameQuery = await client.query('SELECT id FROM users WHERE username = $1', [username]);
        if (usernameQuery.rows.length === 0) throw new Error('Username not found');
        const userId = usernameQuery.rows[0].id;

        //Create workout template
        console.log('Creating new workout template...')
        const insertWorkoutTemplate = await client.query(
            `INSERT INTO workout_templates
            (created_at, user_id, workout_name, privacy)
            VALUES ($1, $2, $3, $4)
            RETURNING id`,
            [dateCreated, userId, workoutName, privacy]
        );
        //Get ID of newly created workout template to link to exercises on template
        const workoutTemplateId = insertWorkoutTemplate.rows[0].id;
        console.log('New workout template created.')

        //Get set type IDs from DB
        const dbSetTypes = await client.query('SELECT id, name FROM set_types');
        const setTypesMap = new Map(dbSetTypes.rows.map(row => [row.name, row.id]));

        //Insert each exercise in workout
        for (const [exerciseIndex, exc] of req.body.exercises.entries()) {
            //Exercises created by the user will have '' as the DB id. Add these to exercises table before adding workout exercises
            let exerciseId = exc.dbId;

            if(exerciseId === '') {
                console.log('Adding new exercise to DB...');
                const createNewExercise = await client.query(
                    `INSERT INTO exercises
                    (created_at, name, target_muscle, is_unilateral, opt_set_mod_unilateral, opt_set_mod_straps, opt_set_mod_belt)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id`,
                    [dateCreated, exc.exerciseName, exc.targetMuscle, exc.unilateralExercise, exc.setOptionalUnilateral, exc.setOptionalStraps, exc.setOptionalBelt] 
                );
                exerciseId = createNewExercise.rows[0].id;
                console.log('New exercise created in DB.');
            }

            //Insert exercise into template exercises table
            console.log('Adding new exercise to workout template...');
            const newTemplateExercise = await client.query(
                `INSERT INTO workout_template_exercises
                (workout_template_id, exercise_index, exercise_id, rep_range_lower, rep_range_upper)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id`,
                [workoutTemplateId, exerciseIndex, exerciseId, exc.repRangeLower, exc.repRangeHigher]
            );
            const newExerciseId = newTemplateExercise.rows[0].id;

            console.log('Adding sets to exercise in workout template...');
            const values = [];
            const placeholders = [];

            //Build query values and placeholders from set array
            exc.sets.forEach((s, sIndex) => {
                if (!setTypesMap.has(s.setType)) throw new Error(`Invalid set type: ${s.setType}`);

                const baseIndex = values.length;

                values.push(newExerciseId, sIndex, setTypesMap.get(s.setType), s.unilateralSet);
                placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4})`);
            });

            await client.query(
                `INSERT INTO workout_template_exercise_sets
                (workout_template_exercise_id, set_index, set_type, is_unilateral)
                VALUES ${placeholders.join(',')}`,
                values
            );
            console.log('Sets added.');
            console.log('Exercise added.');

            //Create or update setup notes for any exercises with notes provided by user
            console.log('Notes: ', exc.setupNotes);
            if(exc.setupNotes === '') {
                await client.query(
                    `DELETE FROM users_exercises_setup_notes
                    WHERE user_id = $1 AND exercise_id = $2`,
                    [userId, exerciseId]
                );
            } else {
                await client.query(
                    `INSERT INTO users_exercises_setup_notes
                    (user_id, exercise_id, setup_notes)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (user_id, exercise_id)
                    DO UPDATE SET setup_notes = EXCLUDED.setup_notes`,
                    [userId, exerciseId, exc.setupNotes]
                )
            }
        }

        await client.query('COMMIT');
        return res.status(201).json({ message: 'Workout Template Created' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

export default router;