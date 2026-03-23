import LogWorkout from "@/forms/LogWorkout";
import { Stack, useLocalSearchParams } from "expo-router";

export default function StartWorkout () {
    const { sessionId, templateId, workoutName } = useLocalSearchParams<{ sessionId: string, templateId: string, workoutName: string }>();
    return (
        <>
            <Stack.Screen options={{ title: `Log ${workoutName} Workout` }} />
            <LogWorkout sessionId={sessionId} activeWorkout={true} templateId={templateId} />
        </>
    )
}