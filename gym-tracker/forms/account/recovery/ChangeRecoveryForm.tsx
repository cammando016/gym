import { useAuth } from "@/contexts/AuthContext";
import { recoveryQuestions } from "@/data/recoveryQuestions";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { TextInput } from "react-native-paper";

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

    if (!user) return <View><Text>Please login to access this page.</Text></View>

    return (
        <View>
            <View>
                <Text>Recovery Question</Text>
                <Pressable
                    onPress={() => setDropdownOpen(prev => !prev)}
                >
                    <Text>{formValues.recoveryQuestion}</Text>
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
                    value={formValues.password}
                    onChangeText={(s: string) => setFormValues({
                        ...formValues,
                        password: s
                    })}
                />
            </View>
            <View>
                <Pressable>
                    <Text>Submit</Text>
                </Pressable>
                <Pressable
                    onPress={() => router.back()}
                >
                    <Text>Cancel</Text>
                </Pressable>
            </View>
        </View>
    )
}