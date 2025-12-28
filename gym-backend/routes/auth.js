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
        const { name, birthday, username, weight, weightUnit, benchPr, squatPr, deadPr, password } = req.body;
        if (!name || !birthday || !username || !weightUnit || !password) {
            throw new Error('Missing required fields');
        }
        //Create hash of password for db
        const pwHash = await bcrypt.hash(password, 10);

        //Build array of provided PRs
        const benchDbId = '019ef03e-347f-4b1c-b58b-1ab9b6201b92'
        const deadDbId = '6ebc0990-4883-4f62-92b9-c2982e3f1bd1'
        const squatDbId = '8b24892e-6d79-4e0c-9e17-641530a4844c'
        const prList = [];
        if (benchPr > 0) prList.push({exerciseId: benchDbId, weight: benchPr});
        if (deadPr > 0) prList.push({exerciseId: deadDbId, weight: deadPr});
        if (squatPr > 0) prList.push({exerciseId: squatDbId, weight: squatPr});

        try {
            console.log('Attempting to insert user...');
            const newUser = await pool.query(
                `INSERT INTO users (name, username, birthdate, created_at, weight, weight_unit, password)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id`,
                [name.toLowerCase(), username.toLowerCase(), birthday, new Date(), weight, weightUnit, pwHash]
            )
            console.log('User successfully added to DB');

            const newUserId = newUser.rows[0].id;

            console.log('Attempting to add PRs to DB...');
            prList.map(async pr => {
                await pool.query(
                    `INSERT INTO users_prs (exercise_id, user_id, last_set, weight)
                    VALUES ($1, $2, $3, $4)`,
                    [pr.exerciseId, newUserId, new Date(), pr.weight]
                );
            })
            console.log('PRs added to DB');
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
    console.log('Received login request');
    const {username, password} = req.body;
    try {
        const dbUserQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username.toLowerCase()]);
        const user = dbUserQuery.rows[0];

        if (!user) {
            console.log('User not found');
            return res.status(404).json({error: 'User not found'});
        }
        else if (!(await bcrypt.compare(password, user.password))){
            console.log('Incorrect password');
            return res.status(401).json({error: 'Invalid password'});
        }

        console.log(user);

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.status(200).json({
            message: 'Login Successful',
            token,
            user: {
                username: user.username,
                name: user.name,
            }
        })
    } catch(error) {
        console.log(error);
        return res.status(400).json({error: error.message});
    }
})

export default router;