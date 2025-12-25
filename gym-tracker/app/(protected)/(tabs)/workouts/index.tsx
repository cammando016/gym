import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function WorkoutsPage() {
    return (
        <View>
            <Text>Workouts Page</Text>
            <Link href='/workouts/AddWorkout' withAnchor>Add Workout +</Link>
        </View>
    )
}