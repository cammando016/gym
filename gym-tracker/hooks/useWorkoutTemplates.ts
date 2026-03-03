import { useQuery } from '@tanstack/react-query';
import { fetchWorkouts } from '@/utils/workouts';
import { useAuth } from '@/contexts/AuthContext';
import { WorkoutTemplateType } from '@/types/workouts';

export function useWorkoutTemplates() {
    const { user } = useAuth();

    return useQuery<WorkoutTemplateType[]>({
        queryKey: ['workouts', user?.username],
        queryFn: async () => {
            if (!user) throw new Error('Username not found to authenticate request for workout templates');
            const res = await fetchWorkouts(user.username);
            return res.workouts;
        },
        enabled: !!user,
        staleTime: Infinity,
    });
}