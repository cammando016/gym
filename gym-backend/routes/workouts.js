import express from 'express';
import dotenv from 'dotenv';
import pool from '../db/pool.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { deactivateActiveWorkouts } from '../middleware/deactivateActiveWorkouts.js';

dotenv.config();
const router = express.Router();

router.post('/sessions', authenticateToken, deactivateActiveWorkouts, async (req, res) => {
    
    console.log(req.body);
    const { templateId } = req.body;
    const userId = req.user.id;

    try {
        console.log('Getting Workout Name');
        const workoutNameQuery = await pool.query(`SELECT workout_name FROM workout_templates WHERE id = $1`, [templateId]);
        const workoutName = workoutNameQuery.rows[0].workout_name;

        const dateStarted = new Date();

        console.log('Attempting to start workout')
        const session = await pool.query(
            `INSERT INTO workouts
            (date_started, user_id, workout_template_id, status)
            VALUES ($1, $2, $3, $4)
            RETURNING id`,
            [dateStarted, userId, templateId, 'active']
        );

        const sessionId = session.rows[0].id;

        console.log('Workout started');
        return res.status(200).json({ sessionId, workoutName, templateId, dateStarted });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message
        });
    }
});

//Submit logged workout data
router.post('/complete', authenticateToken, async(req, res) => {
    console.log('Received request to submit workout');

    const userId = req.user.id;
    const { workoutId, workoutNotes, exercises } = req.body;
    const dateEnded = new Date();

    //Check the user submitting the workout is the same user who started workout
    try {
        const workoutQuery = await pool.query(`SELECT user_id, id FROM workouts WHERE id = $1 AND user_id = $2`, [workoutId, userId]);
        
        if (workoutQuery.rows.length === 0) {
            return res.status(403).json({
                error: 'Unauthorized'
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message
        })
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        //Update workout details for date ended, notes and set status to complete
        await client.query(
            `UPDATE workouts 
            SET date_ended = $1, workout_notes = $2, status = $3
            WHERE id = $4`, 
            [dateEnded, workoutNotes, 'complete', workoutId]
        );

        //Insert completed exercises
        const insertExercisesQuery = await client.query(`
            INSERT INTO workout_exercises
            (workout_id, exercise_index, exercise_id, exercise_notes, subbed_exercise)
            SELECT * FROM unnest( $1::uuid[], $2::int2[], $3::uuid[], $4::text[], $5::bool[] )
            RETURNING id, exercise_index
        `, 
        [
            exercises.map(_ => workoutId),
            exercises.map(e => e.exerciseIndex),
            exercises.map(e => e.exerciseId),
            exercises.map(e => e.exerciseNotes),
            exercises.map(e => e.exerciseSubbed)
        ]);

        //Build map of matching exercise index and created ID for exercise in workout_exercises table
        const exerciseIdMap = new Map(
            insertExercisesQuery.rows.map(row => [row.exercise_index, row.id])
        )

        //Add the created ID for the matching exercise to each set object ready for DB insert
        const setList = exercises.flatMap(e => 
            e.sets.map(s => ({
                ...s,
                workoutExerciseId: exerciseIdMap.get(e.exerciseIndex)
            }))    
        );

        const bilateralSets = setList.filter(s => !s.setUnilateral);
        const unilateralSets = setList.filter(s => s.setUnilateral);

        //Get set types
        const setTypesQuery = await client.query('SELECT id, name FROM set_types');
        const setTypesMap = new Map(setTypesQuery.rows.map(row => [row.name, row.id]));

        //Insert bilateral sets
        await client.query(`
            INSERT INTO workout_sets
            (set_index, workout_id, weight, full_reps, partial_reps, assisted_reps, set_notes, is_unilateral, set_type, workout_exercise_id, used_straps, used_belt)
            SELECT * FROM
                unnest( $1::int2[], $2::uuid[], $3::float4[], $4::int2[], $5::int2[], $6::int2[], $7::text[], $8::bool[], $9::uuid[], $10::uuid[], $11::bool[], $12::bool[] )
        `,
        [
            bilateralSets.map(s => s.setIndex),
            bilateralSets.map(_ => workoutId),
            bilateralSets.map(s => s.setWeight),
            bilateralSets.map(s => s.fullReps),
            bilateralSets.map(s => s.partialReps),
            bilateralSets.map(s => s.assistedReps),
            bilateralSets.map(s => s.setNotes),
            bilateralSets.map(_ => false),
            bilateralSets.map(s => setTypesMap.get(s.setType)),
            bilateralSets.map(s => s.workoutExerciseId),
            bilateralSets.map(s => s.setUsedStraps),
            bilateralSets.map(s => s.setUsedBelt),
        ]);

        //Insert unilateral sets
        await client.query(`
            INSERT INTO workout_sets
            (set_index, workout_id, weight, ull_full_reps, ull_partial_reps, ull_assisted_reps, ulr_full_reps, ulr_partial_reps, ulr_assisted_reps, set_notes, is_unilateral, set_type, workout_exercise_id, used_straps, used_belt)
            SELECT * FROM
                unnest( $1::int2[], $2::uuid[], $3::float4[], $4::int2[], $5::int2[], $6::int2[], $7::int2[], $8::int2[], $9::int2[], $10::text[], $11::bool[], $12::uuid[], $13::uuid[], $14::bool[], $15::bool[] )
        `,
        [
            unilateralSets.map(s => s.setIndex),
            unilateralSets.map(_ => workoutId),
            unilateralSets.map(s => s.setWeight),
            unilateralSets.map(s => s.left.fullReps),
            unilateralSets.map(s => s.left.partialReps),
            unilateralSets.map(s => s.left.assistedReps),
            unilateralSets.map(s => s.right.fullReps),
            unilateralSets.map(s => s.right.partialReps),
            unilateralSets.map(s => s.right.assistedReps),
            unilateralSets.map(s => s.setNotes),
            unilateralSets.map(_ => true),
            unilateralSets.map(s => setTypesMap.get(s.setType)),
            unilateralSets.map(s => s.workoutExerciseId),
            unilateralSets.map(s => s.setUsedStraps),
            unilateralSets.map(s => s.setUsedBelt),
        ]);

        await client.query('COMMIT');
        return res.status(201).json({ message: 'Workout Logged'});

    } catch(error) {
        await client.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({
            error: error.message
        })
    } finally {
        client.release();
    }
})

router.get('/templates', authenticateToken, async (req, res) => {

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

router.get('/active', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const activeWorkoutQuery = await pool.query(
            `
            SELECT
                w.id,
                w.date_started AS "dateStarted",
                wt.workout_name AS "workoutName",
                w.workout_template_id AS "templateId"
            FROM workouts w
            JOIN users u ON w.user_id = u.id
            JOIN workout_templates wt ON w.workout_template_id = wt.id
            WHERE u.id = $1
            AND w.status = $2`, 
            [userId, 'active']
        );

        const activeWorkout = activeWorkoutQuery.rows[0];

        if (!activeWorkout) return res.status(404).json({message: 'No active workouts'});

        return res.status(200).json({
            workout: activeWorkout
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: error.message
        })
    }
})

router.get('/:workoutId/last', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const templateId = req.params.workoutId;

    try {
        console.log('Getting last workout')

        const workoutQuery = await pool.query(
            `WITH set_list AS (
                SELECT
                    s.workout_exercise_id,
                    jsonb_agg(
                        jsonb_build_object(
                            'setIndex', s.set_index,
                            'weight', s.weight,
                            'setNotes', s.set_notes,
                            'setType', st.name,
                            'usedBelt', s.used_belt,
                            'usedStraps', s.used_straps,
                            'isUnilateral', s.is_unilateral,
                            'reps', CASE
                                WHEN s.is_unilateral = true THEN jsonb_build_object(
                                    'left', jsonb_build_object(
                                        'fullReps', s.ull_full_reps,
                                        'partialReps', s.ull_partial_reps,
                                        'assistedReps', s.ull_assisted_reps
                                    ),
                                    'right', jsonb_build_object(
                                        'fullReps', s.ulr_full_reps,
                                        'partialReps', s.ulr_partial_reps,
                                        'assistedReps', s.ulr_assisted_reps
                                    )
                                )
                                ELSE jsonb_build_object(
                                    'fullReps', s.full_reps,
                                    'partialReps', s.partial_reps,
                                    'assistedReps', s.assisted_reps
                                )
                            END
                        )
                        ORDER BY s.set_index
                    ) AS sets
                FROM workout_sets s
                JOIN set_types st ON s.set_type = st.id
                GROUP BY s.workout_exercise_id
            ),
            exercise_list AS (
                SELECT
                    we.workout_id,
                    jsonb_agg(
                        jsonb_build_object(
                            'exerciseId', we.exercise_id,
                            'workoutExerciseId', we.id,
                            'exerciseName', e.name,
                            'exerciseNotes', we.exercise_notes,
                            'exerciseIndex', we.exercise_index,
                            'sets', COALESCE(sl.sets, '[]'::jsonb)
                        )
                        ORDER BY we.exercise_index
                    ) AS exercise_list
                FROM workout_exercises we
                JOIN exercises e ON we.exercise_id = e.id
                JOIN set_list sl ON we.id = sl.workout_exercise_id
                GROUP BY we.workout_id
            )
            SELECT
                w.id,
                w.date_started AS "dateStarted",
                w.date_ended AS "dateEnded",
                w.workout_notes as "workoutNotes",
                COALESCE(el.exercise_list, '[]'::jsonb) AS exercises
            FROM workouts w
            JOIN users u ON w.user_id = u.id
            JOIN exercise_list el ON w.id = el.workout_id
            WHERE u.id = $1
            AND w.workout_template_id = $2
            ORDER BY w.date_started DESC
            LIMIT 1`, 
            [userId, templateId]
        );

        if(workoutQuery.rows.length === 0) return res.status(404).json({error: 'No previous workout found'});

        console.log(workoutQuery.rows[0]);

        return res.status(200).json({
            workout: workoutQuery.rows[0]
        });
    } catch (error) {
        console.log(error.message);
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
})

router.patch('/split/:splitId/edit', authenticateToken, async(req, res) => {
    const splitId = req.params.splitId;
    const userId = req.user.id;

    let splitDays;

    //Check split exists, and user is permitted to edit the split
    if (!splitId) return res.status(404).json({ error: 'Submitted split ID not found'});
    try {
        const splitUserCheck = await pool.query(
            `SELECT s.user_id, COUNT(sw.split_id) 
            FROM splits s 
            JOIN split_workouts sw ON s.split_id = sw.split_id
            WHERE s.split_id = $1
            GROUP BY s.user_id`, 
            [splitId]
        );
        if (splitUserCheck.rows.length === 0) return res.status(404).json({ error: 'Submitted split ID not found'});
        if (splitUserCheck.rows[0].user_id !== userId) return res.status(403).json({error: 'Unauthorized to edit this split'});
        splitDays = splitUserCheck.rows[0].count;
    } catch (error) {
        return res.status(500).json({error: error.message});
    }

    //Update split
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { splitName, split, splitLength } = req.body;

        //Update split name if needed
        if (splitName) {
            await client.query(`
                UPDATE splits
                SET split_name = $1
                WHERE split_id = $2
                `,
                [splitName, splitId]
            );
        }

        //Update any days that were changed
        if (split.length > 0) {
            console.log('Updating days of split ID:', splitId)
            await Promise.all(split.map(s => 
                client.query(`
                    UPDATE split_workouts
                    SET workout_id = $1, is_rest_day = $2
                    WHERE split_id = $3 AND day_index = $4
                    `,
                    [s.workoutTemplateId === '' ? null : s.workoutTemplateId, s.restDay, splitId, s.dayIndex]
                )
            ));
        }

        //Delete any removed days of split
        //Days deleted from middle of split auto increments later days to replace in above query, so delete any days from DB that are above total split length after editing (splitLength param)
        if (splitLength < splitDays) {
            console.log('Deleting removed days of split ID:', splitId);
            await client.query('DELETE FROM split_workouts WHERE day_index >= $1', [splitLength]);
        }

        //Add new days if extra than previously
        if (splitLength > splitDays) {
            console.log('Inserting added days of split ID:', splitId)
            await Promise.all(split.filter(sp => sp.dayIndex + 1 > splitDays).map(s => 
                client.query(`
                    INSERT INTO split_workouts
                    (split_id, day_index, workout_id, is_rest_day)
                    VALUES ($1, $2, $3, $4)
                    `, [splitId, s.dayIndex, s.workoutTemplateId === '' ? null : s.workoutTemplateId, s.restDay]
                )
            ))
        }

        await client.query('COMMIT');
        console.log('Changes committed to split ID:', splitId);
        return res.status(200).json({message: 'Split Updated'});

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ error: error.message});
    } finally {
        client.release();
    }

})

router.post('/split/create', async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const { username, split, splitName } = req.body;
        console.log('Received new split from ', {username});
        //Ensure username exists before adding split to db
        const usernameQuery = await client.query('SELECT id FROM users WHERE username = $1', [username]);
        if (usernameQuery.rows.length === 0) throw new Error('Username not found');
        const userId = usernameQuery.rows[0].id;

        //Set all workouts from new split data to active, and deactivate any workouts no longer in use on the current split
        const activeWorkoutIds = split.filter(s => !s.restDay && s.workoutTemplateId).map(s => s.workoutTemplateId);
        await client.query(
            `UPDATE workout_templates
            SET active = id = ANY($2::uuid[])
            WHERE user_id = $1`,
            [userId, activeWorkoutIds]
        );

        //Create split shell to get the ID of split
        console.log('Creating new split...');
        const createSplit = await client.query(
            `INSERT INTO splits
            (user_id, split_name)
            VALUES ($1, $2)
            RETURNING split_id`,
            [userId, splitName]
        );
        const splitId = createSplit.rows[0].split_id;
        console.log('Split Created');

        //Update user record with the current active split
        await client.query(
            `UPDATE users
            SET active_split = $1, current_split_day = $3
            WHERE id = $2`,
            [splitId, userId, -1]
        );

        //Add each day of the split with the tagged workout
        console.log('Adding workouts to each day of split');
        const values = [];
        const placeholders = [];

        split.forEach(s => {
            const baseIndex = values.length;
            values.push(splitId, s.dayIndex, s.workoutTemplateId === '' ? null : s.workoutTemplateId, s.restDay);
            placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4})`);
        });

        await client.query(
            `INSERT INTO split_workouts
            (split_id, day_index, workout_id, is_rest_day)
            VALUES ${placeholders.join(',')}`,
            values
        );
        console.log('Split workouts added');

        await client.query('COMMIT');
        return res.status(201).json({ message: 'Split Created' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

export default router;