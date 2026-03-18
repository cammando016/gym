import LogWorkout from "@/forms/LogWorkout";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function StartWorkout () {
    const { templateId } = useLocalSearchParams<{ templateId: string }>();
    return (
        <LogWorkout workoutTemplateId={templateId} />
    )
}