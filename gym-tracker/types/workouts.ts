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
    optionalSetModifiers: {
        unilateral: boolean,
        belt: boolean,
        straps: boolean,
    }
}

interface WorkoutTemplateType {
    workoutId: string;
    workoutName: string;
    privacy: string;
    isActive: boolean;
    exercises: {
        exerciseName: string;
        exerciseIndex: number;
        repRangeLower: number;
        repRangeUpper: number;
        exerciseId: string;
        exerciseNotes: string;
        unilateralExercise: boolean;
        optionalSetModifiers: {
            unilateral: boolean;
            belt: boolean;
            straps: boolean;
        };
        sets: {
            setType: SetType;
            setIndex: number;
            isUnilateralSet: boolean;
        } []
    } []
}

interface SplitDay {
    dayIndex: number;
    workoutTemplateId: string;
    workoutName: string;
    restDay: boolean;
}

interface SplitFormPayload {
    username: string,
    splitName: string,
    split: {
        workoutTemplateId: string,
        restDay: boolean,
        dayIndex: number
    } []
}

interface Split {
    isActive: boolean;
    splitId: string;
    splitName: string;
    workouts: {
        workoutId: string;
        workoutName: string;
        restDay: boolean;
        dayIndex: number;
    } []
}

interface UserSplits {
    splits: Split []
}

interface BaseLoggedSet {
    setIndex: number,
    setId: string,
    weight: number,
    setNotes?: string,
    setType: string,
    showSetTypeDropdown: boolean,
    usedBelt: boolean,
    usedStraps: boolean,
}

interface BilateralReps {
    fullReps: number,
    assistedReps: number,
    partialReps: number
}   

interface UnilateralSide {
    fullReps: number,
    assistedReps: number,
    partialReps: number
}

interface UnilateralReps {
    left: UnilateralSide,
    right: UnilateralSide
}

type BilateralSet = BaseLoggedSet & {
    isUnilateral: false,
    reps: BilateralReps
}

type UnilateralSet = BaseLoggedSet & {
    isUnilateral: true,
    reps: UnilateralReps
}

type LoggedWorkoutSet = BilateralSet | UnilateralSet

interface LoggedWorkoutExercise {
    exerciseId: string,
    exerciseIndex: number,
    exerciseNotes?: string,
    setupNotes: string,
    exerciseName: string,
    exerciseRepsLower: number,
    exerciseRepsUpper: number,
    unilateralExercise: boolean,
    changedExerciseIndex: {
        originalIndex: number,
        updatedExerciseIndex?: number,
    }
    optionalSetModifiers: {
        unilateral: boolean,
        belt: boolean,
        straps: boolean,
    },
    subbedExercise?: {
        subbedExerciseId: string,
        exerciseName: string,
        unilateralExercise: boolean,
        optionalSetModifiers: {
            unilateral: boolean,
            belt: boolean,
            straps: boolean
        }
    }
    sets: LoggedWorkoutSet [],
}

interface LoggedWorkout {
    dateEnded: Date,
    dateStarted: Date,
    id: string,
    workoutNotes?: string,
    exercises: LoggedWorkoutExercise [],
}

type LoggedSetError = {
    weight?: string,
    setNotes?: string,
    unilateralSet: false,
    fullReps?: string,
    assistedReps?: string,
    partialReps?: string,
} | {
    weight?: string, 
    setNotes?: string,
    unilateralSet: true,
    left: {
        fullReps?: string,
        assistedReps?: string,
        partialReps?: string,
    },
    right: {
        fullReps?: string,
        assistedReps?: string,
        partialReps?: string,
    }
}

interface LoggedExerciseError {
    exerciseNotes?: string,
    sets: LoggedSetError[]
}

interface LogWorkoutForm {
    values: {
        workoutNotes: string,
        exercises: LoggedWorkoutExercise [],
    },
    errors: {
        workoutNotes?: string,
        exercises: LoggedExerciseError[],
    }
}

interface activeSetType {
    activeExerciseId: string,
    activeSetType: string,
    activeSetIndex?: number
}

type LogWorkoutAction = 
| { type: 'UPDATE_WORKOUT_NOTES'; value: string }
| { type: 'UPDATE_EXERCISE_NOTES'; value: string; exerciseIndex: number }
| { type: 'TOGGLE_SET_UNILATERAL'; exerciseIndex: number; setIndex: number }
| { type: 'UPDATE_SET_TYPE'; value: SetType; exerciseIndex: number; setIndex: number }
| { type: 'UPDATE_SET_WEIGHT'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'UPDATE_SET_NOTES'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'UPDATE_SET_FULL_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'UPDATE_SET_ASTD_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'UPDATE_SET_PRTL_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'UPDATE_SET_LEFT_FULL_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'UPDATE_SET_LEFT_ASTD_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'UPDATE_SET_LEFT_PRTL_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'UPDATE_SET_RIGHT_FULL_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'UPDATE_SET_RIGHT_ASTD_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'UPDATE_SET_RIGHT_PRTL_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'TOGGLE_SET_TYPE_DROPDOWN'; exerciseIndex: number; setIndex: number }
| { type: 'TOGGLE_SET_USE_BELT'; exerciseIndex: number; setIndex: number }
| { type: 'TOGGLE_SET_USE_STRAPS'; exerciseIndex: number; setIndex: number }
| { type: 'SET_DROPDOWN_FALSE'; }
| { type: 'ADD_SET'; setIndexAddedAfter: number, exerciseIndex: number }
| { type: 'REMOVE_SET'; exerciseIndex: number; setIndex: number }
| { type: 'ADD_EXERCISE'; exerciseIndexAddedAfter: number, exerciseName: string, exericseId: string, repsLower: string, repsUpper: string, unilateralOption: boolean, beltOption: boolean, strapsOption: boolean, unilateralExercise: boolean }
| { type: 'REMOVE_EXERCISE'; exerciseIndex: number }
| { type: 'SUBSTITUTE_EXERCISE'; exerciseIndex: number, newExerciseId: string, exerciseName: string, unilateralExercise: boolean, unilateralOption: boolean, beltOption: boolean, strapsOption: boolean }
| { type: 'CLEAR_SUB'; exerciseIndex: number }
| { type: 'MOVE_EXERCISE_UP'; exerciseIndex: number }
| { type: 'MOVE_EXERCISE_DOWN'; exerciseIndex: number }
| { type: 'VALIDATE_WORKOUT_NOTES'; value: string }
| { type: 'VALIDATE_EXERCISE_NOTES'; value: string; exerciseIndex: number }
| { type: 'VALIDATE_SET_WEIGHT'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'VALIDATE_SET_NOTES'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'VALIDATE_FULL_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'VALIDATE_ASTD_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'VALIDATE_PRTL_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'VALIDATE_LEFT_FULL_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'VALIDATE_LEFT_ASTD_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'VALIDATE_LEFT_PRTL_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'VALIDATE_RIGHT_FULL_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'VALIDATE_RIGHT_ASTD_REPS'; value: string; exerciseIndex: number; setIndex: number }
| { type: 'VALIDATE_RIGHT_PRTL_REPS'; value: string; exerciseIndex: number; setIndex: number }

export { setTypes, SetType, muscleGroups, Muscle, WorkoutSet, Exercise, SetTracker, FormValues, FormStateWithValidation, privacyTypes, PrivacyType, ExerciseSearchResultType, CreatedExercise, WorkoutAction, ErrorShape, FormPayload, WorkoutTemplateType, SplitDay, SplitFormPayload, Split, UserSplits, LoggedWorkout, LoggedWorkoutExercise, LoggedWorkoutSet, LoggedExerciseError, LoggedSetError, LogWorkoutForm, LogWorkoutAction, activeSetType };