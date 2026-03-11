import express from 'express';
import dotenv from 'dotenv';
import pool from '../db/pool.js';

dotenv.config();
const router = express.Router();

router.get('/:username/splits', async(req, res) => {
    console.log('Received request for user split');
    const { username } = req.params;

    try {
        //Get ID of user
        console.log('Checking for user ID in user table')
        const userQuery = await pool.query(`SELECT id FROM users WHERE username = $1`, [username]);
        if (userQuery.rows.length === 0) throw new Error('Username not found');
        const userId = userQuery.rows[0].id;

        console.log('Getting split details');
        //Get split details
        const splitQuery = await pool.query(
            `WITH split_days AS (
                SELECT 
                    sw.split_id,
                    jsonb_agg(
                        jsonb_build_object(
                            'workoutId', sw.workout_id,
                            'workoutName', w.workout_name,
                            'dayIndex', sw.day_index,
                            'restDay', sw.is_rest_day
                        )
                        ORDER BY sw.day_index
                    ) AS workouts
                FROM split_workouts sw
                LEFT JOIN workout_templates w ON sw.workout_id = w.id
                GROUP BY sw.split_id
            ),
            user_splits_data AS (
                SELECT 
                    s.split_id, 
                    s.split_name, 
                    (s.split_id = u.active_split) AS is_active, 
                    COALESCE(sd.workouts, '[]'::jsonb) AS workouts
                FROM users u
                JOIN users_splits us ON u.id = us.user_id
                JOIN splits s ON us.split_id = s.split_id
                LEFT JOIN split_days sd ON sd.split_id = s.split_id
                WHERE u.id = $1
            )
            SELECT jsonb_build_object(
                'splits',
                jsonb_agg(
                    jsonb_build_object(
                        'splitId', split_id,
                        'splitName', split_name,
                        'isActive', is_active,
                        'workouts', workouts
                    )
                )
            ) AS result
            FROM user_splits_data`,
            [userId]
        );

        if(splitQuery.rows.length === 0) return res.status(404).json({ error: 'No splits found' });

        console.log(splitQuery.rows);

        return res.status(200).json({
            splits: splitQuery.rows[0].result,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            error: error.message
        });
    }
});

export default router;