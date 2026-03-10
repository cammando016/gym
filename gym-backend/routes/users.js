import express from 'express';
import dotenv from 'dotenv';
import pool from '../db/pool.js';

dotenv.config();
const router = express.Router();

router.get('/:username/active-split', async(req, res) => {
    console.log('Received request for user split');
    const { username } = req.params;

    try {
        //Get split ID of user
        console.log('Checking for split ID in user table')
        const splitIdQuery = await pool.query(`SELECT active_split FROM users WHERE username = $1`, [username]);
        //If no rows, username doesn't exist
        if (splitIdQuery.rows.length === 0) throw new Error('Username not found');
        const splitId = splitIdQuery.rows[0].active_split;

        console.log('Getting split details');
        //Get split details
        const splitQuery = await pool.query(
            `SELECT s.split_id, s.split_name, 
                array_agg(json_build_object(
                    'workoutName', w.workout_name,
                    'dayIndex', sw.day_index,
                    'restDay', sw.is_rest_day
                )
                ORDER BY sw.day_index ASC
                ) AS workouts
            FROM splits s
            JOIN split_workouts sw ON s.split_id = sw.split_id
            LEFT JOIN workout_templates w ON sw.workout_id = w.id
            WHERE s.split_id = $1
            GROUP BY s.split_id, s.split_name`,
            [splitId]
        );

        if(splitQuery.rows.length === 0) return res.status(404).json({ error: 'Split not found' });

        return res.status(200).json({
            split: splitQuery.rows[0],
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: error.message
        });
    }
});

export default router;