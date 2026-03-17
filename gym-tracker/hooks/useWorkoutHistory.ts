import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchLastTrained } from '@/utils/workouts';
import { LoggedWorkout } from '@/types/workouts';

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