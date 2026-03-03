import WorkoutTemplate from '@/components/WorkoutTemplate';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';

export default function WorkoutsPage() {
    const { data: workoutTemplateList, isLoading, error } = useWorkoutTemplates();
    const [activeWorkoutDetails, setActiveWorkoutDetails] = useState<string>('');

    const updateActiveWorkout = (id: string) => {
        if (id === activeWorkoutDetails) setActiveWorkoutDetails('');
        else setActiveWorkoutDetails(id);
    }

    return (
        <View>
            <View>
                <Text>Workouts Page</Text>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Link href='/workouts/AddWorkout' withAnchor>Create New Workout Template +</Link>
                    <Link href='/workouts/EditSplit' withAnchor>Edit Split</Link>
                </View>
            </View>
            <View>
                {workoutTemplateList ? (
                    workoutTemplateList.map(w => {
                        return <WorkoutTemplate key={w.workoutid} workout={w} openDetails={activeWorkoutDetails} updateActiveWorkout={updateActiveWorkout} />
                    })
                ) : (
                    <Text>Loading Workout Templates</Text>
                )}
            </View>
        </View>
    )
}