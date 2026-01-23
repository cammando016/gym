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

const muscleGroups = [
    {label: 'Arms', value: 'arms'},
    {label: 'Back', value: 'back'},
    {label: 'Chest', value: 'chest'},
    {label: 'Legs', value: 'legs'},
    {label: 'Other', value: 'other'}
] as const;
type MuscleGroups = typeof muscleGroups[number]['value'];

interface Muscle {
    name: string;
    id: string;
}

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
    targetMuscle?: string;
    isUnilateral: boolean;
}

interface CreatedExercise {
    name: string;
    targetMuscle: string;
    isUnilateral: boolean;
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
    exercise_name: string;
    muscle_name: string;
    exercise_id: number;
}

export { setTypes, SetType, muscleGroups, MuscleGroups, Muscle, WorkoutSet, Exercise, SetTracker, FormValues, privacyTypes, PrivacyType, ExerciseSearchResultType, CreatedExercise };
