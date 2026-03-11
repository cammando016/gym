import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getSplits } from '@/utils/account';
import { UserSplits } from '@/types/workouts';

export function useSplits() {
    const { user } = useAuth();

    return useQuery<UserSplits>({
        queryKey: ['splits', user?.username],
        queryFn: async () => {
            const res = await getSplits(user!.username);
            return res.splits;
        },
        enabled: !!user,
        staleTime: Infinity,
    })
}

export function useActiveSplit() {
    const { data } = useSplits();
    const activeSplit = data?.splits.find(s => s.isActive);
    return activeSplit;
}