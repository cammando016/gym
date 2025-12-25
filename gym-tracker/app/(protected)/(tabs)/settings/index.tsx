import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function Settings() {
    return (
        <View>
            <Text>Settings Page</Text>
            <Link href='/settings/account' withAnchor>Edit Account</Link>
        </View>
    )
}