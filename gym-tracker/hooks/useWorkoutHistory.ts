import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchLastThreeWorkouts, fetchLastTrained } from '@/utils/workouts';
import { LoggedWorkout, LoggedWorkoutBasicDetails } from '@/types/workouts';

export function useWorkoutHistory(workoutTemplateId?: string) {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['lastTrained', user?.username, workoutTemplateId],
        queryFn: async () : Promise<LoggedWorkout> => {
            const res = await fetchLastTrained(workoutTemplateId!);
            return res.workout;
        },
        enabled: !!user?.username && !!workoutTemplateId
    })
}

export function useLastThreeWorkouts() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['lastThreeWorkouts', user?.username],
        queryFn: async () : Promise<LoggedWorkoutBasicDetails[]> => {
            const res = await fetchLastThreeWorkouts();
            return res.workouts;
        },
        enabled: !!user?.username
    })
}