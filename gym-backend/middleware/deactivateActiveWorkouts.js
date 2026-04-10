import pool from "../db/pool.js";

export const deactivateActiveWorkouts = async (req, res, next) => {
    const userId = req.user.id;

    try {
        await pool.query(
            `UPDATE workouts
            SET status = $1
            WHERE status = $2
            AND user_id = $3`,
            ['incomplete', 'active', userId]
        );
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }

    next();
}