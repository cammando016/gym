import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function Feed() {
    return (
        <View>
            <Text>Schedule Page</Text>
            <Link href='/feed/EditSchedule' withAnchor>Edit Schedule</Link>
        </View>
    )
}