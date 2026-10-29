import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import { TextInput } from "react-native-paper";
import { changePassword } from "@/utils/account";


export default function ChangePasswordForm () {
    const { user } = useAuth();
    const router = useRouter();
    const [formValues, setFormValues] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const handleSubmit = async () => {
        const res = await changePassword(formValues.oldPassword, formValues.confirmNewPassword);
        if (res.ok) router.back();
    }

    if (!user) return <View><Text>Please login to access this page</Text></View>

    return (
        <View>
            <View>
                <TextInput 
                    label='Current Password'
                    value={formValues.oldPassword}
                    onChangeText={(s : string) => {
                        setFormValues({
                            ...formValues,
                            oldPassword: s
                        })
                    }}
                    mode="outlined"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                />
                <TextInput
                    label='New Password'
                    value={formValues.newPassword}
                    onChangeText={(s : string) => {
                        setFormValues({
                            ...formValues,
                            newPassword: s
                        })
                    }}
                    mode="outlined"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                />
                <TextInput
                    label='Confirm Password'
                    value={formValues.confirmNewPassword}
                    onChangeText={(s : string) => {
                        setFormValues({
                            ...formValues,
                            confirmNewPassword: s
                        })
                    }}
                    mode="outlined"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                />
            </View>
            <View>
                <Pressable
                    onPress={handleSubmit}
                >
                    <Text>Submit</Text>
                </Pressable>
            </View>
        </View>
    )
}