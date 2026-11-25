import { Pressable, Text, View } from "react-native";
import { TextInput } from "react-native-paper";
import { useReducer, useState } from "react";
import { fetchUsernameRecoveryQuestion, resetPassword } from "@/utils/account";
import { ResetPasswordFormType, ResetPasswordPayload, ResetPasswordReducerActions } from "@/types/user";
import ResetPasswordHiddenFields from "./ResetPasswordHiddenFields";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import styles from '../../../styles/formStyles';

const initialFormState : ResetPasswordFormType = {
    username: '',
    recoveryAnswer: '',
    newPassword: '',
    confirmNewPassword: ''
}

const resetPasswordReducer = (state : ResetPasswordFormType, action : ResetPasswordReducerActions) => {
    switch (action.type) {
        case 'UPDATE_USERNAME' : {
            return {
                ...state,
                username: action.value
            }
        }
        case 'UPDATE_NEW_PASSWORD' : {
            return {
                ...state,
                newPassword: action.value
            }
        }
        case 'UPDATE_CONFIRM_PASSWORD' : {
            return {
                ...state,
                confirmNewPassword: action.value
            }
        }
        case 'UPDATE_RECOVERY_ANSWER' : {
            return {
                ...state,
                recoveryAnswer: action.value
            }
        }
        case 'RESET_FORM' : {
            return initialFormState
        }
    }
}

export default function ResetPasswordForm () {
    const router = useRouter();
    const [form, dispatch] = useReducer(resetPasswordReducer, initialFormState);
    //Check entered username to display recovery question and new password fields.
    const [recoveryQuestion, setRecoveryQuestion] = useState<string | undefined>(undefined);

    const handleCheckUsername = async () => {
        const res = await fetchUsernameRecoveryQuestion(form.username.trim().toLowerCase());
        if (res.recoveryQuestion) {
            setRecoveryQuestion(res.recoveryQuestion);
            return;
        } else {
            setRecoveryQuestion(undefined);
        }
    }

    const handleResetUsername = () => {
        dispatch({type: 'RESET_FORM'});
        setRecoveryQuestion(undefined);
    }

    const handleSubmit = async () => {
        const payload : ResetPasswordPayload = {
            username: form.username.trim().toLowerCase(),
            recoveryAnswer: form.recoveryAnswer.trim().toLowerCase(),
            newPassword: form.newPassword
        }
        const res = await resetPassword(payload);
        if (res.message) {
            router.back()
            Toast.show({
                type: 'success',
                text1: 'Password Reset',
                topOffset: 80
            })
        } else {
            Toast.show({
                type: 'error',
                text1: res,
                text2: 'Please try again',
                topOffset: 80
            })
        }
    }

    return (
        <View>
            <Text>Reset Password</Text>

            <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                label="Username"
                value={form.username}
                onChangeText={(s) => dispatch({type: 'UPDATE_USERNAME', value: s})}
                mode="outlined"
                disabled={recoveryQuestion !== undefined}
            />

            {/* Show new password fields if username found, otherwise show button to check username */}
            {recoveryQuestion ?
                <View>
                    <Pressable onPress={handleResetUsername} style={styles.basicButton}>
                        <Text>Reset Username</Text>
                    </Pressable>
                    <Text>{recoveryQuestion}</Text>
                    <ResetPasswordHiddenFields 
                        recoveryAnswer={form.recoveryAnswer}
                        newPassword={form.newPassword}
                        confirmNewPassword={form.confirmNewPassword}
                        dispatch={dispatch}
                    />
                    <Pressable onPress={handleSubmit}>
                        <Text>Update Password</Text>
                    </Pressable>
                </View>
                :
                <View>
                    <Pressable onPress={handleCheckUsername} disabled={form.username === ''} style={styles.basicButton}>
                        <Text>Check Username</Text>
                    </Pressable>
                </View>
            }
            
        </View>
    )
}