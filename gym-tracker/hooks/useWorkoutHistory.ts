import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchLastTrained } from '@/utils/workouts';

export function useWorkoutHistory(workoutTemplateId?: string) {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['lastTrained', user?.username, workoutTemplateId],
        queryFn: async () => {
            const res = await fetchLastTrained(workoutTemplateId!);
            console.log(res.workout);
            return res.workout;
        },
        enabled: !!user?.username && !!workoutTemplateId
    })
}