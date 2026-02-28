enum SetType {
    Amrap = 'amrap',
    Backoff = 'backoff',
    TopSet = 'topset',
    Working = 'working',
    Warmup = 'warmup',
}

const setTypes = [
    {label: 'AMRAP', value: SetType.Amrap},
    {label: 'Backoff', value: SetType.Backoff},
    {label: 'Top Set', value: SetType.TopSet},
    {label: 'Warmup', value: SetType.Warmup},
    {label: 'Working', value: SetType.Working}    
];

enum PrivacyType {
    Private = 'private',
    Friends = 'friends',
    Public = 'public'
}

const privacyTypes = [
    {label: 'Private', value: PrivacyType.Private},
    {label: 'Friends', value: PrivacyType.Friends},
    {label: 'Public', value: PrivacyType.Public}
];

const muscleGroups: dictionary[] = [
    {label: 'Arms', value: 'arms'},
    {label: 'Back', value: 'back'},
    {label: 'Chest', value: 'chest'},
    {label: 'Legs', value: 'legs'},
    {label: 'Other', value: 'other'}
];

type dictionary = {label: string, value: string};

type WorkoutAction = 
| { type: 'SET_WORKOUT_NAME'; value: string }
| { type: 'VALIDATE_WORKOUT_NAME'; value: string }
| { type: 'SET_WORKOUT_PRIVACY'; value: string } 
| { type: 'ADD_EXERCISE'; value: Exercise }
| { type: 'REMOVE_EXERCISE'; exerciseIndex: number }
| { type: 'SET_EXERCISE_NAME'; exerciseIndex: number; value: string }
| { type: 'VALIDATE_EXERCISE_NAME'; exerciseIndex: number, value: string }
| { type: 'SELECT_EXERCISE'; exerciseIndex: number; newFieldValues: { name: string; isUnilateral: boolean; dbId: string } }
| { type: 'SET_EXERCISE_REPS_TARGET_LOWER'; exerciseIndex: number; value: string }
| { type: 'VALIDATE_EXERCISE_REPS_TARGET_LOWER'; exerciseIndex: number; value: string }
| { type: 'SET_EXERCISE_REPS_TARGET_UPPER'; exerciseIndex: number; value: string }
| { type: 'VALIDATE_EXERCISE_REPS_TARGET_UPPER'; exerciseIndex: number; value: string; repsLower: string }
| { type: 'CREATE_DB_EXERCISE'; exerciseIndex: number }
| { type: 'SET_DB_EXERCISE_TARGET_MUSCLE'; exerciseIndex: number; value: string }
| { type: 'SET_DB_EXERCISE_UNILATERAL'; exerciseIndex: number; value: boolean }
| { type: 'SET_DB_SET_OPTIONAL_UNILATERAL'; exerciseIndex: number; value: boolean }
| { type: 'SET_DB_SET_OPTIONAL_STRAPS'; exerciseIndex: number; value: boolean }
| { type: 'SET_DB_SET_OPTIONAL_BELT'; exerciseIndex: number; value: boolean }
| { type: 'CANCEL_CREATE_DB_EXERCISE'; exerciseIndex: number }
| { type: 'ADD_SET'; exerciseIndex: number; value: WorkoutSet }
| { type: 'REMOVE_SET'; exerciseIndex: number; setIndex: number }
| { type: 'SET_SET_TYPE'; exerciseIndex: number; setIndex: number; value: SetType }
| { type: 'SET_UNILATERAL_SET', exerciseIndex: number; setIndex: number; value: boolean }
| { type: 'VALIDATE_FULL_FORM' }
| { type: 'RESET_FORM' }

interface Muscle {
    name: string;
    id: string;
}

interface WorkoutSet {
    id: number;
    type: string;
    isUnilateral: boolean;
}

interface Exercise {
    index: number;
    dbId: string;
    name: string;
    repRangeLower: string;
    repRangeHigher: string;
    sets: WorkoutSet[];
    targetMuscle?: string;
    isUnilateral: boolean;
    setOptionalUnilateral: boolean;
    setOptionalStraps: boolean;
    setOptionalBelt: boolean;
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
    privacy: string;
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

interface FormPayload {
    username: string;
    workoutName: string;
    privacy: string;
    exercises: {
        index: number,
        dbId: string | null,
        exerciseName: string,
        repRangeLower: number,
        repRangeHigher: number,
        targetMuscle: string | undefined,
        unilateralExercise: boolean,
        setOptionalUnilateral: boolean,
        setOptionalStraps: boolean,
        setOptionalBelt: boolean,
        sets: {
            index: number,
            setType: string,
            unilateralSet: boolean
        }[]
    }[]
}

interface ErrorShape {
    name?: string,
    exercises: ExerciseErrors[]
}

interface ExerciseSearchResultType {
    exercise_name: string;
    exercise_unilateral: boolean;
    muscle_name: string;
    exercise_id: string;
}

export { setTypes, SetType, muscleGroups, Muscle, WorkoutSet, Exercise, SetTracker, FormValues, FormStateWithValidation, privacyTypes, PrivacyType, ExerciseSearchResultType, CreatedExercise, WorkoutAction, ErrorShape, FormPayload };
