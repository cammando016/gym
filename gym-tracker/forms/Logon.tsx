import { LogonFormValues } from "@/types/user";
import { useState } from "react";
import { useRouter } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { logon } from "@/utils/account";

export default function LogonForm() {
    const [form, setForm] = useState<LogonFormValues>({
        username: '',
        password: ''
    });

    const router = useRouter();

    const handleSubmit = async(e: any) => {
        e.preventDefault();
        const res = await logon(form);
        if (res.message) {
            alert('Successful Logon');
            router.replace('/(tabs)');
        }
        else alert (`Logon Error ${res.message}`);
    }

    return (
        <View>
            <Text>Username</Text>
            <TextInput
                placeholder='Enter your username'
                value={form.username}
                onChangeText={(s: string) => setForm({...form, username: s})}
            />
            <Text>Password:</Text>
            <TextInput 
                placeholder='Enter your password'
            />
            <View>
                <Pressable>
                    <Text>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSubmit}>
                    <Text>Logon</Text>
                </Pressable>
            </View>
        </View>
    )
}