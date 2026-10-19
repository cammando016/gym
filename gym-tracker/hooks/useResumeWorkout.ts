import { resumeWorkout } from "@/utils/workouts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

export function useResumeWorkout() {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: resumeWorkout,
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ['session', data.sessionId] });
            router.replace(`/sessions/${data.sessionId}`);
        },
        onError: (err) => console.error('ERROR:', err),
    });
}