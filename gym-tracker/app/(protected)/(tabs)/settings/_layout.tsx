import { useAuth } from '@/contexts/AuthContext';
import { Stack } from 'expo-router';
import { Pressable, Text } from 'react-native';

export default function SettingsLayout() {
    const { logout } = useAuth();
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                title: 'Settings',
                headerRight: () => (
                    <Pressable onPress={logout}>
                    <Text>Logout</Text>
                    </Pressable>
                ),
                }}
            />
            <Stack.Screen
                name="change-recovery"
                options={{ title: 'Change Recovery' }}
            />
            <Stack.Screen 
                name="change-password"
                options={{ title: 'Change Password' }}
            />
            </Stack>
        );
}