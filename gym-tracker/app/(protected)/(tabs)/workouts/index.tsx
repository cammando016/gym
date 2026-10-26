import { Link, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useWorkoutTemplates } from "@/hooks/useWorkoutTemplates";
import { useSplits } from '@/hooks/useSplit';
import SkeletonSmall from '@/components/SkeletonSmall';
import { useLastThreeWorkouts } from '@/hooks/useWorkoutHistory';
import RecentWorkoutSummary from '@/components/RecentWorkoutSummary';
import AddNewButton from '@/components/AddNewButton';
import ViewAllButton from '@/components/ViewAllButton';

export default function WorkoutsPage() {
    const { data: workoutTemplateList, isLoading, error } = useWorkoutTemplates();
    const { data } = useSplits();
    const { data: lastThreeTrained, isLoading: lastThreeLoading } = useLastThreeWorkouts();

    return (
        <View>
            <View style={{padding: 20}}>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={{fontWeight: 'bold'}}>My Templates</Text>
                    <View style={{display: 'flex', flexDirection: 'row', gap: 5}}>
                        <ViewAllButton path={'/workouts/ViewWorkouts'} />
                        <AddNewButton path={'/workouts/AddWorkout'} />
                    </View>
                </View>
                {
                    isLoading ? ( <SkeletonSmall></SkeletonSmall> ) :
                    (
                        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text>{workoutTemplateList?.filter(w => w.isActive === true).length} active workouts</Text>
                        </View>
                    )
                }
            </View>
        
            <View style={{padding: 20}}>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={{fontWeight: 'bold'}}>My Splits</Text>
                    <View style={{display: 'flex', flexDirection: 'row', gap: 5}}>
                        {/* Replace with actual path once route created */}
                        {data && data.splits.length > 3 && <ViewAllButton path={"/"} />} 
                        <AddNewButton path={'/workouts/EditSplit'} />
                    </View>
                </View>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    {
                        data?.splits.filter(sp => sp.isActive).map(s => {
                            return (
                                <View key={s.splitId}>
                                    <Link href={`/workouts/${s.splitId}`}>
                                        <Text>Active Split: {s.splitName}</Text>
                                    </Link>
                                </View>
                            )
                        })
                    }
                    {
                        data?.splits.filter(sp => !sp.isActive).slice(0, 2).map(s => {
                            return (
                                <View key={s.splitId}>
                                    <Link href={`/workouts/${s.splitId}`}>
                                        <Text>{s.workouts.length} Day Split: {s.splitName}</Text>
                                    </Link>
                                </View>
                            )
                        })
                    }
                </View>
            </View>

            <View style={{padding: 20}}>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={{fontWeight: 'bold'}}>Recent Workouts</Text>
                     {/* Replace with ViewAll component button once route created */}
                    <Text>View All</Text>
                </View>
                <View>
                    { lastThreeLoading ? <SkeletonSmall /> : (
                        !lastThreeTrained ? <Text>No workouts found</Text> : (
                            lastThreeTrained.map(lt => <RecentWorkoutSummary key={lt.id} workoutData={lt} />)
                    ))}
                </View>
                <View style={{display: 'flex', flexDirection: 'row'}}>
                    <Text>Streak: COMING SOON </Text>
                    <Text>Best: ?</Text>
                </View>
            </View>
        </View>
    )
}