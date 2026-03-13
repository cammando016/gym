import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getSplits } from '@/utils/account';
import { getDayOfSplit } from '@/utils/split';
import { Split } from '@/types/workouts';

interface SplitsQueryResult {
    splits: Split[];
    activeSplit?: Split;
}

export function useSplits() {
    const { user } = useAuth();

    return useQuery<Split[], Error, SplitsQueryResult>({
        queryKey: ['splits', user?.username],
        queryFn: async () => {
            const res = await getSplits(user!.username);
            return res.splits;
        },
        // enabled: !!user,
        staleTime: Infinity,
        select: (splits) => {
            return {
                splits,
                activeSplit: splits.find(s => s.isActive)
            };
        }
    });
}

export function useDayOfSplit() {
    //Check which day of split user is up to
    //Check if date of last training is oen day ago
    //Check if rest day
    const { user } = useAuth();
    const now = new Date();
    const msUntilTomorrow = (
        (24 * 60 * 60 * 1000) - 
        now.getHours() * 3600000 + 
        now.getMinutes() * 60000 +
        now.getSeconds() * 1000 +
        now.getMilliseconds()
    )
    return useQuery<number>({
        queryKey: ['splitDay', user?.username],
        queryFn: async () => {
            const res = await getDayOfSplit(user!.username);
            return res.splitDay;
        },
        enabled: !!user,
        staleTime: msUntilTomorrow,
    })
}