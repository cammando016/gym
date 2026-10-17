import { fetchSession } from "@/utils/workouts";
import { useQuery } from "@tanstack/react-query";

export function useSession(sessionId?: string) {
    return useQuery({
        queryKey: ['session', sessionId],
        queryFn: () => fetchSession(sessionId!),
        enabled: !!sessionId,
    })
}