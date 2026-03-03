import { View, Text, TextInput, Pressable } from 'react-native';
import { useState } from 'react';
import { SplitDay, SplitFormPayload } from '@/types/workouts';
import { Checkbox } from 'expo-checkbox';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { createSplit } from '@/utils/workouts';

// <--------- TO DO -------------->
/*
Implement advanced search for workout templates, text input runs basic string match on user's own workouts, limited results
Advanced Search:
Filters for muscle groups trained in workout, name, privacy, more than limited number of options returned on basic search
*/

export default function SplitForm() {
    const { data: workouts } = useWorkoutTemplates();
    const router = useRouter();
    const { user } = useAuth();

    const [newDayIndex, setNewDayIndex] = useState<number>(1);
    const [activeDay, setActiveDay] = useState<number>(0);
    const [splitName, setSplitName] = useState<string>('');
    const [exerciseListOpen, setExerciseListOpen] = useState<boolean>(true);
    const [form, setForm] = useState<SplitDay[]>([{
        dayIndex: 0,
        workoutTemplateId: '',
        workoutName: '',
        restDay: false,
    }]);

    const handleSubmit = async () => {
        if (!user) {
            alert('You must be logged in to edit a split');
            return;
        }
        const formPayload : SplitFormPayload = {
            username: user.username,
            splitName: splitName.toLowerCase().trim(),
            split: form.map((f, i) => {
                return {
                    workoutTemplateId: f.restDay ? '' : f.workoutTemplateId,
                    restDay: f.restDay,
                    dayIndex: i
                }
            })
        }

        const res = await createSplit(formPayload);
        if (res.message) {
            alert('Split successfully created');
            router.back();
        } else alert (`Error creating split: ${res.error}. Please try again`);
    }

    const handleAddDay = () => {
        setForm(prev => [
            ...prev,
            {
                dayIndex: newDayIndex,
                workoutTemplateId: '',
                workoutName: '',
                restDay: false,
            }
        ])
        setNewDayIndex(newDayIndex + 1);
    }

    const handleDeleteDay = (dayIndex: number) => { setForm(form.filter(f => f.dayIndex !== dayIndex)) }

    const handleSelectWorkout = (workoutId: string, workoutName: string, clickedIndex: number) => {
        setForm(prev => prev.map(p => p.dayIndex === clickedIndex ? {...p, workoutName: workoutName, workoutTemplateId: workoutId} : p));
        setExerciseListOpen(false);
    }

    return (
        <View>
            <View>
                <TextInput 
                    placeholder='Enter a name for your split'
                    value={splitName}
                    onChangeText={(value: string) => setSplitName(value)}
                />
            </View>
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
                                            value={day.restDay ? '' : day.workoutName}
                                            onChangeText={(value: string) => {
                                                setForm(prev =>
                                                    prev.map(d => d.dayIndex === day.dayIndex ? {...d, workoutName: value} : d )    
                                                );
                                            }}
                                            editable={!day.restDay}
                                            onFocus={() => {
                                                setActiveDay(day.dayIndex);
                                                setExerciseListOpen(true);
                                            }}
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

                                <View>
                                    { day.dayIndex === activeDay && exerciseListOpen && day.workoutName.length > 0 && (
                                        workouts?.filter(workout => workout.workoutname.includes(form[i].workoutName.toLowerCase().trim())).map(w => {
                                            return (
                                                <Pressable 
                                                    onPress={() => handleSelectWorkout(w.workoutid, w.workoutname, day.dayIndex)} 
                                                    key={w.workoutid}
                                                >
                                                    <Text>{w.workoutname}</Text>
                                                </Pressable>
                                            )
                                        })
                                    )}
                                </View>
                                
                            </View>
                        )
                    })
                }
                <Pressable onPress={handleAddDay}><Text>Add Day</Text></Pressable>
            </View>

            <View style={{display: 'flex', flexDirection: 'row', }}>
                <Pressable onPress={() => router.back()}>
                    <Text>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSubmit}>
                    <Text>Submit</Text>
                </Pressable>
            </View>
        </View>
    )
}