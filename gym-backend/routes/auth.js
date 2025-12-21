import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config();
import pool from '../db/pool.js'

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        console.log('Received signup request with details: ', req.body);
        //Get values from submitted request
        const { name, birthDay, birthMonth, birthYear, username, weight, weightUnit, benchPr, squatPr, deadPr, password } = req.body;
        if (!name || !birthDay || !birthMonth || !birthYear || !username || !weightUnit || !password) {
            throw new Error('Missing required fields');
        }
        //Create hash of password for db
        console.log('creating hash');
        const pwHash = await bcrypt.hash(password, 10);
        console.log('hash created')
        const creationDate = new Date();
        const birthdate = new Date(birthYear, birthMonth, birthDay);

        try {
            console.log('Attempting to insert user...');
            await pool.query(
                `INSERT INTO users
                (name, username, birthdate, created_at, weight, weight_unit, pr_bench, pr_deadlift, pr_squat, password)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [name, username, birthdate, creationDate, weight, weightUnit, benchPr, deadPr, squatPr, pwHash]
            )
            console.log('User successfully added to DB');
        } catch (error) {
            console.log('DB insert error:', error);
            return res.status(400).json({error: error.message});
        }

        return res.status(201).json({message: 'User Registered'})
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({error: error.message});
    }
})

router.post('/login', async (req, res) => {
    const {username, password} = req.body;
    try {
        const dbUserQuery = await pool.query('SELECT * FROM user WHERE username = $1', [username.toLowerCase()]);
        const user = dbUserQuery.rows[0];

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        else if (!(await bcrypt.compare(password, user.password))){
            return res.status(401).json({message: 'Invalid password'});
        }

        const token = jwt.sign({id: user.userid}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.status(200).json({
            message: 'Login Successful',
            token,
            user: {
                username: user.username,
                name: user.name,
            }
        })
    } catch(error) {
        return res.status(400).json({error: error.message});
    }
})

export default router;