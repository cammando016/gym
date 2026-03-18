import { LoggedWorkoutExercise, WorkoutTemplateType } from '@/types/workouts';
import { View, Text, TextInput } from 'react-native';
import LogSet from './LogSet';

interface Props {
    exerciseTemplate: WorkoutTemplateType["exercises"][0],
    lastTrainedExercise?: LoggedWorkoutExercise,
}

export default function LogExercise ( props: Props ) {
    console.log(props.exerciseTemplate);
    return (
        <View>
            <Text>Exercise Name: {props.exerciseTemplate.exerciseName}</Text>
            <Text>Target Working Set Reps: {props.exerciseTemplate.repRangeLower} to {props.exerciseTemplate.repRangeUpper}</Text>
            <Text>Last session exercise notes: {props.lastTrainedExercise?.exerciseNotes}</Text>
            {
                props.lastTrainedExercise && (
                    props.lastTrainedExercise.sets.map(s => {
                        return (<LogSet key={s.setIndex} set={s} optionalSetModifiers={props.exerciseTemplate.optionalSetModifiers}></LogSet>)
                    })
                )
            }
        </View>
    )
}