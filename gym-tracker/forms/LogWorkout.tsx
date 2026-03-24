import { Text, View, TextInput, ScrollView } from 'react-native';
import { useReducer, useState } from 'react';
import { LogWorkoutAction, LogWorkoutForm, WorkoutTemplateType, LoggedWorkoutExercise } from '@/types/workouts';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import LogExercise from './LogExercise';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';

interface Props {
    activeWorkout: boolean, //True for when logging working, false when viewing past workout
    sessionId: string,
    templateId: string
}

export default function LogWorkout (props: Props) {
    const { data: workouts } = useWorkoutTemplates();

    const workoutTemplate : WorkoutTemplateType | undefined = workouts?.find(w => w.workoutId === props.templateId);
    if (!workoutTemplate) return <View><Text>Loading Workout Template</Text></View>
    
    const { data: lastTrained } = useWorkoutHistory(props.templateId);

    const initialFormState: LogWorkoutForm = {
        values : {
            workoutNotes: '',
            exercises: workoutTemplate.exercises.map(e => {
                return {
                    exerciseId: e.exerciseId,
                    exerciseIndex: e.exerciseIndex,
                    exerciseNotes: '',
                    sets: e.sets.map(s => {
                        if (s.isUnilateralSet) return {
                            isUnilateral: true,
                            setIndex: s.setIndex,
                            setType: s.setType,
                            weight: 0,
                            setNotes: '',
                            usedBelt: false,
                            usedStraps: false,
                            reps: {
                                left: {
                                    fullReps: 0,
                                    assistedReps: 0,
                                    partialReps: 0
                                },
                                right: {
                                    fullReps: 0,
                                    assistedReps: 0,
                                    partialReps: 0
                                }
                            }
                        }
                        else return {
                            isUnilateral: false,
                            setIndex: s.setIndex,
                            setType: s.setType,
                            weight: 0,
                            setNotes: '',
                            usedBelt: false,
                            usedStraps: false,
                            reps: {
                                fullReps: 0,
                                assistedReps: 0,
                                partialReps: 0
                            }
                        }
                    })
                }
            }),
        }
    }

    const logWorkoutReducer = (state: LogWorkoutForm, action: LogWorkoutAction) => {
        switch (action.type) {
            case 'UPDATE_WORKOUT_NOTES': {
                return {
                    ...state,
                    values: {...state.values, workoutNotes: action.value}
                }
            }
            case 'UPDATE_EXERCISE_NOTES': {
                return {
                    ...state,
                    values: {
                        ...state.values, 
                        exercises: state.values.exercises.map(e => {
                            if(e.exerciseIndex !== action.exerciseIndex) return e
                            return {...e, exerciseNotes: action.value}
                        })
                    }
                }
            }
            // case 'UPDATE_SET_IS_UNILATERAL': { //STILL NEEDS TO HANDLE CHANGING REPS STRUCTURE BETWEEN BI/UNILATERAL
            //     return {
            //         ...state,
            //         values: {
            //             ...state.values,
            //             exercises: state.values.exercises.map(e => {
            //                 if(e.exerciseIndex === action.exerciseIndex) return {
            //                     ...e,
            //                     sets: e.sets.map(s => {
            //                         if (s.setIndex === action.setIndex) return {
            //                             ...s,
            //                             isUnilateral: action.value
            //                         }
            //                         return s
            //                     })
            //                 }
            //                 return e
            //             })
            //         }
            //     }
            // }
            case 'UPDATE_SET_TYPE' : {

            }
            case 'UPDATE_SET_WEIGHT': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex) return s
                                    return {
                                        ...s,
                                        weight: Number(action.value)
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_NOTES': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex) return s
                                    return {
                                        ...s,
                                        setNotes: action.value
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_BELT': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e 
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex) return s
                                    return {
                                        ...s,
                                        usedBelt: action.value
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_STRAPS': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex) return s 
                                    return {
                                        ...s,
                                        usedStraps: action.value
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_FULL_REPS': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e 
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex || s.isUnilateral) return s
                                    return {
                                        ...s,
                                        reps: {
                                            ...s.reps,
                                            fullReps: Number(action.value)
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_ASTD_REPS': {
            }
            case 'UPDATE_SET_PRTL_REPS': {
            }
            case 'UPDATE_SET_LEFT_FULL_REPS': {

            }
            case 'UPDATE_SET_LEFT_ASTD_REPS': {

            }
            case 'UPDATE_SET_LEFT_PRTL_REPS': {
                
            }
            case 'UPDATE_SET_RIGHT_FULL_REPS': {

            }
            case 'UPDATE_SET_RIGHT_ASTD_REPS': {

            }
            case 'UPDATE_SET_RIGHT_PRTL_REPS': {
                
            }

            default: return state;
        }
    }

    const [workoutForm, dispatch] = useReducer(logWorkoutReducer, initialFormState);

    return (
        <ScrollView>
            <View>
                <Text>Last {workoutTemplate?.workoutName} session notes: {lastTrained?.workoutNotes}</Text>
                <View>
                    {
                        workoutForm.values.exercises.map(e => {
                            return (
                                <LogExercise 
                                    key={e.exerciseId} 
                                    dispatch={dispatch} 
                                    exerciseData={e} 
                                    exerciseIndex={e.exerciseIndex} 
                                    activeWorkout={props.activeWorkout} 
                                    exerciseTemplate={workoutTemplate.exercises.find(exc => exc.exerciseId === e.exerciseId)!} 
                                    lastTrainedExercise={lastTrained?.exercises.find(exc => exc.exerciseId === e.exerciseId)}
                                ></LogExercise>)
                        })
                    }
                </View>
                <View>
                    <Text>Today's Workout Notes</Text>
                    <TextInput 
                        placeholder='Leave any notes from this workout for the next session here'
                        value={workoutForm.values.workoutNotes}
                        onChangeText={(s: string) => dispatch({ type: 'UPDATE_WORKOUT_NOTES', value: s })}
                    />
                </View>
            </View>
        </ScrollView>
    )
}