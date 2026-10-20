import { viewWorkout } from "@/utils/workouts";
import { useQuery } from "@tanstack/react-query";

export default function useViewWorkout (sessionId: string) {
    return useQuery({
        queryKey: ['session', sessionId, 'view'],
        queryFn: () => viewWorkout(sessionId),
        enabled: !!sessionId,
        staleTime: Infinity,
    });   
}