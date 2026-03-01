import { useAuth } from '@/contexts/AuthContext';
import { WorkoutTemplateType } from '@/types/workouts';
import WorkoutTemplate from '@/components/WorkoutTemplate';
import { fetchWorkouts } from '@/utils/workouts';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

export default function WorkoutsPage() {
    const { user } = useAuth();
    const [workoutList, setWorkoutList] = useState<WorkoutTemplateType[] | undefined>(undefined);
    const [activeWorkoutDetails, setActiveWorkoutDetails] = useState<string>('');

    const [searchRun, setSearchRun] = useState<boolean>(false);

    const getWorkouts = async () => {
        if (!user) return;
        const res = await fetchWorkouts(user.username);
        setWorkoutList(res.workouts);
        setSearchRun(true);
    }

    !searchRun && getWorkouts();

    const updateActiveWorkout = (id: string) => {
        if (id === activeWorkoutDetails) setActiveWorkoutDetails('');
        else setActiveWorkoutDetails(id);
    }

    return (
        <View>
            <View>
                <Text>Workouts Page</Text>
                <Link href='/workouts/AddWorkout' withAnchor>Create New Workout Template +</Link>
            </View>
            <View>
                {workoutList ? (
                    workoutList.map(w => {
                        return <WorkoutTemplate key={w.workoutid} workout={w} openDetails={activeWorkoutDetails} updateActiveWorkout={updateActiveWorkout} />
                    })
                ) : (
                    <Text>Loading Workout Templates</Text>
                )}
            </View>
        </View>
    )
}