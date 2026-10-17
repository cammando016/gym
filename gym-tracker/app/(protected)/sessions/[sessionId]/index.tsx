import LogWorkout, { LogWorkoutRef } from "@/forms/LogWorkout";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable } from 'react-native';
import dayjs from "dayjs";
import { formatDateDifferenceHMS } from "@/utils/dates";
import { useSession } from "@/hooks/useSession";

export default function StartWorkout () {
    const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
    const { data: session, isLoading, error } = useSession(sessionId);
    
    const [workoutDuration, setWorkoutDuration] = useState<string>('');
    const router = useRouter();

    const resumedAsBool = false;
    const activeAsBool = true;

    const logWorkoutRef = useRef<LogWorkoutRef>(null);

    useEffect(() => {
        if(!activeAsBool || !session || isLoading) return;
        const interval = setInterval(() => {
            const dateDiff: string = formatDateDifferenceHMS( dayjs().diff(dayjs(session.dateStarted)) );

            setWorkoutDuration(dateDiff);
        }, 1000)

        return () => clearInterval(interval);
    }, [session?.dateStarted, activeAsBool])

    if (!session) return <><View><Text>Error</Text></View></>
    return (
        <>
            <Stack.Screen options={{
                title: activeAsBool ? `Logging Workout` : session.workoutName,
                headerLeft: () => (<Pressable onPress={() => router.replace('/(protected)/(tabs)')}><Text>Cancel</Text></Pressable>),
                headerRight: () => (
                    <Pressable onPress={ () => logWorkoutRef.current?.handleSubmit() }>
                        <Text>Complete</Text>
                    </Pressable>
                )
            }} />
            <LogWorkout ref={logWorkoutRef} sessionId={sessionId} activeWorkout={activeAsBool} templateId={session.templateId} resumingWorkout={resumedAsBool} />
            <View style={{padding: 10, backgroundColor: '#619888', display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                <Text style={{color: 'white', textAlign: 'center'}}>{session.workoutName} Day</Text>
                <Text style={{color: 'white', textAlign: 'center'}}>{workoutDuration}</Text>
            </View>
        </>
    )
}