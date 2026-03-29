import LogWorkout from "@/forms/LogWorkout";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text } from 'react-native';
import dayjs from "dayjs";
import { formatDateDifferenceHMS } from "@/utils/dates";

export default function StartWorkout () {
    const { sessionId, templateId, workoutName, dateStarted } = useLocalSearchParams<{ sessionId: string, templateId: string, workoutName: string, dateStarted: string }>();
    
    const [workoutDuration, setWorkoutDuration] = useState<string>('');

    useEffect(() => {
        const interval = setInterval(() => {
            const dateDiff: string = formatDateDifferenceHMS( dayjs().diff(dayjs(dateStarted)) );

            setWorkoutDuration(dateDiff);
        }, 1000)

        return () => clearInterval(interval);
    }, [dateStarted])

    return (
        <>
            <Stack.Screen options={{ title: `Log ${workoutName} Workout` }} />
            <LogWorkout sessionId={sessionId} activeWorkout={true} templateId={templateId} />
            <View style={{padding: 10, backgroundColor: '#619888'}}>
                <Text style={{color: 'white', textAlign: 'center'}}>
                    {workoutDuration}
                </Text>
            </View>
        </>
    )
}