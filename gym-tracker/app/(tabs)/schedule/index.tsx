import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function Schedule() {
    return (
        <View>
            <Text>Schedule Page</Text>
            <Link href='/schedule/EditSchedule' withAnchor>Edit Schedule</Link>
        </View>
    )
}