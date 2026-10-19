import express from 'express';
import dotenv from 'dotenv';
import pool from '../db/pool.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

dotenv.config();
const router = express.Router();

router.patch('/:splitId/edit', authenticateToken, async(req, res) => {
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

        //After split is edited, user needs to set where they are up to in split
        //Reset current_split_day to -1, to trigger user selecting split or starting following day
        await client.query(`
            UPDATE users
            SET current_split_day = $1
            WHERE active_split = $2
            `,[-1, splitId]
        );

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

router.post('/create', async (req, res) => {
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