import express from 'express';
import dotenv from 'dotenv';
import pool from '../db/pool.js';

dotenv.config();
const router = express.Router();

router.get('/exercise', async (req, res) => {
    try {
        console.log('Received request for list of exercises', req.query);
        const {searchString} = req.query;

        const exercisesQuery = await pool.query(
            `SELECT e.name AS exercise_name, e.is_unilateral AS exercise_unilateral, e.id AS exercise_id, m.name AS muscle_name
            FROM exercises e
            JOIN muscle_groups m ON e.target_muscle = m.id
            WHERE e.name ILIKE $1
            LIMIT 10`,
            [`%${searchString.toLowerCase()}%`]
        );

        console.log(exercisesQuery.rows);

        return res.status(200).json({
            exercises: exercisesQuery.rows
        });
    } catch (error) {
        return res.status(500).json({error: 'An error occurred searching for exercises'})
    }
});

export default router;