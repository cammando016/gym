const setTypes = [
    {label: 'Backoff', value: 'backoff'},
    {label: 'Top Set', value: 'topset'},
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

type WorkoutAction = 
| { type: 'SET_WORKOUT_NAME'; value: string }
| { type: 'VALIDATE_WORKOUT_NAME'; value: string }
| { type: 'SET_WORKOUT_PRIVACY'; value: PrivacyType } 
| { type: 'ADD_EXERCISE'; value: Exercise }
| { type: 'REMOVE_EXERCISE'; exerciseIndex: number }
| { type: 'SET_EXERCISE_NAME'; exerciseIndex: number; value: string }
| { type: 'VALIDATE_EXERCISE_NAME'; exerciseIndex: number, value: string }
| { type: 'SELECT_EXERCISE'; exerciseIndex: number; newFieldValues: { name: string; isUnilateral: boolean; dbId: string } }
| { type: 'SET_EXERCISE_REPS_TARGET_LOWER'; exerciseIndex: number; value: number }
| { type: 'VALIDATE_EXERCISE_REPS_TARGET_LOWER'; exerciseIndex: number; value: string }
| { type: 'SET_EXERCISE_REPS_TARGET_UPPER'; exerciseIndex: number; value: number }
| { type: 'VALIDATE_EXERCISE_REPS_TARGET_UPPER'; exerciseIndex: number; value: string; repsLower: string }
| { type: 'CREATE_DB_EXERCISE'; exerciseIndex: number }
| { type: 'SET_DB_EXERCISE_TARGET_MUSCLE'; exerciseIndex: number; value: string }
| { type: 'SET_DB_EXERCISE_UNILATERAL'; exerciseIndex: number; value: boolean }
| { type: 'CANCEL_CREATE_DB_EXERCISE'; exerciseIndex: number }
| { type: 'ADD_SET'; exerciseIndex: number; value: WorkoutSet }
| { type: 'REMOVE_SET'; exerciseIndex: number; setIndex: number }
| { type: 'SET_SET_TYPE'; exerciseIndex: number; setIndex: number; value: SetType }
| { type: 'SET_UNILATERAL_SET', exerciseIndex: number; setIndex: number; value: boolean }
| { type: 'RESET_FORM' }

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
    dbId: string;
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

interface ExerciseErrors {
    name?: string;
    repRangeLower?: string;
    repRangeUpper?: string;
}

interface FormStateWithValidation {
    values: FormValues;
    errors: {
        name?: string;
        exercises: ExerciseErrors[];
    }
}

interface ExerciseSearchResultType {
    exercise_name: string;
    exercise_unilateral: boolean;
    muscle_name: string;
    exercise_id: string;
}

export { setTypes, SetType, muscleGroups, MuscleGroups, Muscle, WorkoutSet, Exercise, SetTracker, FormValues, FormStateWithValidation, privacyTypes, PrivacyType, ExerciseSearchResultType, CreatedExercise, WorkoutAction };
