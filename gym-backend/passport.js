import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import dotenv from 'dotenv';
import pool from "./db/pool";

dotenv.config();

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
        try {
            const result = await pool.query('SELECT * FROM users WHERE id = $1', [jwt_payload.id]);
            if (result.rows.length > 0) {
                return done(null, result.rows[0]);
            }
            return done(null, false);
        } catch(error) {
            return done(error, false);
        }
    })
);

export default passport;