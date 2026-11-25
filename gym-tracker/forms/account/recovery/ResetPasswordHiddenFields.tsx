import { ResetPasswordReducerActions } from "@/types/user";
import { Dispatch } from "react";
import { View, Text } from "react-native";
import { TextInput } from "react-native-paper";

interface Props {
    recoveryAnswer: string,
    recoveryAnswerError: string | undefined,
    newPassword: string,
    newPasswordError: string | undefined,
    confirmNewPassword: string,
    confirmNewPasswordError: string | undefined,
    dispatch: Dispatch<ResetPasswordReducerActions>,
}

export default function ResetPasswordHiddenFields (props: Props) {
    return (
        <View>
            <TextInput
                label='Recovery Question Response *'
                value={props.recoveryAnswer}    
                autoCorrect={false}
                onChangeText={(s) => props.dispatch({type: 'UPDATE_RECOVERY_ANSWER', value: s})}
                onEndEditing={(e) => props.dispatch({type: 'VALIDATE_RECOVERY_ANSWER', value: e.nativeEvent.text})}
            />
            {props.recoveryAnswerError && <Text>{props.recoveryAnswerError}</Text>}
            <TextInput 
                value={props.newPassword}
                label="New Password *"
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={(s) => props.dispatch({type: 'UPDATE_NEW_PASSWORD', value: s})}
                onEndEditing={(e) => props.dispatch({type: 'VALIDATE_NEW_PASSWORD', value: e.nativeEvent.text})}
            />
            {props.newPasswordError && <Text>{props.newPasswordError}</Text>}
            <TextInput 
                value={props.confirmNewPassword}
                label='Confirm New Password *'
                autoCorrect={false}
                autoCapitalize='none'
                onChangeText={(s) => props.dispatch({type: 'UPDATE_CONFIRM_PASSWORD', value: s})}
                onEndEditing={(e) => props.dispatch({type: 'VALIDATE_CONFIRM_PASSWORD', value: e.nativeEvent.text})}
            />
            {props.confirmNewPasswordError && <Text>{props.confirmNewPasswordError}</Text>}
        </View>
    )
}