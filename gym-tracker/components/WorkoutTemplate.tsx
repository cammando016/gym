import { WorkoutTemplateType } from "@/types/workouts";
import { View, Text } from 'react-native';

interface Props {
    workout: WorkoutTemplateType
} 

export default function WorkoutTemplate (props: Props) {
    return (
        <View>
            <View>
                <Text>{`Workout Name: ${props.workout.workoutname}`}</Text>
                <Text>{`Privacy: ${props.workout.privacy}`}</Text>
                <Text>{`${props.workout.exercises.length} Exercises:`}</Text>
                {
                    props.workout.exercises.map(exc => {
                        return (
                            <View key={exc.exerciseIndex}>
                                <Text>{exc.exerciseName}: {exc.repRangeLower} to {exc.repRangeUpper} reps</Text>
                            </View>
                        )
                    })
                }
            </View>
        </View>
    )
}