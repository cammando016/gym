import LogonForm from "@/forms/Logon";
import { View, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function Login() {
    const router = useRouter();

    return (
        <View>
            <LogonForm />
            <Pressable onPress={() => router.navigate("/(auth)/forgotPassword")}>
                <Text>Forgot Password?</Text>
            </Pressable>
            <Pressable onPress={() => router.navigate("/(auth)/signup")}>
                <Text>Signup</Text>
            </Pressable>
        </View>
    )
}