import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import { TextInput } from "react-native-paper";
import { changePassword } from "@/utils/account";
import Toast from 'react-native-toast-message';

type FormState = Record<string, {value: string, error?: string}>

export default function ChangePasswordForm () {
    const { user } = useAuth();
    const router = useRouter();
    const [formValues, setFormValues] = useState<FormState>({
        oldPassword: {
            value: '',
            error: 'Current password is required'
        },
        newPassword: {
            value: '',
            error: 'Password must be between 8-64 characters and contain at least one lowercase letter, uppercase letter, number, symbol.'
        },
        confirmNewPassword: {
            value: '',
            error: undefined
        }
    });

    const oldPwdProvided = (oldPwd: string) : string | undefined => {
        if (oldPwd.length > 0) return undefined;
        return 'Current password is required'
    }
    const matchNewAndConfirmPwdFields = (newPwd: string, cfrmPwd: string) : string | undefined => {
        if (newPwd !== cfrmPwd) {
            return 'New Password must match Confirm Password'
        }

        return undefined
    }
    const checkPwdRegex = (pwd: string) : string | undefined => {
        const missingPwdComponents: string[] = [];
        if (!/[a-z]/.test(pwd)) missingPwdComponents.push('lowercase letter');
        if (!/[A-Z]/.test(pwd)) missingPwdComponents.push('uppercase letter');
        if (!/[0-9]/.test(pwd)) missingPwdComponents.push('number');
        if (!/[^\w\s]/.test(pwd)) missingPwdComponents.push('symbol');

        const validLength : boolean = pwd.length > 7 && pwd.length < 65;

        if (validLength && missingPwdComponents.length === 0) return undefined;

        const errorStringParts : string[] = [];
        if (!validLength) errorStringParts.push('be between 8-64 characters');
        if (missingPwdComponents.length > 0) errorStringParts.push(`contain at least one ${missingPwdComponents.join(', ')}`);

        return `Password must ${errorStringParts.join(' and ')}.`;
    }

    const handleSubmit = async () => {
        const regexCheck = checkPwdRegex(formValues.newPassword.value);
        const passwordMatchCheck = matchNewAndConfirmPwdFields(formValues.newPassword.value, formValues.confirmNewPassword.value);
        if (regexCheck !== undefined || passwordMatchCheck !== undefined) {
            setFormValues({
                ...formValues,
                newPassword: {
                    ...formValues.newPassword,
                    error: regexCheck
                },
                confirmNewPassword: {
                    ...formValues.confirmNewPassword,
                    error: passwordMatchCheck
                }
            });

            alert('Validation Error');
            return;
        }

        const res = await changePassword(formValues.oldPassword.value, formValues.confirmNewPassword.value);
        if (res.ok) {
            router.back();
            Toast.show({
                type: 'success',
                text1: 'Password Changed',
                topOffset: 80,
            })
        }
        else {
            Toast.show({
                type: 'error',
                text1: res.error,
                topOffset: 80,
            })
        }
    }

    const submitDisabled : boolean = formValues.oldPassword.error !== undefined || formValues.newPassword.error !== undefined || formValues.confirmNewPassword.error !== undefined;

    if (!user) return <View><Text>Please login to access this page</Text></View>

    return (
        <View>
            <View>
                <TextInput 
                    label='Current Password'
                    value={formValues.oldPassword.value}
                    onChangeText={(s : string) => {
                        setFormValues({
                            ...formValues,
                            oldPassword: {
                                ...formValues.oldPassword,
                                value: s,
                                error: oldPwdProvided(s)
                            }
                        })
                    }}
                    mode="outlined"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                />
                {formValues.oldPassword.error && <Text>{formValues.oldPassword.error}</Text>}
                <TextInput
                    label='New Password'
                    value={formValues.newPassword.value}
                    onChangeText={(s : string) => {
                        setFormValues({
                            ...formValues,
                            newPassword: {
                                ...formValues.newPassword,
                                value: s,
                                error: checkPwdRegex(s)
                            },
                            confirmNewPassword: {
                                ...formValues.confirmNewPassword,
                                error: matchNewAndConfirmPwdFields(s, formValues.confirmNewPassword.value)
                            }
                        })
                    }}
                    mode="outlined"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                />
                {formValues.newPassword.error && <Text>{formValues.newPassword.error}</Text>}
                <TextInput
                    label='Confirm Password'
                    value={formValues.confirmNewPassword.value}
                    onChangeText={(s : string) => {
                        setFormValues({ 
                            ...formValues,
                            confirmNewPassword: {
                                error: matchNewAndConfirmPwdFields(formValues.newPassword.value, s),
                                value: s
                            }
                        })
                    }}
                    mode="outlined"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                />
                {formValues.confirmNewPassword.error && <Text>{formValues.confirmNewPassword.error}</Text>}
            </View>
            <View>
                <Pressable
                    onPress={handleSubmit}
                    disabled={submitDisabled}
                    style={{backgroundColor: submitDisabled ? 'red' : 'green'}}
                >
                    <Text>Submit</Text>
                </Pressable>
            </View>
        </View>
    )
}