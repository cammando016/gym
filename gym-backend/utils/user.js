import pool from "../db/pool.js";

export async function getUserId (username) {
    const userQuery = await pool.query(`SELECT id FROM users WHERE username = $1`, [username]);
    if (userQuery.rows.length === 0) throw new Error('Username not found');
    const userId = userQuery.rows[0].id;
    return userId;
}