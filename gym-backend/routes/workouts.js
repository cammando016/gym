import express from 'express';
import dotenv from 'dotenv';
import pool from '../db/pool.js';

dotenv.config();
const router = express.Router();

router.post('/templates/create', async(req, res) => {
    try {
        console.log('Received new workout with details: ', req.body);
        const { username, workoutName, privacy } = req.body;

        const dateCreated = new Date();

        //Check user submitting exists
        const usernameQuery = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        const user = usernameQuery.rows[0].id;
        if (!user) return res.status(401).json({error: 'User not found'});

        //Create workout template in DB
        console.log('Attempting to create workout template...');
        const insertNewWorkout = await pool.query(
            `INSERT INTO workout_templates (created_at, user_id, workout_name, privacy)
            VALUES ($1, $2, $3, $4)
            RETURNING id`,
            [dateCreated, user, workoutName, privacy]
        );
        const newWorkoutID = insertNewWorkout.rows[0].id;
        console.log('Workout template created');

        //Add exercises to workout template
        console.log('Attempting to create workout exercises');

        //Get set types
        const dbSetTypes = await pool.query(`SELECT id, name FROM set_types`);
        const setTypesMap = new Map(dbSetTypes.rows.map(row => [row.name, row.id]));

        req.body.exercises.map(async (exc, i) => {
            let newExerciseId;
            if(exc.dbId === '') {
                const createNewExercise = await pool.query(
                    `INSERT INTO exercises
                    (created_at, name, target_muscle, is_unilateral, opt_set_mod_unilateral, opt_set_mod_straps, opt_set_mod_belt)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id`,
                    [dateCreated, exc.exerciseName, exc.targetMuscle, exc.unilateralExercise, exc.setOptionalUnilateral, exc.setOptionalStraps, exc.setOptionalBelt] 
                );
                newExerciseId = createNewExercise.rows[0].id;
            }
            const newTemplateExercise = await pool.query(
                `INSERT INTO workout_template_exercises
                (workout_template_id, exercise_index, exercise_id, rep_range_lower, rep_range_upper)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id`,
                [newWorkoutID, i, newExerciseId ? newExerciseId : exc.dbId, exc.repRangeLower, exc.repRangeHigher]
            );
            const templateExerciseId = newTemplateExercise.rows[0].id;

            //Add template sets per exericse
            console.log(`Attempting to add exercise index ${i} sets`);
            console.log(exc.sets);
            exc.sets.map(async (s, ind) => {
                if (!setTypesMap.has(s.setType)) throw new Error(`Set Type: ${s.setType} not found`);
                await pool.query(
                    `INSERT INTO workout_template_exercise_sets
                    (workout_template_exercise_id, set_index, set_type, is_unilateral)
                    VALUES ($1, $2, $3, $4)`,
                    [templateExerciseId, ind, setTypesMap.get(s.setType), s.unilateralSet]
                )
            });
            console.log(`Sets added for exercise index ${i}`)

        });
        console.log('Exercises Added');

        //Add sets for each workout exercise

        return res.status(201).json({
            message: 'Workout Created'
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
})

export default router;