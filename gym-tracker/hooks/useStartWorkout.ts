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
        onSuccess: (data : {sessionId: string, templateId: string, workoutName: string, dateStarted: string}) => {
            console.log('SUCCESS:', data);

            queryClient.invalidateQueries({ queryKey: ['splitDay', user?.username]});
            
            router.replace({
                pathname: `/sessions/${data.sessionId}`,
                params: { templateId: data.templateId, workoutName: data.workoutName, dateStarted: data.dateStarted, resumed: 'false' }
            });
        },
        onError: (err) => {
            console.error('ERROR:', err);
        }
    })
}