import { useState } from 'react';
import { Switch, Text, TextInput, View } from 'react-native';
import { FormValues, Weekday } from '../types/schedule';

const weekdays: Weekday[] = [
    {id: 0, name: 'Sunday'},
    {id: 0, name: 'Monday'},
    {id: 0, name: 'Tuesday'},
    {id: 0, name: 'Wednesday'},
    {id: 0, name: 'Thursday'},
    {id: 0, name: 'Friday'},
    {id: 0, name: 'Saturday'}
]

export default function ScheduleForm() {
    const [form, setForm] = useState<FormValues[]>([
        {
            weekday: 0,
            restDay: false,
            scheduledWorkout: ''
        },
        {
            weekday: 1,
            restDay: false,
            scheduledWorkout: ''
        },
        {
            weekday: 2,
            restDay: false,
            scheduledWorkout: ''
        },
        {
            weekday: 3,
            restDay: false,
            scheduledWorkout: ''
        },
        {
            weekday: 4,
            restDay: false,
            scheduledWorkout: ''
        },
        {
            weekday: 5,
            restDay: false,
            scheduledWorkout: ''
        },
        {
            weekday: 6,
            restDay: false,
            scheduledWorkout: ''
        }
    ])

    return (
        <View>
            <View>
                <Text>Edit Schedule</Text>
            </View>

            {
                form.map((formDay, i) => {
                    return (
                        <View
                            key={formDay.weekday}
                        >
                            <Text>{weekdays[formDay.weekday].name}</Text>

                            <View style={{display: 'flex', flexDirection: 'row'}}>
                                <Text>Rest Day:</Text>
                                <Switch 
                                    value={formDay.restDay}
                                    onValueChange={() => {
                                        const newForm = [...form];
                                        newForm[i] = {...formDay, restDay: !formDay.restDay, scheduledWorkout: ''}
                                        setForm(newForm);
                                    }}
                                />    
                            </View>

                            {!formDay.restDay &&
                                <View>
                                    <Text>Scheduled Workout:</Text>
                                    <TextInput 
                                        placeholder='Workout Name'
                                        value={formDay.scheduledWorkout}
                                        onChangeText={(text: string) => {
                                            const newForm = [...form];
                                            newForm[i] = {...formDay, scheduledWorkout: text};
                                            setForm(newForm);
                                        }}
                                        editable={!formDay.restDay}
                                    />
                                </View>
                            }
                        </View>
                    )
                })
            }
        </View>
    )
}