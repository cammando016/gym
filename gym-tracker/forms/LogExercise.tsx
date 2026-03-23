import { LoggedWorkoutExercise, WorkoutTemplateType } from '@/types/workouts';
import { View, Text, TextInput } from 'react-native';
import LogSet from './LogSet';

interface Props {
    activeWorkout: boolean,
    exerciseTemplate: WorkoutTemplateType["exercises"][0],
    lastTrainedExercise?: LoggedWorkoutExercise,
}

export default function LogExercise ( props: Props ) {
    console.log(props.exerciseTemplate);
    return (
        <View>
            <Text>Exercise Name: {props.exerciseTemplate.exerciseName}</Text>
            {/* <Text>Setup Notes: {props.exerciseTemplate.exerciseNotes}</Text> */}
            <Text>Target Working Set Reps: {props.exerciseTemplate.repRangeLower} to {props.exerciseTemplate.repRangeUpper}</Text>
            <Text>Last session exercise notes: {props.lastTrainedExercise?.exerciseNotes}</Text>
            {
                props.exerciseTemplate.sets.map(s => {
                    return (<LogSet key={s.setIndex} activeWorkout={props.activeWorkout} set={s} exerciseTemplate={props.exerciseTemplate} optionalSetModifiers={props.exerciseTemplate.optionalSetModifiers}></LogSet>)
                })
            }

        </View>
    )
}