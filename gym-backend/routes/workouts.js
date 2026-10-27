import express from 'express';
import dotenv from 'dotenv';
import pool from '../db/pool.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { deactivateActiveWorkouts } from '../middleware/deactivateActiveWorkouts.js';
import { setSplitDay } from '../middleware/setSplitDay.js';

dotenv.config();
const router = express.Router();

router.post('/sessions', authenticateToken, deactivateActiveWorkouts, setSplitDay, async (req, res) => {
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

router.post('/sessions/:sessionId/resume', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { sessionId } = req.params;

    try {
        const result = await pool.query(
            `UPDATE workouts
            SET date_resumed = now()
            WHERE id = $1 AND user_id = $2 AND status = $3
            RETURNING
                id AS "sessionId",
                date_started AS "dateStarted",
                date_resumed AS "dateResumed",
                duration,
                status
            `,
            [sessionId, userId, 'active']
        );

        if (result.rowCount === 0) return res.status(404).json({ message: 'No active session found' });
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: error.message });
    }
});

router.get('/sessions/:sessionId', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { sessionId } = req.params;

    try {
        const result = await pool.query(
            `SELECT
                w.id AS "sessionId",
                w.date_started AS "dateStarted",
                w.status,
                wt.workout_name AS "workoutName",
                w.workout_template_id AS "templateId",
                w.date_resumed AS "dateResumed",
                w.duration,
                w.draft
            FROM workouts w
            JOIN workout_templates wt ON w.workout_template_id = wt.id
            WHERE w.id = $1 AND w.user_id = $2`,
            [sessionId, userId]
        );

        const session = result.rows[0];
        if (!session) return res.status(404).json({ message: 'Session not found' });

        return res.status(200).json(session);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: error.message });
    }
})

router.get('/sessions/:sessionId/view', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { sessionId } = req.params;

    try {
        //Get workouts and exercises in workouts
        const workoutquery = await pool.query(
            `WITH set_list AS (
                SELECT
                    s.workout_exercise_id,
                    jsonb_agg(
                        jsonb_build_object(
                            'setIndex', s.set_index,
                            'setWeight', s.weight,
                            'setNotes', s.set_notes,
                            'setIsUnilateral', s.is_unilateral,
                            'setType', st.name,
                            'setUsedStraps', s.used_straps,
                            'setUsedBelt', s.used_belt,
                            'reps', CASE
                                WHEN s.is_unilateral = true THEN jsonb_build_object(
                                    'left', jsonb_build_object(
                                        'fullReps', s.ull_full_reps,
                                        'prtlReps', s.ull_partial_reps,
                                        'astdReps', s.ull_assisted_reps,
                                        'rir', s.ull_reps_in_reserve,
                                        'rpe', s.ull_rate_perceived_exertion
                                    ),
                                    'right', jsonb_build_object(
                                        'fullReps', s.ulr_full_reps,
                                        'prtlReps', s.ulr_partial_reps,
                                        'astdReps', s.ulr_assisted_reps,
                                        'rir', s.ulr_reps_in_reserve,
                                        'rpe', s.ulr_rate_perceived_exertion
                                    )
                                ) ELSE jsonb_build_object(
                                    'fullReps', s.full_reps,
                                    'prtlReps', s.partial_reps,
                                    'astdReps', s.assisted_reps,
                                    'rir', s.reps_in_reserve,
                                    'rpe', s.rate_perceived_exertion
                                )
                            END
                        )
                        ORDER BY s.set_index
                    ) AS sets
                FROM workout_sets s
                JOIN set_types st ON s.set_type = st.id
                GROUP BY s.workout_exercise_id
            ),
            exercises AS (
                SELECT
                e.workout_id,
                jsonb_agg(
                    jsonb_build_object(
                        'exerciseIndex', e.exercise_index,
                        'exerciseId', e.id,
                        'exerciseName', ex.name,
                        'exerciseNotes', e.exercise_notes,
                        'exerciseSubbed', e.subbed_exercise_id,
                        'exerciseSubbedName', CASE
                            WHEN e.subbed_exercise = true THEN
                                (SELECT excs.name FROM exercises excs WHERE excs.id = e.subbed_exercise_id)
                            ELSE null
                        END,
                        'exerciseIsUnilateral', ex.is_unilateral,
                        'exerciseOptionalModifiers', jsonb_build_object(
                            'unilateralOption', ex.opt_set_mod_unilateral,
                            'strapsOption', ex.opt_set_mod_straps,
                            'beltOption', ex.opt_set_mod_belt
                        ),
                        'sets', COALESCE(sl.sets, '[]'::jsonb)
                    )
                    ORDER BY e.exercise_index
                ) AS exercises
                FROM workout_exercises e
                LEFT JOIN exercises ex ON e.exercise_id = ex.id
                LEFT JOIN set_list sl ON e.id = sl.workout_exercise_id
                GROUP BY e.workout_id
            )
            SELECT
                w.id AS "sessionId",
                w.date_started AS "dateStarted",
                w.status,
                w.workout_name AS "workoutName",
                w.date_ended AS "dateEnded",
                w.duration,
                w.workout_notes AS "workoutNotes",
                COALESCE(e.exercises, '[]'::jsonb) AS exercises
            FROM workouts w
            LEFT JOIN exercises e ON w.id = e.workout_id
            WHERE w.id = $1 AND w.user_id = $2`,
            [sessionId, userId]
        );

        if (workoutquery.rowCount === 0) return res.status(404).json({ message: 'Workout not found' });

        return res.status(200).json({ workout: workoutquery.rows[0] });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: error.message });
    }
})

//Save draft of workout completed so far when switching sets, pausing workout
router.put('/sessions/:sessionId/draft', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const { form, durationSeconds } = req.body;

    try {
        const result = await pool.query(
            `UPDATE workouts
            SET draft = $1::jsonb, duration = $5
            WHERE id = $2 AND user_id = $3 AND status = $4`,
            [JSON.stringify(form), sessionId, userId, 'active', durationSeconds]
        );

        if (result.rowCount === 0) return res.status(404).json({message: 'No active session'});
        return res.sendStatus(204);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: error.message })
    }
})

//Submit logged workout data
router.post('/sessions/:sessionId/complete', authenticateToken, async(req, res) => {
    console.log('Received request to submit workout');

    const userId = req.user.id;
    const { sessionId } = req.params;
    const { workoutNotes, exercises, durationSeconds } = req.body;
    const dateEnded = new Date();

    //Check the user submitting the workout is the same user who started workout
    try {
        const workoutQuery = await pool.query(`SELECT user_id, id FROM workouts WHERE id = $1 AND user_id = $2`, [sessionId, userId]);
        
        if (workoutQuery.rows.length === 0) {
            return res.status(403).json({
                error: 'Unauthorized'
            })
        }

    } catch (error) {
        console.error(error);
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
            SET date_ended = $1, workout_notes = $2, status = $3, draft = NULL, duration = $5
            WHERE id = $4`, 
            [dateEnded, workoutNotes, 'complete', sessionId, durationSeconds]
        );

        //Insert completed exercises
        const insertExercisesQuery = await client.query(`
            INSERT INTO workout_exercises
            (workout_id, exercise_index, exercise_id, exercise_notes, subbed_exercise, subbed_exercise_id)
            SELECT * FROM unnest( $1::uuid[], $2::int2[], $3::uuid[], $4::text[], $5::bool[], $6::uuid[] )
            RETURNING id, exercise_index
        `, 
        [
            exercises.map(_ => sessionId),
            exercises.map(e => e.exerciseIndex),
            exercises.map(e => e.exerciseId),
            exercises.map(e => e.exerciseNotes),
            exercises.map(e => e.exerciseSubbed),
            exercises.map(e => e.exerciseSubbedId ?? null)
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
            (set_index, workout_id, weight, full_reps, partial_reps, assisted_reps, set_notes, is_unilateral, set_type, workout_exercise_id, used_straps, used_belt, reps_in_reserve, rate_perceived_exertion)
            SELECT * FROM
                unnest( $1::int2[], $2::uuid[], $3::float4[], $4::int2[], $5::int2[], $6::int2[], $7::text[], $8::bool[], $9::uuid[], $10::uuid[], $11::bool[], $12::bool[], $13::int2[], $14::int2[] )
        `,
        [
            bilateralSets.map(s => s.setIndex),
            bilateralSets.map(_ => sessionId),
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
            bilateralSets.map(s => s.rir),
            bilateralSets.map(s => s.rpe)
        ]);

        //Insert unilateral sets
        await client.query(`
            INSERT INTO workout_sets
            (set_index, workout_id, weight, ull_full_reps, ull_partial_reps, ull_assisted_reps, ulr_full_reps, ulr_partial_reps, ulr_assisted_reps, set_notes, is_unilateral, set_type, workout_exercise_id, used_straps, used_belt, ull_reps_in_reserve, ull_rate_perceived_exertion, ulr_reps_in_reserve, ulr_rate_perceived_exertion)
            SELECT * FROM
                unnest( $1::int2[], $2::uuid[], $3::float4[], $4::int2[], $5::int2[], $6::int2[], $7::int2[], $8::int2[], $9::int2[], $10::text[], $11::bool[], $12::uuid[], $13::uuid[], $14::bool[], $15::bool[], $16::int2[], $17::int2[], $18::int2[], $19::int2[] )
        `,
        [
            unilateralSets.map(s => s.setIndex),
            unilateralSets.map(_ => sessionId),
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
            unilateralSets.map(s => s.left.rir),
            unilateralSets.map(s => s.left.rpe),
            unilateralSets.map(s => s.right.rir),
            unilateralSets.map(s => s.right.rpe)
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
        console.error(error.message);
        return res.status(500).json({
            error: error.message
        })
    }
})

//Gets the last session from the matching template workout id
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
                                        'assistedReps', s.ull_assisted_reps,
                                        'rir', s.ull_reps_in_reserve,
                                        'rpe', s.ull_rate_perceived_exertion
                                    ),
                                    'right', jsonb_build_object(
                                        'fullReps', s.ulr_full_reps,
                                        'partialReps', s.ulr_partial_reps,
                                        'assistedReps', s.ulr_assisted_reps,
                                        'rir', s.ulr_reps_in_reserve,
                                        'rpe', s.ulr_rate_perceived_exertion
                                    )
                                )
                                ELSE jsonb_build_object(
                                    'fullReps', s.full_reps,
                                    'partialReps', s.partial_reps,
                                    'assistedReps', s.assisted_reps,
                                    'rir', s.reps_in_reserve,
                                    'rpe', s.rate_perceived_exertion
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
                w.duration AS "duration",
                w.workout_notes as "workoutNotes",
                COALESCE(el.exercise_list, '[]'::jsonb) AS exercises
            FROM workouts w
            JOIN users u ON w.user_id = u.id
            JOIN exercise_list el ON w.id = el.workout_id
            WHERE u.id = $1
            AND w.workout_template_id = $2
            AND NOT w.status = $3
            ORDER BY w.date_started DESC
            LIMIT 1`, 
            [userId, templateId, "active"]
        );

        if(workoutQuery.rows.length === 0) return res.status(404).json({error: 'No previous workout found'});

        return res.status(200).json({
            workout: workoutQuery.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            error: error.message
        });
    }
});

//Get basic details of last three workouts (active or completed)
router.get('/last-three', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        console.log('Fetching last three workouts');
        const lastThreeWorkoutsQuery = await pool.query(
            `SELECT 
                w.id, w.date_started AS "dateStarted", w.duration, w.status, wt.workout_name AS "workoutName", w.workout_template_id AS "templateId"
            FROM
                workouts w
            JOIN 
                workout_templates wt ON w.workout_template_id = wt.id
            WHERE 
                w.user_id = $1
            ORDER BY 
                w.date_started DESC
            LIMIT 3
            `, [userId]
        );

        if(lastThreeWorkoutsQuery.rows.length === 0) return res.status(404).json({error: `No past workouts found for user`});

        return res.status(200).json({
            workouts: lastThreeWorkoutsQuery.rows
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            error: error.message
        });
    }
});

export default router;