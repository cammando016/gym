import { startWorkout } from '@/utils/workouts';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

export function useStartWorkout() {
    const router = useRouter();
    return useMutation({
        mutationFn: startWorkout,
        onSuccess: (data) => {
            console.log('SUCCESS:', data);
            router.replace(`/sessions/${data.sessionId}`);
        },
        onError: (err) => {
            console.log('ERROR:', err);
        }
    })
}