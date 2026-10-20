import useViewWorkout from "@/hooks/useViewWorkout"
import { Text, View } from "react-native";
import SkeletonSmall from "../SkeletonSmall";
import ViewCompletedWorkout from "./ViewCompletedWorkout";

interface Props {
    sessionId: string
}

export function ViewCompletedWorkoutLoader (props: Props) {
    const { data, isLoading, isError, refetch } = useViewWorkout(props.sessionId);

    if (isLoading) return <SkeletonSmall />
    if (!data) return <View><Text>Workout Not Found</Text></View>

    return <ViewCompletedWorkout completedWorkout={data} />
}