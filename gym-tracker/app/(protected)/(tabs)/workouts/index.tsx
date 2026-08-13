import { Link, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useWorkoutTemplates } from "@/hooks/useWorkoutTemplates";
import { useSplits } from '@/hooks/useSplit';
import SkeletonSmall from '@/components/SkeletonSmall';
import { useLastThreeWorkouts } from '@/hooks/useWorkoutHistory';
import RecentWorkoutSummary from '@/components/RecentWorkoutSummary';

export default function WorkoutsPage() {
    const { data: workoutTemplateList, isLoading, error } = useWorkoutTemplates();
    const { data } = useSplits();
    const { data: lastThreeTrained, isLoading: lastThreeLoading } = useLastThreeWorkouts();

    return (
        <View>
            <View>
                <Text>Workouts Page</Text>
            </View>

            <View style={{padding: 20}}>
                <Text style={{textAlign: 'center'}}>Workout Templates</Text>
                {
                    isLoading ? ( <SkeletonSmall></SkeletonSmall> ) :
                    (
                        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                            <View>
                                <Text>{workoutTemplateList?.filter(w => w.isActive === true).length} active workouts</Text>
                            </View>
                            <View>
                                <Link href='/workouts/AddWorkout' withAnchor>Create New Template</Link>
                                <Link href='/workouts/ViewWorkouts' withAnchor>View Templates</Link>
                            </View>
                        </View>
                    )
                }
            </View>
        
            <View style={{padding: 20}}>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={{fontWeight: 'bold'}}>Splits</Text>
                    <Link href='/workouts/EditSplit' >Create New</Link>
                </View>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    {
                        data?.splits.filter(sp => sp.isActive).map(s => {
                            return (
                                <View key={s.splitId}>
                                    <Link href={`/workouts/${s.splitId}`}>
                                        <Text>{s.workouts.length} Day Split: {s.splitName}</Text>
                                    </Link>
                                </View>
                            )
                        })
                    }
                    {
                        data?.splits.filter(sp => !sp.isActive).map(s => {
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
                    <Text>View All</Text>
                </View>
                <View>
                    { lastThreeLoading ? <SkeletonSmall /> : (
                        !lastThreeTrained ? <Text>No workouts found</Text> : (
                            lastThreeTrained.map(lt => <RecentWorkoutSummary key={lt.id} workoutData={lt} />)
                    ))}
                </View>
                <View>
                    <Text>Streak: COMING SOON</Text>
                </View>
            </View>
        </View>
    )
}