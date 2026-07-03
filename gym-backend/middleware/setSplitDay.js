import pool from "../db/pool.js";

export const setSplitDay = async (req, res, next) => {

    // <-------- PLANNED FUNCTIONALITY --------->

    //Check if workout started is in user split
    //If not in split, do nothing to user split day
    //If in split, if scheduled day do nothing, if not scheduled day then change db day of split to current workout
    
    const userId = req.user.id;
    const { templateId } = req.body;

    try {
        const workoutInActiveSplit = await pool.query(
            `SELECT sw.day_index
            FROM split_workouts sw
            JOIN users u ON sw.split_id = u.active_split
            WHERE sw.workout_id = $1 AND u.id = $2
            `, [templateId, userId]
        );

        if (workoutInActiveSplit.rows.length === 0) return next();

        const dayOfSplit = await pool.query(
            `SELECT current_split_day
            FROM users
            WHERE id = $1`,
            [userId]
        );

        if(workoutInActiveSplit.rows[0].day_index === dayOfSplit.rows[0].current_day_split) return next();

        await pool.query(
            `UPDATE users
            SET current_split_day = $1
            WHERE id = $2`,
            [workoutInActiveSplit.rows[0].day_index, userId]
        )
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({error: error.message});
    }
    
    next();
}