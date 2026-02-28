import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function Settings() {
    const { logout } = useAuth();
    return (
        <View>
            <Text>Settings Page</Text>
            <Link href='/settings/account' withAnchor>Edit Account</Link>
            <Pressable onPress={logout}><Text>Logout</Text></Pressable>
        </View>
    )
}