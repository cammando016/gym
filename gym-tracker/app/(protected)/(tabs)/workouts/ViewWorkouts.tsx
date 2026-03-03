import WorkoutTemplate from "@/components/WorkoutTemplate"
import {View, Text} from 'react-native';
import { useState } from "react";
import { useWorkoutTemplates } from "@/hooks/useWorkoutTemplates";

export default function ViewWorkouts() {
    const { data: workoutTemplateList, isLoading, error } = useWorkoutTemplates();
    const [activeWorkoutDetails, setActiveWorkoutDetails] = useState<string>('');

    const updateActiveWorkout = (id: string) => {
        if (id === activeWorkoutDetails) setActiveWorkoutDetails('');
        else setActiveWorkoutDetails(id);
    }

    return (
        <View>
            {workoutTemplateList ? (
                workoutTemplateList.map(w => {
                    return <WorkoutTemplate key={w.workoutid} workout={w} openDetails={activeWorkoutDetails} updateActiveWorkout={updateActiveWorkout} />
                })
            ) : (
                <Text>Loading Workout Templates</Text>
            )}
        </View>
    )
            }