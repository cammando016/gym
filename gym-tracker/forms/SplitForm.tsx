import { View, Text, TextInput, Pressable } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from 'expo-checkbox';
import { useState } from 'react';

export default function SplitForm() {
    const { user } = useAuth();
    const [form, setForm] = useState<any>({
        weekday: {
            name: '',
            workoutTemplate: '',
            restDay: false,
        }
    })

    return (
        <View>
            <View>
                <Text>Saturday</Text>
                <TextInput 
                    placeholder='Select Workout'
                />
                <Checkbox />
                <Text>Set Rest Day</Text>
            </View>
        </View>
    )
}