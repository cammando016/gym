import { View, Text, TextInput, Pressable } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { SplitDay } from '@/types/workouts';
import { Checkbox } from 'expo-checkbox';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';

export default function SplitForm() {
    const { user } = useAuth();
    const { data: workouts } = useWorkoutTemplates();

    const [newDayIndex, setNewDayIndex] = useState<number>(1);
    const [form, setForm] = useState<SplitDay[]>([{
        dayIndex: 0,
        workoutTemplateId: '',
        restDay: false,
    }]);

    const handleAddDay = () => {
        setForm(prev => [
            ...prev,
            {
                dayIndex: newDayIndex,
                workoutTemplateId: '',
                restDay: false,
            }
        ])
        setNewDayIndex(newDayIndex + 1);
    }

    const handleDeleteDay = (dayIndex: number) => { setForm(form.filter(fo => fo.dayIndex !== dayIndex)) }

    return (
        <View>
            {
                form.map((day, i) => {
                    return (
                        <View key={day.dayIndex}>
                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text>Day {i + 1}:</Text>
                                <View style={{flexGrow: 1, borderWidth: 0.5, borderColor: 'black'}}>
                                    <TextInput
                                        placeholder={day.restDay ? 'REST DAY SELECTED' : 'Search Workout Templates'}
                                        value={day.restDay ? '' : day.workoutTemplateId}
                                        onChangeText={(value: string) => setForm(prev =>
                                            prev.map(d => d.dayIndex === day.dayIndex ? {...d, workoutTemplateId: value} : d )    
                                        )}
                                        editable={!day.restDay}
                                    />
                                </View>
                                <View style={{display: 'flex', flexDirection: 'row'}}>
                                    <Checkbox 
                                        value={day.restDay}
                                        onValueChange={(value: boolean) => setForm(prev =>
                                            prev.map(d => d.dayIndex === day.dayIndex ? {...d, restDay: value} : d )
                                        )}
                                    />
                                    <Text>Rest Day</Text>
                                </View>
                                { form.length > 1 && <Pressable onPress={() => handleDeleteDay(day.dayIndex)} style={{borderWidth: 0.5, borderColor: 'black'}}><Text>X</Text></Pressable> }
                            </View>
                        </View>
                    )
                })
            }
            <Pressable onPress={handleAddDay}><Text>Add Day</Text></Pressable>
        </View>
    )
}