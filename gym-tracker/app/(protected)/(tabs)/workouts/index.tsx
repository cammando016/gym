import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { useWorkoutTemplates } from "@/hooks/useWorkoutTemplates";
import { useSplit } from '@/hooks/useSplit';

export default function WorkoutsPage() {
    const { data: workoutTemplateList, isLoading, error } = useWorkoutTemplates();
    const { data: split } = useSplit();

    console.log('Split:', split);
    console.log('Workouts:', split?.workouts);
    return (
        <View>
            <View>
                <Text>Workouts Page</Text>
            </View>
            <View style={{padding: 20}}>
                <Text style={{textAlign: 'center'}}>Workout Templates</Text>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View>
                        <Text>{workoutTemplateList?.filter(w => w.isactive === true).length} active workouts</Text>
                    </View>
                    <View>
                        <Link href='/workouts/AddWorkout' withAnchor>Create New Template</Link>
                        <Link href='/workouts/ViewWorkouts' withAnchor>View Templates</Link>
                    </View>
                </View>
            </View>

            <View style={{padding: 20}}>
                <Text style={{textAlign: 'center'}}>Split</Text>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View>
                        <Text>{split?.split_name}</Text>
                        <Text>{split?.workouts?.length} Day Split</Text>
                    </View>
                    <View>
                        {split?.split_id && (<Link href={`/workouts/${split?.split_id}`}>View Split</Link>)}
                        <Link href={{pathname: 'workouts/[splitId]', params: {splitId: split?.split_id}}} withAnchor>Edit Split</Link>
                    </View>
                </View>
            </View>

            <View style={{padding: 20}}>
                <Text style={{textAlign: 'center'}}>Completed Workouts</Text>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View>
                        <Text>LAST TRAINED:</Text>
                        <Text>STREAK: x DAYS</Text>
                    </View>
                    <View>
                        {/* <Link href='/workouts/EditSplit' withAnchor>Edit Split</Link> */}
                        <Text>LINK HERE</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}