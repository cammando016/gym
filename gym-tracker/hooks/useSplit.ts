import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveSplit } from '@/utils/account';
import { UserSplit } from '@/types/workouts';

export function useSplit() {
    const { user } = useAuth();

    return useQuery<UserSplit>({
        queryKey: ['activeSplit', user?.username],
        queryFn: async () => {
            const res = await getActiveSplit(user!.username);
            return res.split;
        },
        enabled: !!user,
        staleTime: Infinity,
    })
}