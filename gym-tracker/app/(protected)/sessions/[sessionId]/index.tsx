import LogWorkout from "@/forms/LogWorkout";
import { Stack, useLocalSearchParams } from "expo-router";

export default function StartWorkout () {
    const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
    return (
        <>
            <Stack.Screen options={{ title: 'Workout' }} />
            <LogWorkout workoutTemplateId={sessionId} />
        </>
    )
}