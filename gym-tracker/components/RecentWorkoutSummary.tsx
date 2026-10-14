import { LoggedWorkoutBasicDetails } from "@/types/workouts";
import { formatDateDifferenceHMS } from "@/utils/dates";
import dayjs from "dayjs";
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
                <Text>Duration: {formatDateDifferenceHMS(dayjs(props.workoutData.dateEnded).diff(dayjs(props.workoutData.dateStarted)))}</Text>
            </View>
            <View>
                { props.workoutData.status === 'active' ? (
                    <View>
                        <Text>Resume</Text>
                    </View>
                ) : (
                    <View>
                        <Pressable onPress={() => router.replace({
                            pathname: `/sessions/${props.workoutData.id}`,
                            params: { templateId: props.workoutData.templateId, workoutName: props.workoutData.workoutName, dateStarted: props.workoutData.dateStarted.toString(), resumed: 'false', activeWorkout: 'false' }
                        })}>
                            <Text>View Workout</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    )
}