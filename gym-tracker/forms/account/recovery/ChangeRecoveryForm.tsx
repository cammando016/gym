import { useAuth } from "@/contexts/AuthContext";
import { recoveryQuestions } from "@/data/recoveryQuestions";
import { changeRecovery } from "@/utils/account";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { TextInput } from "react-native-paper";
import Toast from "react-native-toast-message";

export default function ChangeRecoveryForm () {
    const { user } = useAuth();
    const router = useRouter();
    const recoveryQuestionList: string[] = recoveryQuestions;
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const [formValues, setFormValues] = useState({
        recoveryQuestion: user ? user.recoveryQuestion : '',
        recoveryAnswer: '',
        password: ''
    })

    const handleSubmit = async () => {
        const res = await changeRecovery(formValues.password, formValues.recoveryQuestion, formValues.recoveryAnswer)
        if (res.ok) {
            Toast.show({
                type: 'success',
                topOffset: 80,
                text1: 'Recovery question updated'
            })
            router.back();
        } else {
            Toast.show({
                type: 'error',
                topOffset: 80,
                text1: res.error
            })
        }
    }

    const toggleDropdownOpen = () => setDropdownOpen(prev => !prev);

    if (!user) return <View><Text>Please login to access this page.</Text></View>

    return (
        <View>
            <View>
                <Pressable onPress={toggleDropdownOpen}>
                    <View pointerEvents="none">
                        <TextInput 
                            mode='flat'
                            label='Recovery Question'
                            value={formValues.recoveryQuestion}
                            editable={false}
                            right={
                                <TextInput.Affix 
                                    text=">"
                                    textStyle={{transform : [{rotate: dropdownOpen ? '90deg' : '0deg'}] }}
                                />
                            }
                        />
                    </View>
                </Pressable>
                {dropdownOpen &&
                    recoveryQuestionList.filter(q => q !== formValues.recoveryQuestion).map(q => {
                        return (
                            <Pressable 
                                key={q}
                                onPress={() => {
                                    setFormValues({
                                        ...formValues,
                                        recoveryQuestion: q,
                                        recoveryAnswer: ''
                                    });
                                    setDropdownOpen(prev => !prev);
                                }}
                            >
                                <Text>{q}</Text>
                            </Pressable>
                        )
                    })
                }
                <TextInput 
                    mode="outlined"
                    label="Recovery Answer"
                    value={formValues.recoveryAnswer}
                    onChangeText={(s: string) => setFormValues({
                        ...formValues,
                        recoveryAnswer: s
                    })}
                />
                <Text>Please confirm password to update recovery question</Text>
                <TextInput 
                    mode="outlined"
                    label="Password"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                    value={formValues.password}
                    onChangeText={(s: string) => setFormValues({
                        ...formValues,
                        password: s
                    })}
                />
            </View>
            <View>
                <Pressable onPress={handleSubmit}>
                    <Text>Submit</Text>
                </Pressable>
            </View>
        </View>
    )
}