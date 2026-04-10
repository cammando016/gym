import { Text, View, TextInput, ScrollView, Pressable } from 'react-native';
import { useReducer, useState } from 'react';
import { activeSetType, LogWorkoutAction, LogWorkoutForm, WorkoutTemplateType } from '@/types/workouts';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import LogExercise from './LogExercise';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { randomUUID } from 'expo-crypto'
import LastTrainedSet from '@/components/LastTrainedSet';
import layoutStyles from '@/styles/layoutStyles';
import { validateOptionalAlphanumericSymbolsField, validateOptionalNumericField, validateRequiredNumericField } from '@/utils/formValiditors';
import workoutStyles from '@/styles/workouts';

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

    //Track the current focused set for showing the matching set from last session
    const [activeSet, setActiveSet] = useState<activeSetType>({activeExerciseId: workoutTemplate.exercises[0].exerciseId, activeSetType: 'working', activeSetIndex: 0})
    const updateActiveSet = (exerciseId: string, setId: string, setType: string) => {
        //Check exercise is in previous session at all
        const exerciseFromLastTrained = lastTrained?.exercises.find(e => e.exerciseId === exerciseId);
        if (!exerciseFromLastTrained) {setActiveSet({activeExerciseId: exerciseId, activeSetType: setType, activeSetIndex: undefined}); return;}
 
        //If exercise found, check for any logged sets (should never be null, no exercise should be logged without sets but fallback for possible error in previous log)
        const lastSessionSets = lastTrained?.exercises.find(e => e.exerciseId === exerciseId)?.sets;
        if (!lastSessionSets) {setActiveSet({activeExerciseId: exerciseId, activeSetType: setType, activeSetIndex: undefined}); return;}

        //Get which index of the specific set type the clicked set in current workout is (ie 5th overall set but 3rd working set returns index: 2)
        const currentSessionSetIndex = workoutForm.values.exercises.find(e => e.exerciseId === exerciseId)?.sets.filter(s => s.setType === setType).findIndex(st => st.setId === setId);
        if (currentSessionSetIndex === undefined || currentSessionSetIndex === -1) {setActiveSet({activeExerciseId: exerciseId, activeSetType: setType, activeSetIndex: undefined}); return}
 
        //Check if there was a matching index set from last trained.
        //If user on 3rd working set this workout, but last session only logged 2 working sets, will return undefined
        if (lastSessionSets.filter(s => s.setType === setType)[currentSessionSetIndex]) {
            setActiveSet({
                activeExerciseId: exerciseFromLastTrained.exerciseId, 
                activeSetType: setType,
                activeSetIndex: currentSessionSetIndex
            });
            return;
        }

        setActiveSet({activeExerciseId: exerciseId, activeSetType: setType, activeSetIndex: undefined});
    }

    //Used to toggle last session set display between single set and all sets of an exercise
    const [fullPastSetList, setFullPastSetList] = useState<boolean>(false);
    const toggleFullPastSetList = () => setFullPastSetList(!fullPastSetList)

    const initialFormState: LogWorkoutForm = {
        values : {
            workoutNotes: '',
            exercises: workoutTemplate.exercises.map(e => {
                return {
                    exerciseId: e.exerciseId,
                    exerciseIndex: e.exerciseIndex,
                    exerciseName: e.exerciseName,
                    exerciseRepsLower: e.repRangeLower,
                    exerciseRepsUpper: e.repRangeUpper,
                    setupNotes: e.exerciseNotes,
                    exerciseNotes: '',
                    changedExerciseIndex: {
                        originalIndex: e.exerciseIndex
                    },
                    optionalSetModifiers: {
                        unilateral: e.optionalSetModifiers.unilateral,
                        belt: e.optionalSetModifiers.belt,
                        straps: e.optionalSetModifiers.straps
                    },
                    unilateralExercise: e.unilateralExercise,
                    sets: e.sets.map(s => {
                        if (s.isUnilateralSet || e.unilateralExercise) return {
                            isUnilateral: true,
                            setIndex: s.setIndex,
                            setId: randomUUID(),
                            setType: s.setType,
                            showSetTypeDropdown: false,
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
                            setId: randomUUID(),
                            setType: s.setType,
                            showSetTypeDropdown: false,
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
        },
        errors: {
            workoutNotes: undefined,
            exercises: workoutTemplate.exercises.map(e => {
                return {
                    exerciseNotes: undefined,
                    sets: e.sets.map(s => {
                        if (s.isUnilateralSet || e.unilateralExercise) return {
                            weight: undefined,
                            setNotes: undefined,
                            unilateralSet: true,
                            left: {
                                fullReps: undefined,
                                assistedReps: undefined,
                                partialReps: undefined,
                            },
                            right: {
                                fullReps: undefined,
                                assistedReps: undefined,
                                partialReps: undefined,
                            }
                        }
                        else return {
                            weight: undefined,
                            setNotes: undefined,
                            unilateralSet: false,
                            fullReps: undefined,
                            assistedReps: undefined,
                            partialReps: undefined
                        }
                    })
                }
            })
        }
    }

    const logWorkoutReducer = (state: LogWorkoutForm, action: LogWorkoutAction) : LogWorkoutForm => {
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
            case 'TOGGLE_SET_UNILATERAL': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if(e.exerciseIndex !== action.exerciseIndex) return e
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex) return s 
                                    else if (s.isUnilateral) return {
                                        ...s,
                                        isUnilateral: false,
                                        reps: {
                                            fullReps: 0,
                                            assistedReps: 0,
                                            partialReps: 0
                                        }
                                    }
                                    return {
                                        ...s,
                                        isUnilateral: true,
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
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_TYPE' : {
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
                                        setType: action.value
                                    }
                                })
                            }
                        })
                    }
                }
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
                                            assistedReps: Number(action.value)
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_PRTL_REPS': {
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
                                            partialReps: Number(action.value)
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_LEFT_FULL_REPS': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e 
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex || !s.isUnilateral) return s
                                    return {
                                        ...s,
                                        reps: {
                                            ...s.reps,
                                            left: {
                                                ...s.reps.left,
                                                fullReps: Number(action.value)
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_LEFT_ASTD_REPS': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e 
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex || !s.isUnilateral) return s
                                    return {
                                        ...s,
                                        reps: {
                                            ...s.reps,
                                            left: {
                                                ...s.reps.left,
                                                assistedReps: Number(action.value)
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_LEFT_PRTL_REPS': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e 
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex || !s.isUnilateral) return s
                                    return {
                                        ...s,
                                        reps: {
                                            ...s.reps,
                                            left: {
                                                ...s.reps.left,
                                                partialReps: Number(action.value)
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_RIGHT_FULL_REPS': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e 
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex || !s.isUnilateral) return s
                                    return {
                                        ...s,
                                        reps: {
                                            ...s.reps,
                                            right: {
                                                ...s.reps.right,
                                                fullReps: Number(action.value)
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_RIGHT_ASTD_REPS': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e 
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex || !s.isUnilateral) return s
                                    return {
                                        ...s,
                                        reps: {
                                            ...s.reps,
                                            right: {
                                                ...s.reps.right,
                                                assistedReps: Number(action.value)
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_RIGHT_PRTL_REPS': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e 
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex || !s.isUnilateral) return s
                                    return {
                                        ...s,
                                        reps: {
                                            ...s.reps,
                                            right: {
                                                ...s.reps.right,
                                                partialReps: Number(action.value)
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'TOGGLE_SET_TYPE_DROPDOWN': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex === action.exerciseIndex) return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex === action.setIndex) return {
                                        ...s,
                                        showSetTypeDropdown: !s.showSetTypeDropdown
                                    }
                                    if (!s.showSetTypeDropdown) return s
                                    return {
                                        ...s,
                                        showSetTypeDropdown: false
                                    }
                                })
                            }
                            if (e.sets.every(s => !s.showSetTypeDropdown)) return e
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (!s.showSetTypeDropdown) return s
                                    return {...s, showSetTypeDropdown: false}
                                })
                            }
                        }) 
                    }
                }
            }
            case 'SET_DROPDOWN_FALSE': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            return {
                                ...e,
                                sets: e.sets.map(s => {return {...s, showSetTypeDropdown: false}})
                            }
                        })
                    }
                }
            }
            case 'TOGGLE_SET_USE_BELT': {
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
                                        usedBelt: !s.usedBelt
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'TOGGLE_SET_USE_STRAPS': {
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
                                        usedStraps: !s.usedStraps
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'ADD_SET': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e
                            return {
                                ...e,
                                sets: [
                                    ...e.sets.slice(0, action.setIndexAddedAfter + 1),
                                    e.unilateralExercise ? 
                                    {
                                        isUnilateral: true,
                                        setIndex: action.setIndexAddedAfter + 1,
                                        setId: randomUUID(),
                                        setType: 'working',
                                        showSetTypeDropdown: false,
                                        weight: 0,
                                        setNotes: '',
                                        usedBelt: false,
                                        usedStraps: false,
                                        reps: {
                                            left: { fullReps: 0, assistedReps: 0, partialReps: 0 },
                                            right: { fullReps: 0, assistedReps: 0, partialReps: 0 }
                                        }
                                    } :
                                    {
                                        isUnilateral: false,
                                        setIndex: action.setIndexAddedAfter + 1,
                                        setId: randomUUID(),
                                        setType: 'working',
                                        showSetTypeDropdown: false,
                                        weight: 0,
                                        setNotes: '',
                                        usedBelt: false,
                                        usedStraps: false,
                                        reps: {
                                            fullReps: 0,
                                            assistedReps: 0,
                                            partialReps: 0
                                        }

                                    },
                                    ...e.sets.slice(action.setIndexAddedAfter + 1).map(st => {
                                        return {
                                            ...st,
                                            setIndex: st.setIndex + 1
                                        }
                                    })
                                ]
                            }
                        })
                    }
                }
            }
            case 'REMOVE_SET': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e
                            return {
                                ...e,
                                sets: e.sets.filter(s => s.setIndex !== action.setIndex).map(st => {
                                    if (st.setIndex < action.setIndex) return st
                                    return {
                                        ...st,
                                        setIndex: st.setIndex - 1
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'ADD_EXERCISE': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: [
                            ...state.values.exercises.slice(0, action.exerciseIndexAddedAfter + 1),
                            {
                                exerciseId: action.exericseId,
                                exerciseName: action.exerciseName,
                                exerciseIndex: action.exerciseIndexAddedAfter + 1,
                                setupNotes: '',
                                exerciseRepsLower: Number(action.repsLower),
                                exerciseRepsUpper: Number(action.repsUpper),
                                unilateralExercise: action.unilateralExercise,
                                changedExerciseIndex: {
                                    originalIndex: action.exerciseIndexAddedAfter + 1,
                                },
                                optionalSetModifiers: {
                                    unilateral: action.unilateralOption,
                                    belt: action.beltOption,
                                    straps: action.strapsOption
                                },
                                sets: action.unilateralExercise ?
                                    [{
                                        isUnilateral: true,
                                        setIndex: 0,
                                        setId: randomUUID(),
                                        setType: 'working',
                                        showSetTypeDropdown: false,
                                        weight: 0,
                                        setNotes: '',
                                        usedBelt: false,
                                        usedStraps: false,
                                        reps: {
                                            left: { fullReps: 0, assistedReps: 0, partialReps: 0 },
                                            right: { fullReps: 0, assistedReps: 0, partialReps: 0 }
                                        }
                                    }] 
                                    :
                                    [{
                                        isUnilateral: false,
                                        setIndex: 0,
                                        setId: randomUUID(),
                                        setType: 'working',
                                        showSetTypeDropdown: false,
                                        weight: 0,
                                        setNotes: '',
                                        usedBelt: false,
                                        usedStraps: false,
                                        reps: {
                                            fullReps: 0,
                                            assistedReps: 0,
                                            partialReps: 0
                                        }
                                    }]
                            },
                            ...state.values.exercises.slice(action.exerciseIndexAddedAfter + 1).map(e => {
                                return {
                                    ...e,
                                    exerciseIndex: e.exerciseIndex + 1,
                                    changedExerciseIndex: {
                                        ...e.changedExerciseIndex,
                                        updatedExerciseIndex: e.exerciseIndex + 1
                                    }
                                }
                            })
                        ]
                    }
                }
            }
            case 'REMOVE_EXERCISE': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.filter(e => e.exerciseIndex !== action.exerciseIndex).map(ex => {
                            if (ex.exerciseIndex < action.exerciseIndex) return ex
                            return {
                                ...ex,
                                exerciseIndex: ex.exerciseIndex - 1
                            }
                        })
                    }
                }
            }
            case 'SUBSTITUTE_EXERCISE': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e
                            return {
                                ...e,
                                subbedExercise: {
                                    subbedExerciseId: action.newExerciseId,
                                    exerciseName: action.exerciseName,
                                    unilateralExercise: action.unilateralExercise,
                                    optionalSetModifiers: {
                                        unilateral: action.unilateralOption,
                                        belt: action.beltOption,
                                        straps: action.strapsOption,
                                    }
                                },
                                sets: e.sets.map(s => {
                                    if (s.isUnilateral === action.unilateralExercise) return s
                                    if (action.unilateralExercise) return {
                                        ...s,
                                        isUnilateral: true,
                                        reps: {
                                            left: { fullReps: 0, assistedReps: 0, partialReps: 0 },
                                            right: { fullReps: 0, assistedReps: 0, partialReps: 0 }
                                        }
                                    }
                                    return {
                                        ...s,
                                        isUnilateral: false,
                                        reps: { fullReps: 0, assistedReps: 0, partialReps: 0 }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'CLEAR_SUB': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e
                            return {
                                ...e, 
                                subbedExercise: undefined,
                                sets: e.sets.map(s => {
                                    if (s.isUnilateral === e.unilateralExercise) return s
                                    if (e.unilateralExercise) return {
                                        ...s,
                                        isUnilateral: true,
                                        reps: {
                                            left: { fullReps: 0, assistedReps: 0, partialReps: 0 },
                                            right: { fullReps: 0, assistedReps: 0, partialReps: 0 }
                                        }
                                    }
                                    return {
                                        ...s,
                                        isUnilateral: false,
                                        reps: { fullReps: 0, assistedReps: 0, partialReps: 0 }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'MOVE_EXERCISE_UP': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex === action.exerciseIndex) return {
                                ...e,
                                exerciseIndex: action.exerciseIndex - 1,
                                changedExerciseIndex: {
                                    ...e.changedExerciseIndex,
                                    updatedExerciseIndex: action.exerciseIndex - 1
                                }
                            }
                            if (e.exerciseIndex === action.exerciseIndex - 1) return {
                                ...e,
                                exerciseIndex: action.exerciseIndex,
                                changedExerciseIndex: {
                                    ...e.changedExerciseIndex,
                                    updatedExerciseIndex: action.exerciseIndex
                                }
                            }
                            return e
                        })
                    }
                }
            }
            case 'MOVE_EXERCISE_DOWN': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex === action.exerciseIndex) return {
                                ...e,
                                exerciseIndex: action.exerciseIndex + 1,
                                changedExerciseIndex: {
                                    ...e.changedExerciseIndex,
                                    updatedExerciseIndex: action.exerciseIndex + 1
                                }
                            }
                            if (e.exerciseIndex === action.exerciseIndex + 1) return {
                                ...e,
                                exerciseIndex: action.exerciseIndex,
                                changedExerciseIndex: {
                                    ...e.changedExerciseIndex,
                                    updatedExerciseIndex: action.exerciseIndex
                                }
                            }
                            return e
                        })
                    }
                }
            }
            case 'VALIDATE_WORKOUT_NOTES': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        workoutNotes: validateOptionalAlphanumericSymbolsField(action.value, 'Workout Notes')
                    }
                }
            }
            case 'VALIDATE_EXERCISE_NOTES': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                exerciseNotes: validateOptionalAlphanumericSymbolsField(action.value, 'Exercise Notes')
                            }
                        })
                    }
                }
            }
            case 'VALIDATE_SET_NOTES': {
                return {
                    ...state,
                    errors: {
                        ...state.errors, 
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if (action.setIndex !== j) return s
                                    return {
                                        ...s,
                                        setNotes: validateOptionalAlphanumericSymbolsField(action.value, 'Set Notes')
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'VALIDATE_SET_WEIGHT': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if (action.setIndex !== j) return s
                                    return {
                                        ...s,
                                        weight: validateRequiredNumericField(action.value, 'Set Weight')
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'VALIDATE_FULL_REPS': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if (action.setIndex !== j) return s
                                    return {
                                        ...s,
                                        fullReps: validateOptionalNumericField(action.value, 'Full Reps')
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'VALIDATE_ASTD_REPS': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if (action.setIndex !== j) return s
                                    return {
                                        ...s,
                                        assistedReps: validateOptionalNumericField(action.value, 'Assisted Reps')
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'VALIDATE_PRTL_REPS': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if (action.setIndex !== j) return s
                                    return {
                                        ...s,
                                        partialReps: validateOptionalNumericField(action.value, 'Partial Reps')
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'VALIDATE_LEFT_FULL_REPS': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if (action.setIndex !== j) return s
                                    if (!s.unilateralSet) return s
                                    return {
                                        ...s,
                                        left: {
                                            ...s.left,
                                            fullReps: validateOptionalNumericField(action.value, 'Left Full Reps')
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'VALIDATE_LEFT_ASTD_REPS': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if (action.setIndex !== j) return s
                                    if (!s.unilateralSet) return s
                                    return {
                                        ...s,
                                        left: {
                                            ...s.left,
                                            assistedReps: validateOptionalNumericField(action.value, 'Left Assisted Reps')
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'VALIDATE_LEFT_PRTL_REPS': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if (action.setIndex !== j) return s
                                    if (!s.unilateralSet) return s
                                    return {
                                        ...s,
                                        left: {
                                            ...s.left,
                                            partialReps: validateOptionalNumericField(action.value, 'Left Partial Reps')
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'VALIDATE_RIGHT_FULL_REPS': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if (action.setIndex !== j) return s
                                    if (!s.unilateralSet) return s
                                    return {
                                        ...s,
                                        right: {
                                            ...s.right,
                                            fullReps: validateOptionalNumericField(action.value, 'Right Full Reps')
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'VALIDATE_RIGHT_ASTD_REPS': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if (action.setIndex !== j) return s
                                    if (!s.unilateralSet) return s
                                    return {
                                        ...s,
                                        right: {
                                            ...s.right,
                                            assistedReps: validateOptionalNumericField(action.value, 'Right Assisted Reps')
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'VALIDATE_RIGHT_PRTL_REPS': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if (action.setIndex !== j) return s
                                    if (!s.unilateralSet) return s
                                    return {
                                        ...s,
                                        right: {
                                            ...s.right,
                                            partialReps: validateOptionalNumericField(action.value, 'Right Partial Reps')
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            default: return state;
        }
    }

    const [workoutForm, dispatch] = useReducer(logWorkoutReducer, initialFormState);

    return (
        <ScrollView>
            <View>
                <Text>Last {workoutTemplate?.workoutName} session notes: {lastTrained?.workoutNotes}</Text>
                <View style={[layoutStyles.rowFlex]}>
                    <View>
                        {
                            fullPastSetList ? (
                                lastTrained?.exercises.filter(e => e.exerciseId === activeSet.activeExerciseId)[0].sets.map(s => {
                                    return (
                                        <LastTrainedSet 
                                            key={s.setId}
                                            lastTrainedSet={lastTrained.exercises.filter(e => e.exerciseId === activeSet.activeExerciseId)[0].sets[s.setIndex]}
                                            activeSetIndex={s.setIndex}
                                            allSets={fullPastSetList}
                                        />
                                    )
                                })
                            ) : (
                                activeSet.activeSetIndex !== undefined ? 
                                    <LastTrainedSet
                                        lastTrainedSet={lastTrained?.exercises.filter(e => e.exerciseId === activeSet.activeExerciseId)[0].sets.filter(s => s.setType === activeSet.activeSetType)[activeSet.activeSetIndex]}
                                        activeSetIndex={activeSet.activeSetIndex}
                                        allSets={fullPastSetList}
                                    />
                                : (
                                    <View><Text>No matching set from past workout </Text></View>
                                )
                            )
                        }
                    </View>
                    <Pressable onPress={toggleFullPastSetList}>
                        <Text>Toggle</Text>
                    </Pressable>
                </View>
                <View>
                    {
                        workoutForm.values.exercises.slice().sort((a, b) => a.exerciseIndex - b.exerciseIndex).map((e, i) => {
                            return (
                                <LogExercise 
                                    key={e.exerciseId} 
                                    dispatch={dispatch} 
                                    exerciseData={e}
                                    activeWorkout={props.activeWorkout} 
                                    exerciseCount={workoutForm.values.exercises.length}
                                    lastTrainedExercise={lastTrained?.exercises.find(exc => exc.exerciseId === e.exerciseId)}
                                    updateActiveSet={updateActiveSet}
                                    exerciseErrors={workoutForm.errors.exercises[i]}
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
                        onEndEditing={(event) => { console.log(event.nativeEvent.text); dispatch({ type: 'VALIDATE_WORKOUT_NOTES', value: event.nativeEvent.text }) } }
                    />
                    {workoutForm.errors.workoutNotes && <Text style={[workoutStyles.errorText]}>{workoutForm.errors.workoutNotes}</Text>}
                </View>
            </View>
        </ScrollView>
    )
}