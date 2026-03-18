import { FormPayload, SplitFormPayload } from "@/types/workouts";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

export const fetchWorkouts = async () => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/workouts/templates`, {
        headers: { Authorization: `Bearer ${token}`}
    });
    return await res.json();
}

export const fetchLastTrained = async (workoutId: string) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/workouts/${workoutId}/last`, {
        headers: { Authorization: `Bearer ${token}`}
    });
    return await res.json();
}

export const createSplit = async (details: SplitFormPayload) => {
    const res = await fetch(`http://localhost:3000/api/workouts/split/create`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(details),
    })
    const response = await res.json();

    return {
        status: res.status,
        ...response
    }
}

export const startWorkout = async ( templateId : string ) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/workouts/sessions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({templateId}),
    })
    if(!res.ok) throw new Error('Failed to start workout');
    return res.json();
}