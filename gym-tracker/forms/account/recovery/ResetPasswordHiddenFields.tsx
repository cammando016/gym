import { ResetPasswordReducerActions } from "@/types/user";
import { Dispatch } from "react";
import { View } from "react-native";
import { TextInput } from "react-native-paper";

interface Props {
    recoveryAnswer: string,
    newPassword: string,
    confirmNewPassword: string,
    dispatch: Dispatch<ResetPasswordReducerActions>,
}

export default function ResetPasswordHiddenFields (props: Props) {
    return (
        <View>
            <TextInput
                label='Recovery Question Response'
                value={props.recoveryAnswer}    
                autoCorrect={false}
                onChangeText={(s) => props.dispatch({type: 'UPDATE_RECOVERY_ANSWER', value: s})}
            />
            <TextInput 
                value={props.newPassword}
                label="New Password"
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={(s) => props.dispatch({type: 'UPDATE_NEW_PASSWORD', value: s})}
            />
            <TextInput 
                value={props.confirmNewPassword}
                label='Confirm New Password'
                autoCorrect={false}
                autoCapitalize='none'
                onChangeText={(s) => props.dispatch({type: 'UPDATE_CONFIRM_PASSWORD', value: s})}
            />
        </View>
    )
}