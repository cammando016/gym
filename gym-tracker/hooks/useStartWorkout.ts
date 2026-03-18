import { startWorkout } from '@/utils/workouts';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

export function useStartWorkout() {
    const router = useRouter();
    return useMutation({
        mutationFn: startWorkout,
        onSuccess: (data : {sessionId: string, templateId: string, workoutName: string}) => {
            console.log('SUCCESS:', data);
            router.replace({
                pathname: `/sessions/${data.sessionId}`,
                params: { templateId: data.templateId, workoutName: data.workoutName }
            });
        },
        onError: (err) => {
            console.log('ERROR:', err);
        }
    })
}