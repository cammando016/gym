const setTypes = [
    {label: 'Backoff', value: 'backoff'},
    {label: 'Working', value: 'working'},
    {label: 'Warmup', value: 'warmup'}    
] as const;
type SetType = typeof setTypes[number]['value'];

const privacyTypes = [
    {label: 'Private', value: 'private'},
    {label: 'Friends', value: 'friends'},
    {label: 'Public', value: 'public'}
] as const;
type PrivacyType = typeof privacyTypes[number]['value'];

interface WorkoutSet {
    id: number;
    type: SetType;
    isUnilateral: boolean;
}

interface Exercise {
    index: number;
    dbId: number;
    name: string;
    repRangeLower: number;
    repRangeHigher: number;
    sets: WorkoutSet[];
}

interface SetTracker {
    exercise: number;
    set: number;
}

interface FormValues {
    name: string;
    privacy: PrivacyType;
    exercises: Exercise[];
}

interface ExerciseSearchResultType {
    name: string;
    targetMuscle: string;
}

export { setTypes, SetType, WorkoutSet, Exercise, SetTracker, FormValues, privacyTypes, PrivacyType, ExerciseSearchResultType };
