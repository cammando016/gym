import LogonForm from "@/forms/Logon";
import { View, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function Login() {
    const router = useRouter();

    return (
        <View>
            <LogonForm></LogonForm>
            <Pressable onPress={() => router.navigate("/(auth)/signup")}>
                <Text>Signup</Text>
            </Pressable>
        </View>
    )
}