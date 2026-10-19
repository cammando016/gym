import express from 'express';
import cors from 'cors';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import exerciseRoutes from './routes/exercises.js';
import workoutRoutes from './routes/workouts.js';
import userRoutes from './routes/users.js';
import splitRoutes from './routes/splits.js';
import templateRoutes from './routes/templates.js';

const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:8081' || 'exp://192.168.50.105:8081',
}));
app.use(express.json());
app.use(passport.initialize());
app.use('/api', authRoutes);
app.use('/api', exerciseRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/users', userRoutes);
app.use('/api/splits', splitRoutes);
app.use('/api/templates', templateRoutes);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});