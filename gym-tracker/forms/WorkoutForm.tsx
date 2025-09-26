import { useState } from 'react';
import { Button, ScrollView, Text, TextInput, View } from 'react-native';

type SetType = 'backoff' | 'working' | 'warmup';

interface Set {
    id: number;
    type: SetType;
}

interface Exercise {
    id: number;
    name: string;
    sets: Set[];
}

interface FormValues {
    name: string;
    exercises: Exercise[];
}

export default function WorkoutForm () {
    const [form, setForm] = useState<FormValues>({name: '', exercises: []});
    
    const simSubmut = () => {
        alert(form.name);
    }

    return (
        <ScrollView>
            <View>
                <Text>Workout Name</Text>
                <TextInput 
                    placeholder='Workout Name'
                    value={form.name}
                    onChangeText={(text: string) => setForm({...form, name: text})}
                />
            </View>

            <Button title='Submit' onPress={simSubmut} />
        </ScrollView>
    )
}