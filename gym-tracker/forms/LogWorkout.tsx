import { Text, View, TextInput, ScrollView } from 'react-native';
import { useState } from 'react';
import { WorkoutTemplateType } from '@/types/workouts';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import LogExercise from './LogExercise';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';

interface Props {
    sessionId: string,
    templateId: string
}

export default function LogWorkout (props: Props) {
    const { data: workouts } = useWorkoutTemplates();
    const workoutTemplate : WorkoutTemplateType | undefined = workouts?.find(w => w.workoutId === props.templateId);
    const { data: lastTrained } = useWorkoutHistory(props.templateId);

    console.log(workoutTemplate);
    console.log(lastTrained);

    return (
        <ScrollView>
            <View>
                <Text>Last {workoutTemplate?.workoutName} session notes: {lastTrained?.workoutNotes}</Text>
                <View>
                    {
                        workoutTemplate?.exercises.map(e => {
                            return (<LogExercise key={e.exerciseIndex} exerciseTemplate={e} lastTrainedExercise={lastTrained?.exercises.find(exc => exc.exerciseId === e.exerciseId)}></LogExercise>)
                        })
                    }
                </View>
            </View>
        </ScrollView>
    )
}