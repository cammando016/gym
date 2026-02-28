import { LogonFormValues } from "@/types/user";
import { useState } from "react";
import { useRouter } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { logon } from "@/utils/account";
import { useAuth } from "@/contexts/AuthContext";

export default function LogonForm() {
    const [form, setForm] = useState<LogonFormValues>({
        username: '',
        password: ''
    });

    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async() => {
        const res = await logon(form);
        if (res.status === 200) {
            alert('Successful Logon');
            login(res.token, res.user);
        }
        else alert (`Logon Error: ${res.message}`);
    }

    return (
        <View>
            <Text>Username</Text>
            <TextInput
                placeholder='Enter your username'
                autoCapitalize='none'
                autoCorrect={false}
                value={form.username}
                onChangeText={(s: string) => setForm({...form, username: s})}
            />
            <Text>Password:</Text>
            <TextInput 
                placeholder='Enter your password'
                autoCapitalize='none'
                autoCorrect={false}
                value={form.password}
                onChangeText={(s: string) => setForm({...form, password: s})}
            />
            <View>
                <Pressable>
                    <Text>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSubmit}>
                    <Text>Logon</Text>
                </Pressable>
            </View>

            {/* <Pressable onPress={() => login()}>
                <Text>Login Test</Text>
            </Pressable> */}
        </View>
    )
}