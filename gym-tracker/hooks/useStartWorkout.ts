import { useAuth } from '@/contexts/AuthContext';
import { startWorkout } from '@/utils/workouts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

export function useStartWorkout() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: startWorkout,
        onSuccess: (data) => {
            queryClient.setQueryData(['session', data.sessionId], {
                sessionId: data.sessionId,
                templateId: data.templateId,
                workoutName: data.workoutName,
                dateStarted: data.dateStarted,
                dateResumed: data.dateResumed,
                duration: data.duration,
                status: 'active',
            })

            queryClient.invalidateQueries({ queryKey: ['splitDay', user?.username]});
            
            router.replace(`/sessions/${data.sessionId}`);
        },
        onError: (err) => {
            console.error('ERROR:', err);
        }
    })
}