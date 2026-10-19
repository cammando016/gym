import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useRef } from "react";
import { View, Text, Pressable } from 'react-native';
import { useSession } from "@/hooks/useSession";
import LogWorkoutLoader from "@/components/LogWorkoutLoader";
import { LogWorkoutRef } from "@/types/workouts";
import LogWorkoutTimer from "@/components/LogWorkoutTimer";

export default function StartWorkout () {
    const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
    const { data: session, isLoading, error } = useSession(sessionId);
    const router = useRouter();

    const logWorkoutRef = useRef<LogWorkoutRef>(null);

    if (!session) return <><View><Text>Error</Text></View></>
    return (
        <>
            <Stack.Screen options={{
                title: session.status === 'active' ? `Logging Workout` : session.workoutName,
                headerLeft: () => (<Pressable onPress={() => router.replace('/(protected)/(tabs)')}><Text>Cancel</Text></Pressable>),
                headerRight: () => (
                    <Pressable onPress={ () => logWorkoutRef.current?.handleSubmit() }>
                        <Text>Complete</Text>
                    </Pressable>
                )
            }} />
            <LogWorkoutLoader ref={logWorkoutRef} sessionId={sessionId} />
            <View style={{padding: 10, backgroundColor: '#619888', display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                <Text style={{color: 'white', textAlign: 'center'}}>{session.workoutName} Day</Text>
                <LogWorkoutTimer 
                    active={session.status === 'active'}
                    duration={session.duration}
                    dateResumed={session.dateResumed}
                    dateStarted={session.dateStarted}
                />
            </View>
        </>
    )
}