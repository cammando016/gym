import { LoggedWorkoutExercise, LogWorkoutAction, WorkoutTemplateType } from '@/types/workouts';
import { View, Text, TextInput, Pressable } from 'react-native';
import workoutStyles from '@/styles/workouts';
import { Dispatch } from 'react';
import LogSet from './LogSet';

interface Props {
    dispatch: Dispatch<LogWorkoutAction>,
    exerciseData: LoggedWorkoutExercise,
    exerciseIndex: number,
    activeWorkout: boolean,
    exerciseTemplate: WorkoutTemplateType["exercises"][0],
    lastTrainedExercise?: LoggedWorkoutExercise,
}

export default function LogExercise ( props: Props ) {
    return (
        <View style={workoutStyles.exerciseContainer}>
            <View style={workoutStyles.exerciseHeader}>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={{display: 'flex', flexDirection: 'row'}}>
                        <Text style={[workoutStyles.headerTextBold, workoutStyles.headerText]}>Exercise: </Text>
                        <Text style={workoutStyles.headerText}>{props.exerciseTemplate.exerciseName}</Text>
                    </View>
                    <Pressable onPress={() => props.dispatch({ type: 'REMOVE_EXERCISE', exerciseIndex: props.exerciseIndex })}>
                        <Text style={workoutStyles.headerText}>Delete Exercise</Text>
                    </Pressable>
                </View>
                {
                    props.exerciseTemplate.exerciseNotes && 
                    <View>
                        <Text style={[workoutStyles.headerTextBold, workoutStyles.headerText]}>Setup Notes:</Text>
                        <Text style={workoutStyles.headerText}>{props.exerciseTemplate.exerciseNotes}</Text>
                    </View>
                }
                <View style={{display: 'flex', flexDirection: 'row'}}>
                    <Text style={[workoutStyles.headerTextBold, workoutStyles.headerText]}>Target Reps: </Text> 
                    <Text style={workoutStyles.headerText}>{props.exerciseTemplate.repRangeLower} to {props.exerciseTemplate.repRangeUpper}</Text>
                </View>
                <View style={{display: 'flex', flexDirection: 'row'}}>
                    <Text style={[workoutStyles.headerTextBold, workoutStyles.headerText]}>Last session notes: </Text>
                    <Text style={workoutStyles.headerText}>{props.lastTrainedExercise?.exerciseNotes}</Text>
                </View>
            </View>
            {
                props.exerciseData.sets.map(s => {
                    return (
                        <LogSet 
                            key={s.setId} 
                            dispatch={props.dispatch}
                            activeWorkout={props.activeWorkout}
                            setData={s} 
                            setTemplate={props.exerciseTemplate.sets[0]} 
                            setIndex={s.setIndex}
                            exerciseIndex={props.exerciseIndex}
                            exerciseTemplate={props.exerciseTemplate} 
                            optionalSetModifiers={props.exerciseTemplate.optionalSetModifiers}
                        ></LogSet>)
                })
            }
            <Text>Exercise Notes:</Text>
            <TextInput 
                placeholder='Leave any notes for next session here'
                value={props.exerciseData.exerciseNotes}
                onFocus={() => props.dispatch({ type: 'SET_DROPDOWN_FALSE' })}
                onChangeText={(s: string) => props.dispatch({ type: 'UPDATE_EXERCISE_NOTES', value: s, exerciseIndex: props.exerciseIndex })}
            />
        </View>
    )
}