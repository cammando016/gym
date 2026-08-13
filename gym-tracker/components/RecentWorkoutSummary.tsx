import { LoggedWorkoutBasicDetails } from "@/types/workouts";
import { formatDateDifferenceHMS } from "@/utils/dates";
import dayjs from "dayjs";
import { View, Text } from 'react-native';

interface Props {
    workoutData: LoggedWorkoutBasicDetails
}

export default function RecentWorkoutSummary(props: Props) {
    return (
        <View style={{display: 'flex', flexDirection: 'row', marginTop: 5, marginBottom: 5}}>
            <View style={{display: 'flex', flexGrow: 1}}>
                <Text>{props.workoutData.workoutName}</Text>
                <Text>Status: {props.workoutData.status}</Text>
                <Text>Duration: {formatDateDifferenceHMS(dayjs(props.workoutData.dateEnded).diff(dayjs(props.workoutData.dateStarted)))}</Text>
            </View>
            <View>
                { props.workoutData.status === 'active' ? (
                    <View>
                        <Text>Resume</Text>
                    </View>
                ) : (
                    <View>
                        <Text>Full Workout</Text>
                    </View>
                )}
            </View>
        </View>
    )
}