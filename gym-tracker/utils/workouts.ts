import { FormPayload } from "@/types/workouts";

export const dbExerciseSearch = async (search: string) => {
    const res = await fetch(`http://localhost:3000/api/exercise?searchString=${encodeURIComponent(search)}`);
    return await res.json();
}

export const createWorkout = async (details: FormPayload) => {
    const res = await fetch(`http://localhost:3000/api/workouts/templates/create`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(details),
    })
    const response = await res.json();

    return {
        status: res.status,
        ...response
    }
};

export const fetchWorkouts = async (username: string) => {
    const res = await fetch(`http://localhost:3000/api/workouts?searchString=${encodeURIComponent(username)}`);
    return await res.json();
}