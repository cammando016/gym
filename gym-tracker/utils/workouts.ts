import { useAuth } from "@/contexts/AuthContext";
import { EditSplitPayload, FormPayload, LogWorkoutForm, LogWorkoutPayload, SplitFormPayload, WorkoutSession } from "@/types/workouts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, useQueryClient } from "@tanstack/react-query";

export const dbExerciseSearch = async (search: string) => {
    const res = await fetch(`http://localhost:3000/api/exercise?searchString=${encodeURIComponent(search)}`);
    return await res.json();
}

export const createWorkout = async (details: FormPayload) => {
    const res = await fetch(`http://localhost:3000/api/templates/create`, {
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

export const checkForActiveWorkout = async () => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/workouts/active`, {
        headers: { authorization: `Bearer ${token}`}
    });
    if (res.status === 200) { return await res.json(); }
    return null;
}

export const fetchWorkouts = async () => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/templates`, {
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

export const fetchLastThreeWorkouts = async () => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/workouts/last-three`, {
        headers: { Authorization: `Bearer ${token}`}
    });
    return await res.json();
}

export const createSplit = async (details: SplitFormPayload) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/splits/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`
        },
        body: JSON.stringify(details),
    })
    const response = await res.json();

    return {
        status: res.status,
        ...response
    }
}

export const editSplit = async (details: EditSplitPayload, splitId: string) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/splits/${splitId}/edit`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`
        },
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

export const resumeWorkout = async ( sessionId: string ) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/workouts/sessions/${sessionId}/resume`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`}
    });
    if (!res.ok) throw new Error('Failed to resume workout');
    return res.json();
}

export const fetchSession = async (sessionId : string): Promise<WorkoutSession> => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/workouts/sessions/${sessionId}`,{
        headers: {authorization: `Bearer ${token}`},
    });
    if (!res.ok) throw new Error(`Failed to load session (${res.status})`);
    return res.json();
}

export const viewWorkout = async (sessionId: string) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/workouts/sessions/${sessionId}/view`, {
        headers: { authorization: `Bearer ${token}`}
    });
    if (!res.ok) throw new Error(`Failed to load workout to view: (${res.status})`);

    const response = await res.json();
    console.log(response);
    return response;
}

export const completeWorkout = async ( details: LogWorkoutPayload, queryClient: QueryClient, username: string, duration: number ) => {
    const token = await AsyncStorage.getItem('token');
    const sessionId = details.workoutId;
    console.log(sessionId);
    const durationSeconds = Math.floor(duration/1000);

    const res = await fetch(`http://localhost:3000/api/workouts/sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...details, durationSeconds })
    });

    const response = await res.json();

    if (res.ok) {
        await queryClient.refetchQueries({ queryKey: ['lastTrained', username, details.templateId] })
    }
    return {
        status: res.status,
        ...response
    }
}

export const saveDraftToDb = async (sessionId: string, form: LogWorkoutForm, duration: number) => {
    const token = await AsyncStorage.getItem('token');
    const durationSeconds = Math.floor(duration/1000);
    await fetch (`http://localhost:3000/api/workouts/sessions/${sessionId}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ form, durationSeconds }),
    });
}