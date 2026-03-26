import { LoggedWorkoutExercise, LogWorkoutAction, WorkoutTemplateType } from '@/types/workouts';
import { View, Text, TextInput } from 'react-native';
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
        <View style={{padding: 10}}>
            <Text>Exercise Name: {props.exerciseTemplate.exerciseName}</Text>
            <Text>Exercise Index: {props.exerciseData.exerciseIndex}</Text>
            {/* <Text>Setup Notes: {props.exerciseTemplate.exerciseNotes}</Text> */}
            <Text>Target Working Set Reps: {props.exerciseTemplate.repRangeLower} to {props.exerciseTemplate.repRangeUpper}</Text>
            <Text>Last session exercise notes: {props.lastTrainedExercise?.exerciseNotes}</Text>
            {
                props.exerciseData.sets.map(s => {
                    return (
                        <LogSet 
                            key={s.setIndex} 
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