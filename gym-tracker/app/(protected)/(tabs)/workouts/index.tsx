import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { useWorkoutTemplates } from "@/hooks/useWorkoutTemplates";

export default function WorkoutsPage() {
    const { data: workoutTemplateList, isLoading, error } = useWorkoutTemplates();
    return (
        <View>
            <View>
                <Text>Workouts Page</Text>
            </View>
            <View style={{padding: 20}}>
                <Text style={{textAlign: 'center'}}>Workout Templates</Text>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View>
                        <Text>{workoutTemplateList?.filter(w => w.isactive === true).length} active workouts.</Text>
                    </View>
                    <View>
                        <Link href='/workouts/AddWorkout' withAnchor>Create New Template</Link>
                        <Link href='/workouts/ViewWorkouts' withAnchor>View Templates</Link>
                    </View>
                </View>
            </View>

            <View style={{padding: 20}}>
                <Text style={{textAlign: 'center'}}>Split</Text>
                <View>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text>CURRENT SPLIT NAME</Text>
                        <Text>SPLIT DAY COUNT</Text>
                    </View>
                    <View>
                        <Link href='/workouts/EditSplit' withAnchor>Edit Split</Link>
                    </View>
                </View>
            </View>
        </View>
    )
}