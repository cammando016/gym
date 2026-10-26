import { Text, View, TextInput, Pressable, AppState } from 'react-native';
import { useReducer, useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { activeSetType, LoggedWorkoutExercise, LogWorkoutAction, LogWorkoutForm, LogWorkoutPayload, LogWorkoutRef, WorkoutSession, WorkoutTemplateType } from '@/types/workouts';
import LogExercise from './LogExercise';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { randomUUID } from 'expo-crypto'
import LastTrainedSet from '@/components/LastTrainedSet';
import layoutStyles from '@/styles/layoutStyles';
import { validateOptionalAlphanumericSymbolsField, validateOptionalNumericField, validateRequiredNumericField } from '@/utils/formValiditors';
import workoutStyles from '@/styles/workouts';
import { completeWorkout } from '@/utils/workouts';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { RenderItemParams, ShadowDecorator, NestableScrollContainer, NestableDraggableFlatList } from 'react-native-draggable-flatlist';
import { buildInitialForm } from '@/utils/buildLogWorkoutForm';
import dayjs from 'dayjs';

interface Props {
    session: WorkoutSession,
    template: WorkoutTemplateType,
    lastTrained?: ReturnType<typeof useWorkoutHistory>['data'],
    draft: LogWorkoutForm | null,
    saveDraft: (form: LogWorkoutForm, duration: number) => Promise<void>,
    clearDraft: () => Promise<void>,
}

const LogWorkout = forwardRef<LogWorkoutRef, Props>((props, ref) => {
    useImperativeHandle(ref, () => ({
        handleSubmit
    }));
    
    const router = useRouter();
    const isActive = props.session.status === 'active'; //Only 'active' status workouts are editable

    //Passed in to the completeWorkout function in handleSubmit to invalidate lastTrained data on home page, once new workout is logged
    const { user } = useAuth()
    const queryClient = useQueryClient();

    //Determine elapsed duration of workout, excluding any time paused based on dateResumed
    const hasResumed : boolean = props.session.dateResumed !== null;
    const durationMs : number = props.session.duration * 1000;
    const calculateElapsedDuration = () => {
        return hasResumed ?
        dayjs().diff(dayjs(props.session.dateResumed)) + durationMs :
        dayjs().diff(dayjs(props.session.dateStarted))
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
                                        reps: { fullReps: '0', assistedReps: '0', partialReps: '0', rir: '0', rpe: '0' }
                                    }
                                    return {
                                        ...s,
                                        isUnilateral: true,
                                        reps: {
                                            left: { fullReps: '0', assistedReps: '0', partialReps: '0', rir: '0', rpe: '0' },
                                            right: { fullReps: '0', assistedReps: '0', partialReps: '0', rir: '0', rpe: '0' }
                                        }
                                    }
                                })
                            }
                        })
                    },
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if (action.setIndex !== j) return s
                                    if (s.unilateralSet) return {
                                        ...s,
                                        key: randomUUID(),
                                        unilateralSet: false,
                                        fullReps: undefined,
                                        partialReps: undefined,
                                        assistedReps: undefined
                                    }
                                    return {
                                        ...s,
                                        key: randomUUID(),
                                        unilateralSet: true,
                                        left: { fullReps: undefined, partialReps: undefined, assistedReps: undefined },
                                        right: { fullReps: undefined, partialReps: undefined, assistedReps: undefined },
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
                                        weight: action.value
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
                                            fullReps: action.value
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
                                            assistedReps: action.value
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
                                            partialReps: action.value
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_RIR': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e;
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex || s.isUnilateral) return s;
                                    return {
                                        ...s,
                                        reps: {
                                            ...s.reps,
                                            rir: action.value
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_RPE': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e;
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex || s.isUnilateral) return s;
                                    return {
                                        ...s,
                                        reps: {
                                            ...s.reps,
                                            rpe: action.value
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
                                                fullReps: action.value
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
                                                assistedReps: action.value
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
                                                partialReps: action.value
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_LEFT_RIR': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e;
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex || !s.isUnilateral) return s;
                                    return {
                                        ...s,
                                        reps: {
                                            ...s.reps,
                                            left: {
                                                ...s.reps.left,
                                                rir: action.value
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_LEFT_RPE': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e;
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex || !s.isUnilateral) return s;
                                    return {
                                        ...s,
                                        reps: {
                                            ...s.reps,
                                            left: {
                                                ...s.reps.left,
                                                rpe: action.value
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
                                                fullReps: action.value
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
                                                assistedReps: action.value
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
                                                partialReps: action.value
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_RIGHT_RIR': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e;
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex || !s.isUnilateral) return s;
                                    return {
                                        ...s,
                                        reps: {
                                            ...s.reps,
                                            right: {
                                                ...s.reps.right,
                                                rir: action.value
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'UPDATE_SET_RIGHT_RPE': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map(e => {
                            if (e.exerciseIndex !== action.exerciseIndex) return e;
                            return {
                                ...e,
                                sets: e.sets.map(s => {
                                    if (s.setIndex !== action.setIndex || !s.isUnilateral) return s;
                                    return {
                                        ...s,
                                        reps: {
                                            ...s.reps,
                                            right: {
                                                ...s.reps.right,
                                                rpe: action.value
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
                                        weight: '0',
                                        setNotes: '',
                                        usedBelt: false,
                                        usedStraps: false,
                                        reps: {
                                            left: { fullReps: '0', assistedReps: '0', partialReps: '0', rir: '0', rpe: '0' },
                                            right: { fullReps: '0', assistedReps: '0', partialReps: '0', rir: '0', rpe: '0' }
                                        }
                                    } :
                                    {
                                        isUnilateral: false,
                                        setIndex: action.setIndexAddedAfter + 1,
                                        setId: randomUUID(),
                                        setType: 'working',
                                        showSetTypeDropdown: false,
                                        weight: '0',
                                        setNotes: '',
                                        usedBelt: false,
                                        usedStraps: false,
                                        reps: { fullReps: '0', assistedReps: '0', partialReps: '0', rir: '0', rpe: '0' }
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
                    },
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                sets: [
                                    ...e.sets.slice(0, action.setIndexAddedAfter + 1),
                                    state.values.exercises[i].unilateralExercise ? {
                                        key: randomUUID(),
                                        weight: undefined,
                                        setNotes: undefined,
                                        setIndex: action.setIndexAddedAfter + 1,
                                        unilateralSet: true,
                                        left: { fullReps: undefined, assistedReps: undefined, partialReps: undefined },
                                        right: { fullReps: undefined, assistedReps: undefined, partialReps: undefined }
                                    } : {
                                        key: randomUUID(),
                                        weight: undefined,
                                        setNotes: undefined,
                                        setIndex: action.setIndexAddedAfter + 1,
                                        unilateralSet: false,
                                        fullReps: undefined,
                                        assistedReps: undefined,
                                        partialReps: undefined,
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
                    },
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                sets: e.sets.filter((_, j) => action.setIndex !== j).map(st => {
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
                const newKey = randomUUID();
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: [
                            ...state.values.exercises.slice(0, action.exerciseIndexAddedAfter + 1),
                            {
                                key: newKey,
                                exerciseId: action.exericseId,
                                exerciseName: action.exerciseName,
                                exerciseIndex: action.exerciseIndexAddedAfter + 1,
                                exerciseNotes: '',
                                setupNotes: '',
                                exerciseRepsLower: Number(action.repsLower),
                                exerciseRepsUpper: Number(action.repsUpper),
                                unilateralExercise: action.unilateralExercise,
                                setsHidden: false,
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
                                        weight: '0',
                                        setNotes: '',
                                        usedBelt: false,
                                        usedStraps: false,
                                        reps: {
                                            left: { fullReps: '0', assistedReps: '0', partialReps: '0', rir: '0', rpe: '0' },
                                            right: { fullReps: '0', assistedReps: '0', partialReps: '0', rir: '0', rpe: '0' }
                                        }
                                    }] 
                                    :
                                    [{
                                        isUnilateral: false,
                                        setIndex: 0,
                                        setId: randomUUID(),
                                        setType: 'working',
                                        showSetTypeDropdown: false,
                                        weight: '0',
                                        setNotes: '',
                                        usedBelt: false,
                                        usedStraps: false,
                                        reps: { fullReps: '0', assistedReps: '0', partialReps: '0', rir: '0', rpe: '0' }
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
                    },
                    errors: {
                        ...state.errors,
                        exercises: [
                            ...state.errors.exercises.slice(0, action.exerciseIndexAddedAfter + 1),
                            {
                                key: newKey,
                                exerciseNotes: undefined,
                                exerciseIndex: action.exerciseIndexAddedAfter + 1,
                                sets: action.unilateralExercise ? [{
                                    setNotes: undefined,
                                    key: randomUUID(),
                                    setIndex: 0,
                                    weight: undefined,
                                    unilateralSet: true,
                                    left: { fullReps: undefined, assistedReps: undefined, partialReps: undefined },
                                    right: { fullReps: undefined, assistedReps: undefined, partialReps: undefined }
                                }] : [{
                                    key: randomUUID(),
                                    setNotes: undefined,
                                    setIndex: 0,
                                    weight: undefined,
                                    unilateralSet: false,
                                    fullReps: undefined,
                                    assistedReps: undefined,
                                    partialReps: undefined
                                }]
                            },
                            ...state.errors.exercises.slice(action.exerciseIndexAddedAfter + 1).map(e => {
                                return {
                                    ...e,
                                    exerciseIndex: e.exerciseIndex + 1
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
                    },
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.filter((_, i) => action.exerciseIndex !== i).map(ex => {
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
                                    if (action.unilateralExercise) return {
                                        ...s,
                                        isUnilateral: true,
                                        reps: {
                                            left: { fullReps: '0', assistedReps: '0', partialReps: '0', rir: '0', rpe: '0' },
                                            right: { fullReps: '0', assistedReps: '0', partialReps: '0', rir: '0', rpe: '0' }
                                        }
                                    }
                                    return {
                                        ...s,
                                        isUnilateral: false,
                                        reps: { fullReps: '0', assistedReps: '0', partialReps: '0', rir: '0', rpe: '0' }
                                    }
                                })
                            }
                        })
                    },
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                exerciseNotes: undefined,
                                sets: e.sets.map((s) => {
                                    if (action.unilateralExercise) return {
                                        ...s,
                                        weight: undefined,
                                        setNotes: undefined,
                                        unilateralSet: true,
                                        left: { fullReps: undefined, assistedReps: undefined, partialReps: undefined },
                                        right: { fullReps: undefined, assistedReps: undefined, partialReps: undefined }
                                    }
                                    return {
                                        ...s,
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
                                    if (e.unilateralExercise) return {
                                        ...s,
                                        isUnilateral: true,
                                        reps: {
                                            left: { fullReps: '0', assistedReps: '0', partialReps: '0', rir: '0', rpe: '0' },
                                            right: { fullReps: '0', assistedReps: '0', partialReps: '0', rir: '0', rpe: '0' }
                                        }
                                    }
                                    return {
                                        ...s,
                                        isUnilateral: false,
                                        reps: { fullReps: '0', assistedReps: '0', partialReps: '0', rir: '0', rpe: '0' }
                                    }
                                })
                            }
                        })
                    },
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e
                            return {
                                ...e,
                                exerciseNotes: undefined,
                                sets: e.sets.map((s) => {
                                    if (state.values.exercises[i].unilateralExercise) return {
                                        ...s,
                                        weight: undefined,
                                        setNotes: undefined,
                                        unilateralSet: true,
                                        left: { fullReps: undefined, assistedReps: undefined, partialReps: undefined },
                                        right: { fullReps: undefined, assistedReps: undefined, partialReps: undefined }
                                    }
                                    return {
                                        ...s,
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
            }
            case 'REORDER_EXERCISES': {
                return {
                    ...state,
                    values: { ...state.values, exercises: action.newExerciseOrder },
                    errors: { ...state.errors, exercises: action.newErrorOrder }
                }
            }
            case 'TOGGLE_SHOW_SETS': {
                return {
                    ...state,
                    values: {
                        ...state.values,
                        exercises: state.values.exercises.map((e) => {
                            if (action.exerciseIndex !== e.exerciseIndex) return e;
                            return {
                                ...e,
                                setsHidden: !e.setsHidden
                            }
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
            case 'VALIDATE_RIR': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e;
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if(action.setIndex !== j) return s;
                                    return {
                                        ...s,
                                        rir: validateOptionalNumericField(action.value, 'Reps in Reserve')
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'VALIDATE_RPE': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e;
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if(action.setIndex !== j) return s;
                                    return {
                                        ...s,
                                        rpe: validateOptionalNumericField(action.value, 'RPE')
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
            case 'VALIDATE_LEFT_RIR': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e;
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if (action.setIndex !== j) return s;
                                    if (!s.unilateralSet) return s;
                                    return {
                                        ...s,
                                        left: {
                                            ...s.left,
                                            rir: validateOptionalNumericField(action.value, 'Left Reps in Reserve')
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'VALIDATE_LEFT_RPE': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e;
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if (action.setIndex !== j) return s;
                                    if (!s.unilateralSet) return s;
                                    return {
                                        ...s,
                                        left: {
                                            ...s.left,
                                            rpe: validateOptionalNumericField(action.value, 'Left RPE')
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
            case 'VALIDATE_RIGHT_RIR': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e;
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if (action.setIndex !== j) return s;
                                    if (!s.unilateralSet) return s;
                                    return {
                                        ...s,
                                        right: {
                                            ...s.right,
                                            rir: validateOptionalNumericField(action.value, 'Right Reps in Reserve')
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'VALIDATE_RIGHT_RPE': {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        exercises: state.errors.exercises.map((e, i) => {
                            if (action.exerciseIndex !== i) return e;
                            return {
                                ...e,
                                sets: e.sets.map((s, j) => {
                                    if (action.setIndex !== j) return s;
                                    if (!s.unilateralSet) return s;
                                    return {
                                        ...s,
                                        right: {
                                            ...s.right,
                                            rpe: validateOptionalNumericField(action.value, 'Right RPE')
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            }
            case 'VALIDATE_ALL': {
                return {
                    ...state,
                    errors: {
                        workoutNotes: validateOptionalAlphanumericSymbolsField(state.values.workoutNotes, 'Workout Notes'),
                        exercises: state.errors.exercises.map(e => {
                            const exerciseValues = state.values.exercises.find(ev => ev.exerciseIndex === e.exerciseIndex)!;
                            return {
                                ...e,
                                exerciseNotes: validateOptionalAlphanumericSymbolsField(exerciseValues.exerciseNotes, 'Exercise Notes'),
                                sets: e.sets.map((s, i) => {
                                    const setValues = exerciseValues.sets[i];
                                    if (setValues.isUnilateral) {
                                        return {
                                            ...s,
                                            weight: validateRequiredNumericField(setValues.weight, 'Set Weight'),
                                            setNotes: validateOptionalAlphanumericSymbolsField(setValues.setNotes, 'Set Notes'),
                                            left: {
                                                fullReps: validateOptionalNumericField(setValues.reps.left.fullReps, 'Left Full Reps'),
                                                assistedReps: validateOptionalNumericField(setValues.reps.left.assistedReps, 'Left Assisted Reps'),
                                                partialReps: validateOptionalNumericField(setValues.reps.left.partialReps, 'Left Partial Reps'),
                                                rir: validateOptionalNumericField(setValues.reps.left.rir, 'Left Reps in Reserve'),
                                                rpe: validateOptionalNumericField(setValues.reps.left.rpe, 'Left RPE')
                                            },
                                            right: {
                                                fullReps: validateOptionalNumericField(setValues.reps.right.fullReps, 'Right Full Reps'),
                                                assistedReps: validateOptionalNumericField(setValues.reps.right.assistedReps, 'Right Assisted Reps'),
                                                partialReps: validateOptionalNumericField(setValues.reps.right.partialReps, 'Right Partial Reps'),
                                                rir: validateOptionalNumericField(setValues.reps.right.rir, 'Right Reps in Reserve'),
                                                rpe: validateOptionalNumericField(setValues.reps.right.rpe, 'Right RPE')
                                            }
                                        }
                                    }
                                    return {
                                        ...s,
                                        weight: validateRequiredNumericField(setValues.weight, 'Set Weight'),
                                        setNotes: validateOptionalAlphanumericSymbolsField(setValues.setNotes, 'Set Notes'),
                                        fullReps: validateOptionalNumericField(setValues.reps.fullReps, 'Full Reps'),
                                        assistedReps: validateOptionalNumericField(setValues.reps.assistedReps, 'Assisted Reps'),
                                        partialReps: validateOptionalNumericField(setValues.reps.partialReps, 'Partial Reps'),
                                        rir: validateOptionalNumericField(setValues.reps.rir, 'Reps in Reserve'),
                                        rpe: validateOptionalNumericField(setValues.reps.rpe, 'RPE')
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

    const [workoutForm, dispatch] = useReducer(
        logWorkoutReducer,
        undefined,
        () => (isActive && props.draft) || buildInitialForm(props.template)
    )

    //Used to toggle last session set display between single set and all sets of an exercise
    const [fullPastSetList, setFullPastSetList] = useState<boolean>(false);
    const toggleFullPastSetList = () => setFullPastSetList(!fullPastSetList);

    //Track the current focused set for showing the matching set from last session
    const [activeSet, setActiveSet] = useState<activeSetType>({activeExerciseId: workoutForm.values.exercises[0].exerciseId, activeSetType: 'working', activeSetIndex: 0})
    const updateActiveSet = async (exerciseId: string, setId: string, setType: string) => {
        props.saveDraft(workoutForm, calculateElapsedDuration()).catch(console.error); //Any time the user changes to a different set, update async storage draft workout

        //Get sets from exercise if exercise was done in previous workout (lastTrained)
        const lastSets = props.lastTrained?.exercises.find(e => e.exerciseId === exerciseId)?.sets;
        const currentIndex = workoutForm.values.exercises
            .find(e => e.exerciseId === exerciseId)
            ?.sets.filter(s => s.setType === setType)
            .findIndex(s => s.setId === setId)
        ;

        //Check if the lastTrained sets included a matching set type and index, ie 2nd working set
        const hasMatchingSet = currentIndex !== undefined && currentIndex >= 0 && !!lastSets?.filter(s => s.setType === setType)[currentIndex];

        setActiveSet({
            activeExerciseId: exerciseId,
            activeSetType: setType,
            activeSetIndex: hasMatchingSet ? currentIndex : undefined
        })
    }

    const errorCheck = () => {
        if (workoutForm.errors.workoutNotes) return true;
      
        return workoutForm.errors.exercises.some(e => {
          if (e.exerciseNotes) return true;
      
          return e.sets.some(s => {
            if (s.setNotes || s.weight) return true;
            if (s.unilateralSet) {
              return !!(s.left.fullReps || s.left.assistedReps || s.left.partialReps || s.left.rir || s.left.rpe
                || s.right.fullReps || s.right.assistedReps || s.right.partialReps || s.right.rir || s.right.rpe);
            }
            return !!(s.fullReps || s.assistedReps || s.partialReps || s.rir || s.rpe);
          });
        });
    };

    const handleSubmit = async () => {
        //Check for any form errors before continuing with form submission
        dispatch({ type: 'VALIDATE_ALL' });
        const hasErrors = errorCheck();
        if (hasErrors) {
            alert('Please fix input errors to submit workout')
            return
        }
        
        //Get required data for DB submission from form values
        const formPayload : LogWorkoutPayload = {
            templateId: props.session.templateId,
            workoutId: props.session.sessionId,
            workoutNotes: workoutForm.values.workoutNotes,
            exercises: workoutForm.values.exercises.filter(exc => 
                exc.sets.some(s => {
                    if (s.isUnilateral) {
                        return (
                            s.weight !== '0' ||
                            s.reps.left.fullReps !== '0' ||
                            s.reps.left.assistedReps !== '0' ||
                            s.reps.left.partialReps !== '0' ||
                            s.reps.right.fullReps !== '0' ||
                            s.reps.right.assistedReps !== '0' ||
                            s.reps.right.partialReps !== '0'
                    )}
                    return (
                        s.weight !== '0' ||
                        s.reps.fullReps !== '0' ||
                        s.reps.assistedReps !== '0' ||
                        s.reps.partialReps !== '0'
                    )
                })
            ).map(e => {
                return {
                    exerciseIndex: e.exerciseIndex,
                    exerciseId: e.subbedExercise?.subbedExerciseId ? e.subbedExercise.subbedExerciseId : e.exerciseId,
                    exerciseNotes: e.exerciseNotes,
                    exerciseSubbed: e.subbedExercise === undefined ? false : true,
                    sets: e.sets.filter(st => 
                        st.isUnilateral ? (
                            st.weight !== '0' ||
                            st.reps.left.fullReps !== '0' ||
                            st.reps.left.assistedReps !== '0' ||
                            st.reps.left.partialReps !== '0' ||
                            st.reps.right.fullReps !== '0' ||
                            st.reps.right.assistedReps !== '0' ||
                            st.reps.right.partialReps !== '0'
                        ) : (
                            st.weight !== '0' ||
                            st.reps.fullReps !== '0' ||
                            st.reps.assistedReps !== '0' ||
                            st.reps.partialReps !== '0'
                        )
                    ).map(s => {
                        if (s.isUnilateral) {
                            return {
                                setIndex: s.setIndex,
                                setWeight: Number(s.weight),
                                setNotes: s.setNotes,
                                setType: s.setType,
                                setUsedStraps: s.usedStraps,
                                setUsedBelt: s.usedBelt,
                                setUnilateral: true,
                                left: {
                                    fullReps: Number(s.reps.left.fullReps),
                                    partialReps: Number(s.reps.left.partialReps),
                                    assistedReps: Number(s.reps.left.assistedReps)
                                },
                                right: {
                                    fullReps: Number(s.reps.right.fullReps),
                                    partialReps: Number(s.reps.right.partialReps),
                                    assistedReps: Number(s.reps.right.assistedReps)
                                }
                            }
                        }
                        return {
                            setIndex: s.setIndex,
                            setWeight: Number(s.weight),
                            setNotes: s.setNotes,
                            setType: s.setType,
                            setUsedStraps: s.usedStraps,
                            setUsedBelt: s.usedBelt,
                            setUnilateral: false,
                            fullReps: Number(s.reps.fullReps),
                            partialReps: Number(s.reps.partialReps),
                            assistedReps: Number(s.reps.assistedReps)
                        }
                    })
                }
            })
        }

        const result = await completeWorkout(formPayload, queryClient, user?.username!, calculateElapsedDuration());
        if (result.status === 201) {
            await props.clearDraft();
            router.replace('/(protected)/(tabs)');
        }
    }

    //Save form state to async storage if app state changes before workout is completed, ie closed mid workout
    const workoutFormRef = useRef(workoutForm);

    useEffect(() => {
        workoutFormRef.current = workoutForm;
    }, [workoutForm]);
    useEffect(() => {
        if (!isActive) return;
        const subscription = AppState.addEventListener('change', state => {
            if (state === 'background' || state === 'inactive') props.saveDraft(workoutFormRef.current, calculateElapsedDuration())
        });
        return () => subscription.remove();
    }, [isActive, props.saveDraft]);

    const activeLastExercise = props.lastTrained?.exercises.find(e => e.exerciseId === activeSet.activeExerciseId);
    const activeLastSet = 
        activeSet.activeSetIndex !== undefined
        ? activeLastExercise?.sets.filter(s => s.setType === activeSet.activeSetType)[activeSet.activeSetIndex]
        : undefined
    ;

    //Reordering exercises drag and drop
    const handleExerciseReorder = ({ data } : { data: LoggedWorkoutExercise[] }) => {
        const reorderedExercises = data.map((e, i) => ({
            ...e,
            exerciseIndex: i
        }))

        const reorderedErrors = data.map((exc, ind) => {
            const matchingError = workoutForm.errors.exercises.find(err => err.key === exc.key);
            return {
                ...matchingError!,
                exerciseIndex: ind
            }
        })

        dispatch({ type: 'REORDER_EXERCISES', newExerciseOrder: reorderedExercises, newErrorOrder: reorderedErrors });
    }

    const renderExerciseItem = ({ item, drag, isActive: isDragging } : RenderItemParams<LoggedWorkoutExercise>) => {
        return (
            <ShadowDecorator>
                <View style={workoutStyles.exerciseContainer}>
                    <View style={[workoutStyles.exerciseHeader, layoutStyles.rowFlex]}>
                        <Pressable
                            onPress={() => dispatch({ type: 'REMOVE_EXERCISE', exerciseIndex: item.exerciseIndex })}
                            style={{ paddingHorizontal: 8, paddingVertical: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'red' }}
                        >
                            <Text>X</Text>
                        </Pressable>
                        <Pressable 
                            style={{display: 'flex', flexDirection: 'column', flexGrow: 1, alignItems: 'center', borderWidth: 1, borderColor: 'red', marginLeft: 10, marginRight: 10}}
                            onPress={() => dispatch({ type: 'TOGGLE_SHOW_SETS', exerciseIndex: item.exerciseIndex }) }
                        >
                            <View style={{display: 'flex', flexDirection: 'row'}}>
                                <Text style={[workoutStyles.headerTextBold, workoutStyles.headerText]}>Exercise: </Text>
                                {item.subbedExercise?.subbedExerciseId ?
                                    <Text>{item.subbedExercise.exerciseName}</Text>
                                    :
                                    <Text style={workoutStyles.headerText}>{item.exerciseName}</Text>
                                }
                            </View>
                            <View style={{display: 'flex', flexDirection: 'row'}}>
                                <Text style={[workoutStyles.headerTextBold, workoutStyles.headerText]}>Target Reps: </Text> 
                                <Text style={workoutStyles.headerText}>{item.exerciseRepsLower} to {item.exerciseRepsUpper}</Text>
                            </View>
                            { item.setupNotes &&
                                <View style={{display: 'flex', flexDirection: 'row'}}>
                                    <Text style={[workoutStyles.headerTextBold, workoutStyles.headerText]}>Setup Notes: </Text>
                                    <Text style={workoutStyles.headerText}>{item.setupNotes}</Text>
                                </View>
                            }
                        </Pressable>

                        <Pressable onPressIn={drag} style={{ paddingHorizontal: 8, paddingVertical: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'red' }}>
                            <Text style={{ fontSize: 20 }}>☰</Text>
                        </Pressable>
                    </View>
                    <View style={{ opacity: isDragging ? 0.7 : 1 }}>
                        <LogExercise 
                            dispatch={dispatch} 
                            exerciseData={item}
                            exerciseCount={workoutForm.values.exercises.length}
                            lastTrainedExercise={props.lastTrained?.exercises.find(exc => exc.exerciseId === item.exerciseId)}
                            updateActiveSet={updateActiveSet}
                            exerciseErrors={workoutForm.errors.exercises[item.exerciseIndex]}
                            showSets={item.setsHidden}
                        />
                    </View>
                </View>
            </ShadowDecorator>
        )
    }

    return (
        <NestableScrollContainer style={{ flex: 1}} contentContainerStyle={{flexGrow: 1}}>
            <Text>
                {   !isActive 
                    ? `Session Notes: ${props.lastTrained?.workoutNotes}` 
                    : `Last ${props.template?.workoutName} session notes: ${props.lastTrained?.workoutNotes}`
                }
            </Text>
            { isActive && 
                <View style={[layoutStyles.rowFlex]}>
                    <View>
                        {
                            fullPastSetList ? (
                                activeLastExercise?.sets.map(s => {
                                    return (
                                        <LastTrainedSet 
                                            key={s.setId}
                                            lastTrainedSet={s}
                                            activeSetIndex={s.setIndex}
                                            allSets={fullPastSetList}
                                        />
                                    )
                                })
                            ) : (
                                activeSet.activeSetIndex !== undefined ? 
                                    <LastTrainedSet
                                        lastTrainedSet={activeLastSet}
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
            }
            <View>
                <NestableDraggableFlatList<LoggedWorkoutExercise>
                    data={workoutForm.values.exercises}
                    onDragEnd={handleExerciseReorder}
                    keyExtractor={(e) => e.key}
                    renderItem={renderExerciseItem}
                    scrollEnabled={false}
                />
            </View>
            { isActive && 
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
            }
        </NestableScrollContainer>
    )
})

export default LogWorkout;