import { WorkoutTemplateType } from "@/types/workouts";
import { View, Text, Pressable } from 'react-native';

interface Props {
    workout: WorkoutTemplateType,
    openDetails: string,
    updateActiveWorkout: (id: string) => void
} 

export default function WorkoutTemplate (props: Props) {
    const isActiveWorkout = props.workout.workoutid === props.openDetails;
    return (
        <View>
            <View>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View>
                        <Text>{`Workout Name: ${props.workout.workoutname}`}</Text>
                        <Text>{`Privacy: ${props.workout.privacy}`}</Text>
                        <Text>{`${props.workout.exercises.length} Exercises:`}</Text>
                    </View>
                    <View>
                        <Pressable onPress={() => props.updateActiveWorkout(props.workout.workoutid)}><Text>{isActiveWorkout ? 'Hide' : 'Show'} Details</Text></Pressable>
                    </View>
                </View>
                {isActiveWorkout && (
                    props.workout.exercises.map(exc => {
                        return (
                            <View key={exc.exerciseIndex}>
                                <Text>{exc.exerciseName}: {exc.repRangeLower} to {exc.repRangeUpper} reps</Text>
                            </View>
                        )
                    })   
                )}
            </View>
        </View>
    )
}