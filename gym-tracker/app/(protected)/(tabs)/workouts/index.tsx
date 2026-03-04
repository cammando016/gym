import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { useWorkoutTemplates } from "@/hooks/useWorkoutTemplates";
import { useSplit } from '@/hooks/useSplit';

export default function WorkoutsPage() {
    const { data: workoutTemplateList, isLoading, error } = useWorkoutTemplates();
    const { data: split } = useSplit();

    console.log(split);
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
                        <Text>CURRENT SPLIT NAME</Text>
                        <Text>SPLIT DAY COUNT</Text>
                    </View>
                    <View>
                        <Link href='/workouts/EditSplit' withAnchor>Edit Split</Link>
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