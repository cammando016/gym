import { LoggedWorkoutBasicDetails } from "@/types/workouts";
import { formatDateDifferenceHMS } from "@/utils/dates";
import { viewWorkout } from "@/utils/workouts";
import { useRouter } from "expo-router";
import { View, Text, Pressable } from 'react-native';

interface Props {
    workoutData: LoggedWorkoutBasicDetails
}

export default function RecentWorkoutSummary(props: Props) {
    const router = useRouter();
    return (
        <View style={{display: 'flex', flexDirection: 'row', marginTop: 5, marginBottom: 5}}>
            <View style={{display: 'flex', flexGrow: 1}}>
                <Text>{props.workoutData.workoutName}</Text>
                <Text>Status: {props.workoutData.status}</Text>
                <Text>Date: {props.workoutData.dateStarted.toString().slice(0, 10)}</Text>
                <Text>Duration: {formatDateDifferenceHMS(props.workoutData.duration * 1000)}</Text>
            </View>
            <View>
                { props.workoutData.status === 'active' ? (
                    <View>
                        <Text>Resume</Text>
                    </View>
                ) : (
                    <View>
                        <Pressable
                            onPress={() => router.push(`/sessions/${props.workoutData.id}`)}
                        >
                            <Text>View Workout</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    )
}