import { Pressable, Text, View } from "react-native";
import { TextInput } from "react-native-paper";
import { useReducer, useState } from "react";
import { fetchUsernameRecoveryQuestion, resetPassword } from "@/utils/account";
import { ResetPasswordFormType, ResetPasswordPayload, ResetPasswordReducerActions } from "@/types/user";
import ResetPasswordHiddenFields from "./ResetPasswordHiddenFields";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import styles from '../../../styles/formStyles';
import { checkPwdRegex } from "@/utils/formValiditors";

const initialFormState : ResetPasswordFormType = {
    values: {
        username: '',
        recoveryAnswer: '',
        newPassword: '',
        confirmNewPassword: ''
    },
    errors: {
        username: undefined,
        recoveryAnswer: undefined,
        newPassword: undefined,
        confirmNewPassword: undefined
    }
}

const validateForm = (values: {username: string, recoveryAnswer: string, newPassword: string, confirmNewPassword: string}) => {
    return {
        username: values.username.trim() === '' ? 'Username is required' : undefined,
        recoveryAnswer: values.recoveryAnswer.trim() === '' ? 'Recovery question response is required' : undefined,
        newPassword: checkPwdRegex(values.newPassword),
        confirmNewPassword: values.newPassword !== values.confirmNewPassword ? 'Confirm password does not match new password' : undefined
    }
};

const resetPasswordReducer = (state : ResetPasswordFormType, action : ResetPasswordReducerActions) => {
    switch (action.type) {
        case 'UPDATE_USERNAME' : {
            return {
                ...state,
                values: {
                    ...state.values,
                    username: action.value
                }
            }
        }
        case 'VALIDATE_USERNAME' : {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    username: action.value === '' ? 'Username is required' : undefined
                }
            }
        }
        case 'UPDATE_NEW_PASSWORD' : {
            return {
                ...state,
                values: {
                    ...state.values,
                    newPassword: action.value
                }
            }
        }
        case 'VALIDATE_NEW_PASSWORD' : {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    newPassword: action.value === '' ? 'Password is required' : checkPwdRegex(action.value)
                }
            }
        }
        case 'UPDATE_CONFIRM_PASSWORD' : {
            return {
                ...state,
                values: {
                    ...state.values,
                    confirmNewPassword: action.value
                }
            }
        }
        case 'VALIDATE_CONFIRM_PASSWORD' : {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    confirmNewPassword: state.values.newPassword === action.value ? undefined : 'Confirm password does not match new password'
                }
            }
        }
        case 'UPDATE_RECOVERY_ANSWER' : {
            return {
                ...state,
                values: {
                    ...state.values,
                    recoveryAnswer: action.value
                }
            }
        }
        case 'VALIDATE_RECOVERY_ANSWER' : {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    recoveryAnswer: action.value === '' ? 'Recovery question response is required' : undefined
                }
            }
        }
        case 'RESET_FORM' : {
            return {
                ...initialFormState,
                errors: {
                    ...initialFormState.errors,
                    username: 'Username is required'
                }
            }
        }
        case 'RESET_AFTER_RECOVERY_FAILURE' : {
            return {
                ...state,
                values: {
                    ...state.values,
                    recoveryAnswer: '',
                    newPassword: '',
                    confirmNewPassword: ''
                }
            }
        }
        case 'VALIDATE_FORM' : {
            return {
                ...state,
                errors: validateForm(state.values)
            }
        }
    }
}

export default function ResetPasswordForm () {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [form, dispatch] = useReducer(resetPasswordReducer, initialFormState);
    //Check entered username to display recovery question and new password fields.
    const [recoveryQuestion, setRecoveryQuestion] = useState<string | undefined>(undefined);

    const handleCheckUsername = async () => {
        const res = await fetchUsernameRecoveryQuestion(form.values.username.trim().toLowerCase());
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

    const hasEmptyFields : boolean = Object.values(form.values).some(val => val === '');

    const handleSubmit = async () => {
        if (isSubmitting) return;

        const errors = validateForm(form.values);
        dispatch({type: 'VALIDATE_FORM'});
        if (Object.values(errors).some(err => err !== undefined)) return;

        setIsSubmitting(true);
        try {
            const payload : ResetPasswordPayload = {
                username: form.values.username.trim().toLowerCase(),
                recoveryAnswer: form.values.recoveryAnswer.trim().toLowerCase(),
                newPassword: form.values.newPassword
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
                });
                dispatch({type: 'RESET_AFTER_RECOVERY_FAILURE'})
            }
        } catch (error) {
            Toast.show({
                type:'error',
                text1: 'Something went wrong',
                text2: 'Please try again',
                topOffset: 80
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View>
            <Text>Reset Password Form</Text>

            <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                label="Username *"
                value={form.values.username}
                onChangeText={(s) => {
                    dispatch({type: 'UPDATE_USERNAME', value: s});
                    dispatch({type: 'VALIDATE_USERNAME', value: s})
                }}
                mode="outlined"
                disabled={recoveryQuestion !== undefined}
            />
            {form.errors.username && <Text>{form.errors.username}</Text>}

            {/* Show new password fields if username found, otherwise show button to check username */}
            {recoveryQuestion ?
                <View>
                    <Pressable onPress={handleResetUsername} style={styles.basicButton}>
                        <Text>Reset Username</Text>
                    </Pressable>
                    <Text>{recoveryQuestion}</Text>
                    <ResetPasswordHiddenFields 
                        recoveryAnswer={form.values.recoveryAnswer} 
                        recoveryAnswerError={form.errors.recoveryAnswer}
                        newPassword={form.values.newPassword}
                        newPasswordError={form.errors.newPassword}
                        confirmNewPassword={form.values.confirmNewPassword}
                        confirmNewPasswordError={form.errors.confirmNewPassword}
                        dispatch={dispatch}
                    />
                    <Pressable onPress={handleSubmit} disabled={hasEmptyFields || isSubmitting} style={styles.basicButton}>
                        <Text style={{color: hasEmptyFields ? 'red' : 'green'}}>{isSubmitting ? 'Resetting...' : 'Reset Password'}</Text>
                    </Pressable>
                </View>
                :
                <View>
                    <Pressable onPress={handleCheckUsername} disabled={form.values.username === ''} style={styles.basicButton}>
                        <Text style={{color: form.values.username === '' ? 'red' : 'green'}}>Check Username</Text>
                    </Pressable>
                </View>
            }
            
        </View>
    )
}