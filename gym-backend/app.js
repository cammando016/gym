import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import authRoutes from './routes/auth.js';

const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:8081' || 'exp://192.168.50.105:8081',
}));
app.use(express.json());
app.use(passport.initialize());
app.use('/api', authRoutes);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});