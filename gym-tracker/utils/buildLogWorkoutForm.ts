import { LogWorkoutForm, WorkoutTemplateType } from "@/types/workouts";
import { randomUUID } from "expo-crypto";

export function buildInitialForm(template: WorkoutTemplateType) : LogWorkoutForm {
    const exerciseKeys = new Map(template.exercises.map(e => [e.exerciseIndex, randomUUID()]));

    return {
        values : {
            workoutNotes: '',
            exercises: template.exercises.map(e => {
                return {
                    key: exerciseKeys.get(e.exerciseIndex)!,
                    exerciseId: e.exerciseId,
                    exerciseIndex: e.exerciseIndex,
                    exerciseName: e.exerciseName,
                    exerciseRepsLower: e.repRangeLower,
                    exerciseRepsUpper: e.repRangeUpper,
                    setupNotes: e.exerciseNotes,
                    exerciseNotes: '',
                    setsHidden: false,
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
                            weight: '',
                            setNotes: '',
                            usedBelt: false,
                            usedStraps: false,
                            reps: {
                                left: {
                                    fullReps: '',
                                    assistedReps: '',
                                    partialReps: '',
                                    rpe: '',
                                    rir: ''
                                },
                                right: {
                                    fullReps: '',
                                    assistedReps: '',
                                    partialReps: '',
                                    rpe: '',
                                    rir: ''
                                }
                            }
                        }
                        else return {
                            isUnilateral: false,
                            setIndex: s.setIndex,
                            setId: randomUUID(),
                            setType: s.setType,
                            showSetTypeDropdown: false,
                            weight: '',
                            setNotes: '',
                            usedBelt: false,
                            usedStraps: false,
                            reps: {
                                fullReps: '',
                                assistedReps: '',
                                partialReps: '',
                                rpe: '',
                                rir: ''
                            }
                        }
                    })
                }
            }),
        },
        errors: {
            workoutNotes: undefined,
            exercises: template.exercises.map(e => {
                return {
                    key: exerciseKeys.get(e.exerciseIndex)!,
                    exerciseNotes: undefined,
                    exerciseIndex: e.exerciseIndex,
                    sets: e.sets.map(s => {
                        if (s.isUnilateralSet || e.unilateralExercise) return {
                            key: randomUUID(),
                            weight: undefined,
                            setNotes: undefined,
                            setIndex: s.setIndex,
                            unilateralSet: true,
                            left: {
                                fullReps: undefined,
                                assistedReps: undefined,
                                partialReps: undefined,
                                rir: undefined,
                                rpe: undefined,
                            },
                            right: {
                                fullReps: undefined,
                                assistedReps: undefined,
                                partialReps: undefined,
                                rir: undefined,
                                rpe: undefined,
                            }
                        }
                        else return {
                            key: randomUUID(),
                            weight: undefined,
                            setNotes: undefined,
                            setIndex: s.setIndex,
                            unilateralSet: false,
                            fullReps: undefined,
                            assistedReps: undefined,
                            partialReps: undefined,
                            rir: undefined,
                            rpe: undefined,
                        }
                    })
                }
            })
        }
    }
}