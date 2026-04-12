import LogWorkout, { LogWorkoutRef } from "@/forms/LogWorkout";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable } from 'react-native';
import dayjs from "dayjs";
import { formatDateDifferenceHMS } from "@/utils/dates";

export default function StartWorkout () {
    const { sessionId, templateId, workoutName, dateStarted } = useLocalSearchParams<{ sessionId: string, templateId: string, workoutName: string, dateStarted: string }>();
    
    const [workoutDuration, setWorkoutDuration] = useState<string>('');
    const router = useRouter();

    const logWorkoutRef = useRef<LogWorkoutRef>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const dateDiff: string = formatDateDifferenceHMS( dayjs().diff(dayjs(dateStarted)) );

            setWorkoutDuration(dateDiff);
        }, 1000)

        return () => clearInterval(interval);
    }, [dateStarted])

    return (
        <>
            <Stack.Screen options={{
                title: `Logging Workout`,
                headerLeft: () => (<Pressable onPress={() => router.replace('/(protected)/(tabs)')}><Text>Cancel</Text></Pressable>),
                headerRight: () => (<Pressable onPress={() => {logWorkoutRef.current?.handleSubmit(); /*router.replace('/(protected)/(tabs)')*/ }}><Text>Complete</Text></Pressable>)
            }} />
            <LogWorkout ref={logWorkoutRef} sessionId={sessionId} activeWorkout={true} templateId={templateId} />
            <View style={{padding: 10, backgroundColor: '#619888', display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                <Text style={{color: 'white', textAlign: 'center'}}>{workoutName} Day</Text>
                <Text style={{color: 'white', textAlign: 'center'}}>{workoutDuration}</Text>
            </View>
        </>
    )
}