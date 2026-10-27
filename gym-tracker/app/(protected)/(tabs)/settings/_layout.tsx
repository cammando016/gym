import { useAuth } from '@/contexts/AuthContext';
import { Stack } from 'expo-router';
import { Pressable, Text } from 'react-native';

export default function SettingsLayout() {
    const { logout } = useAuth();
    const saveAccountChanges = () => {
        alert('Save Changes Fired');
    }
    return (
        <Stack 
            screenOptions = {{
                title: 'Settings',
                headerRight: () => (
                    <Pressable
                        onPress={logout}
                    >
                        <Text>Logout</Text>
                    </Pressable>
                )
            }}
        />
    )
}