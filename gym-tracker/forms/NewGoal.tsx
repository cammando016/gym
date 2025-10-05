import { Goal } from '@/types/progression';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

interface FormValues {
    goal: Goal;
}

export default function NewGoal() {
    const today = new Date();
    const [form, setForm] = useState<FormValues>({goal: {goalType: '1RM', target: '', targetDay: 1, targetMonth: today.getMonth() + 1, targetYear: today.getFullYear()}});

    return (
        <View>
            <Pressable>
                <Text></Text>
            </Pressable>
        </View>
    )
}