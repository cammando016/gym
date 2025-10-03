const setTypes = [
    {label: 'Backoff', value: 'backoff'},
    {label: 'Working', value: 'working'},
    {label: 'Warmup', value: 'warmup'}    
] as const;
type SetType = typeof setTypes[number]['value'];

interface WorkoutSet {
    id: number;
    type: SetType;
}

interface Exercise {
    id: number;
    name: string;
    sets: WorkoutSet[];
}

interface SetTracker {
    exercise: number;
    set: number;
}

export { setTypes, SetType, WorkoutSet, Exercise, SetTracker };
