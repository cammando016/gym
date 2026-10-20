import { LoggedWorkoutFullDetails } from '@/types/workouts';
import { formatDateDifferenceHMS } from '@/utils/dates';
import { ScrollView, Text, View } from 'react-native';
import DisplayCompletedExercise from './DisplayCompletedExercise';

interface Props {
    completedWorkout: LoggedWorkoutFullDetails
}

export default function ViewCompletedWorkout (props: Props) {
    const w = props.completedWorkout;

    return (
        <View>
            <View>
                <Text>{`Workout Name: ${w.workoutName ? w.workoutName : ''}`}</Text>
                <Text>{`Duration: ${formatDateDifferenceHMS(w.duration * 1000)}`}</Text>
                <Text>{`Date Started: ${w.dateStarted.toString().slice(0, 10)}`}</Text>
                <Text>{`Workout Notes: ${w.workoutNotes ? w.workoutNotes : ''}`}</Text>
            </View>
            <ScrollView style={{maxHeight: '85%'}}>
                <Text>Exercises</Text>
                {
                    w.exercises.map(e => <DisplayCompletedExercise key={e.exerciseId} exercise={e} />)
                }
            </ScrollView>
            <View style={{height: '7%', backgroundColor: 'green'}}></View>
        </View>
    )
}