import { Exercise, WorkoutSet, SetTracker, PrivacyType, WorkoutAction, FormStateWithValidation } from '@/types/workouts';
import { useRef, useState, useReducer } from 'react';
import { Button, Text, TextInput, View, ScrollView, StyleSheet } from 'react-native';
import { RadioButton } from 'react-native-paper';
import NewExercise from './NewExercise';
import { validateRequiredAlphanumericSymbolsField, validateRequiredAlphabeticalSpacesField, validateOptionalIntegerField, validateUpperRepsTarget } from '../utils/formValiditors';

export default function WorkoutForm () {
    //State objects for tracking number of sets and exercises, and tracking current exercise/set being interacted with by user
    const exerciseIndex = useRef<number>(1);
    const [activeSet, setActiveSet] = useState<SetTracker>({exercise: 0, set: 0});
    const [activeExercise, setActiveExercise] = useState<number>(0);
    const setCounters = useRef<Record<number, number>>({0: 1});

    //Starting empty form for use in reducer and resetting form
    const initialFormState: FormStateWithValidation = { 
        values: {
            name: '', 
            privacy: PrivacyType.Private, 
            exercises: [{ 
                index: 0, 
                dbId: '', 
                name: '', 
                repRangeLower: 0, 
                repRangeHigher: 0, 
                isUnilateral: false, 
                setOptionalUnilateral: false,
                setOptionalStraps: false,
                setOptionalBelt: false,
                sets: [{ 
                    id: 0, 
                    type: 'working', 
                    isUnilateral: false 
                }] 
            }] 
        },
        errors: {
            name: undefined,
            exercises: [
                {
                    name: undefined,
                    repRangeLower: undefined,
                    repRangeUpper: undefined,
                }
            ]
        }
    };

    const workoutReducer = (state: FormStateWithValidation, action: WorkoutAction) : FormStateWithValidation => {
        switch(action.type) {
            case 'SET_WORKOUT_NAME': {
                return {
                    ...state,
                    values: {...state.values, name: action.value}
                };
            }
            case 'VALIDATE_WORKOUT_NAME': {
                const validation = validateRequiredAlphanumericSymbolsField(action.value.trim(), 'Workout Name');
                return {
                    ...state,
                    errors: {...state.errors, name: validation}
                }
            }
            case 'SET_WORKOUT_PRIVACY': {
                return {
                    ...state,
                    values: {...state.values, privacy: action.value}
                };
            }
            case 'ADD_EXERCISE': {
                return {
                    ...state,
                    values: {...state.values, exercises: [...state.values.exercises, action.value]},
                    errors: {...state.errors, exercises: [...state.errors.exercises, 
                        { name: undefined, repRangeLower: undefined, repRangeUpper: undefined }
                    ]}
                };
            }
            case 'REMOVE_EXERCISE': {
                const exerciseArrayIndex = state.values.exercises.findIndex(exc => exc.index === action.exerciseIndex);
                return {
                    ...state,
                    values: {...state.values, exercises: state.values.exercises.filter(exc => exc.index != action.exerciseIndex)},
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.filter((_, i) => i !== exerciseArrayIndex)
                    }
                };
            }
            case 'SET_EXERCISE_NAME': {
                return {
                    ...state,
                    values: {...state.values, exercises: state.values.exercises.map(exc => {
                        if (exc.index === action.exerciseIndex) return {...exc, name: action.value};
                        return exc;
                    })}
                };
            }
            case 'VALIDATE_EXERCISE_NAME': {
                const validation = validateRequiredAlphabeticalSpacesField(action.value.trim(), 'Exercise Name');
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((err, i) => {
                            if (state.values.exercises[i].index === action.exerciseIndex) return {...err, name: validation}
                            return {...err}
                        })
                    }
                }
            }
            case 'SELECT_EXERCISE': {
                return {
                    ...state,
                    values: {...state.values, exercises: state.values.exercises.map(exc => {
                        if (exc.index === action.exerciseIndex) return {
                            ...exc,
                            name: action.newFieldValues.name,
                            isUnilateral: action.newFieldValues.isUnilateral,
                            dbId: action.newFieldValues.dbId
                        };
                        return exc;
                    })}
                };
            }
            case 'SET_EXERCISE_REPS_TARGET_LOWER': {
                return {
                    ...state,
                    values: {...state.values, exercises: state.values.exercises.map(exc => {
                        if (exc.index === action.exerciseIndex) return {...exc, repRangeLower: action.value};
                        return exc;
                    })}
                };
            }
            case 'VALIDATE_EXERCISE_REPS_TARGET_LOWER': {
                const validation = validateOptionalIntegerField(action.value, 'Lower Rep Range');
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((err, i) => {
                            if (state.values.exercises[i].index === action.exerciseIndex) return {...err, repRangeLower: validation} 
                            return {...err}
                        })
                    }
                }
            }
            case 'SET_EXERCISE_REPS_TARGET_UPPER': {
                return {
                    ...state,
                    values: {...state.values, exercises: state.values.exercises.map(exc => {
                        if (exc.index === action.exerciseIndex) return {...exc, repRangeHigher: action.value};
                        return exc;
                    })}
                };
            }
            case 'VALIDATE_EXERCISE_REPS_TARGET_UPPER': {
                const validation = validateUpperRepsTarget(action.value, action.repsLower);
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((err, i) => {
                            if (state.values.exercises[i].index === action.exerciseIndex) return {...err, repRangeUpper: validation}
                            return {...err}
                        })
                    }
                }
            }
            case 'CREATE_DB_EXERCISE': {
                return {
                    ...state,
                    values: {...state.values, exercises: state.values.exercises.map(exc => {
                        if (exc.index === action.exerciseIndex) return {...exc, targetMuscle: '41c6578d-a82a-48f2-a815-d7a1953510b2', dbId: ''};
                        return exc;
                    })}
                }
            }
            case 'SET_DB_EXERCISE_TARGET_MUSCLE': {
                return {
                    ...state,
                    values: {...state.values, exercises: state.values.exercises.map(exc => {
                        if (exc.index === action.exerciseIndex) return {...exc, targetMuscle: action.value};
                        return exc;
                    })}
                };
            }
            case 'SET_DB_EXERCISE_UNILATERAL': {
                return {
                    ...state,
                    values: {...state.values, exercises: state.values.exercises.map(exc => {
                        if (exc.index === action.exerciseIndex) return {...exc, isUnilateral: action.value };
                        return exc;
                    })}
                };
            }
            case 'SET_DB_SET_OPTIONAL_UNILATERAL': {
                return {
                    ...state,
                    values: {...state.values, exercises: state.values.exercises.map(exc => {
                        if (exc.index === action.exerciseIndex) return {...exc, setOptionalUnilateral: action.value};
                        return exc;
                    })}
                }
            }
            case 'SET_DB_SET_OPTIONAL_STRAPS': {
                return {
                    ...state,
                    values: {...state.values, exercises: state.values.exercises.map(exc => {
                        if (exc.index === action.exerciseIndex) return {...exc, setOptionalStraps: action.value};
                        return exc;
                    })}
                }
            }
            case 'SET_DB_SET_OPTIONAL_BELT': {
                return {
                    ...state,
                    values: {...state.values, exercises: state.values.exercises.map(exc => {
                        if (exc.index === action.exerciseIndex) return {...exc, setOptionalBelt: action.value};
                        return exc;
                    })}
                }
            }
            case 'CANCEL_CREATE_DB_EXERCISE': {
                return {
                    ...state,
                    values: {...state.values, exercises: state.values.exercises.map(exc => {
                        if (exc.index === action.exerciseIndex) return {...exc, isUnilateral: false, targetMuscle: '', name: '' };
                        return exc;
                    })}
                };
            }
            case 'ADD_SET': {
                return {
                    ...state,
                    values: {...state.values, exercises: state.values.exercises.map(exc => {
                        if (exc.index === action.exerciseIndex) return { ...exc, sets: [...exc.sets, action.value]};
                        return exc;
                    })}
                };
            }
            case 'REMOVE_SET': {
                return {
                    ...state,
                    values: {...state.values, exercises: state.values.exercises.map(exc => {
                        if (exc.index === action.exerciseIndex) return { ...exc, sets: exc.sets.filter(set => set.id !== action.setIndex) };
                        return exc;
                    })}
                };
            }
            case 'SET_SET_TYPE': {
                return {
                    ...state,
                    values: {...state.values, exercises: state.values.exercises.map(exc => {
                        if (exc.index === action.exerciseIndex) return { ...exc, sets: exc.sets.map(s => {
                            if (s.id === action.setIndex) return { ...s, type: action.value };
                            return s;
                        })}
                        return exc;
                    })}
                }
            }
            case 'SET_UNILATERAL_SET': {
                return {
                    ...state,
                    values: {...state.values, exercises: state.values.exercises.map(exc => {
                        if (exc.index === action.exerciseIndex) return { ...exc, sets: exc.sets.map(s => {
                            if (s.id === action.setIndex) return {...s, isUnilateral: action.value };
                            return s;
                        })}
                        return exc;
                    })}
                };
            }
            case 'VALIDATE_FULL_FORM': {

            }
            case 'RESET_FORM': {
                return initialFormState;
            }
            
            default: return state;
        }
    }

    const [form, dispatch] = useReducer(workoutReducer, initialFormState);

    //Passed down to NewSet to show only one set type drop down at a time
    const updateActiveSet = (exerciseId: number, setId: number) => setActiveSet({exercise: exerciseId, set: setId});
    const updateActiveExercise = (exerciseIndex: number) => setActiveExercise(exerciseIndex);

    //Add new exercise to workout
    const handleAddExercise = () => {
        const newId = exerciseIndex.current;
        setCounters.current[newId] = 1;

        const newExercise: Exercise = {
            index: exerciseIndex.current,
            dbId: '',
            name: '',
            repRangeLower: 0,
            repRangeHigher: 0,
            isUnilateral: false,
            setOptionalUnilateral: false,
            setOptionalStraps: false,
            setOptionalBelt: false,
            sets: [{id: 0, type: 'working', isUnilateral: false}]
        };

        exerciseIndex.current++;

        dispatch({ type: 'ADD_EXERCISE', value: newExercise });
    }
    //Add new set to specific exercise in workout
    const handleAddSet = (exerciseId: number) => {
        const nextSetId = setCounters.current[exerciseId] ?? 0;
        setCounters.current[exerciseId] = nextSetId + 1;

        const newSet: WorkoutSet = {id: nextSetId, type: 'working', isUnilateral: false}

        dispatch({ type: 'ADD_SET', value: newSet, exerciseIndex: exerciseId });
    }
    //Remove an exercise from workout
    const handleRemoveExercise = (exerciseId: number) => {
        delete setCounters.current[exerciseId];
        dispatch({ type: 'REMOVE_EXERCISE', exerciseIndex: exerciseId });
    }

    // <-------- TO COMPLETE: FORM SUBMISSION FUNCTION --------->
    const simSubmit = () => {
        alert(JSON.stringify(form));
    }
    // <-------- TO COMPLETE: MOVE STYLES TO EXTERNAL FILE -------->
    const styles = StyleSheet.create({
        privacy: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-evenly'
        },
        errorDescription: {
            color: 'red',
        },
    })

    return (
        <View>
            <ScrollView>
                <View>
                    <Text>Workout Name</Text>
                    <TextInput 
                        placeholder='Enter workout name'
                        value={form.values.name}
                        onChangeText={(text: string) => dispatch({ type: 'SET_WORKOUT_NAME', value: text })}
                        onEndEditing={() => dispatch({ type: 'VALIDATE_WORKOUT_NAME', value: form.values.name })}
                    />
                    {form.errors.name && <Text style={[styles.errorDescription]}>{form.errors.name}</Text>}
                </View>
                
                <RadioButton.Group onValueChange={(newValue: string) => dispatch({ type: 'SET_WORKOUT_PRIVACY', value: newValue })} value={form.values.privacy}>
                    <View style={[styles.privacy]}>
                        <View>
                            <Text>Private</Text>
                            <RadioButton value={PrivacyType.Private}/>
                        </View>
                        <View>
                            <Text>Friends</Text>
                            <RadioButton value={PrivacyType.Friends}/>
                        </View>
                        <View>
                            <Text>Public</Text>
                            <RadioButton value={PrivacyType.Public}/>
                        </View>
                    </View>
                </RadioButton.Group>

                <View>
                    <View id='exercises'>
                        {
                            form.values.exercises.map((exercise, i) => {
                                return <NewExercise key={exercise.index} exerciseErrors={form.errors.exercises[i]} updateForm={dispatch} exercise={exercise} exerciseCount={Object.keys(setCounters.current).length} removeExc={handleRemoveExercise} addSet={handleAddSet} activeSet={activeSet} activeExercise={activeExercise} updateActiveSet={updateActiveSet} updateActiveExercise={updateActiveExercise}></NewExercise>
                            })
                        }
                    </View>

                    <View>
                        <Button title='Add Exercise' onPress={handleAddExercise} />
                    </View>
                </View>

                <View style={{display: 'flex', flexDirection: 'row'}}>
                    <Button title='Cancel' />
                    {/* Still need to make sure reset clears set and exercise id counters */}
                    <Button title='Reset Form' onPress={() => dispatch({ type: 'RESET_FORM' })} />
                    <Button title='Submit' onPress={simSubmit} />
                </View>
            </ScrollView>
        </View>
    )
}