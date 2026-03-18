import { Text, View, TextInput } from 'react-native';
import { useState } from 'react';
import { WorkoutTemplateType } from '@/types/workouts';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';

interface Props {
    workoutTemplateId: string
}

export default function LogWorkout (props: Props) {
    const { data: workouts } = useWorkoutTemplates();
    const workoutTemplate : WorkoutTemplateType | undefined = workouts?.find(w => w.workoutId = props.workoutTemplateId);

    console.log(workoutTemplate);

    return (
        <View>
            <View>
                <Text>{workoutTemplate?.workoutName}</Text>
                <View>
                    {
                        workoutTemplate?.exercises.map(e => {
                            return (
                                <View key={e.exerciseIndex}>
                                    <Text>{e.exerciseName}</Text>
                                </View>
                            )
                        })
                    }
                </View>
            </View>
        </View>
    )
}