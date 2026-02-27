import { Exercise, WorkoutAction } from '@/types/workouts';
import { Dispatch } from 'react';
import { Text, View } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { Muscle } from '../types/workouts';

interface Props {
    muscleList: Muscle[],
    exercise: Exercise,
    updateForm: Dispatch<WorkoutAction>,
}

export default function MuscleSelector(props: Props) {
    return (
        <View>
            <RadioButton.Group
                value={`${props.exercise.targetMuscle}`}
                onValueChange={(s: string) => {
                    props.updateForm({ type: 'SET_DB_EXERCISE_TARGET_MUSCLE', exerciseIndex: props.exercise.index, value: s })
                }}
            >
                {
                    props.muscleList.map((muscle: Muscle) => {
                        return (
                            <View key={muscle.id} style={{display: 'flex', flexDirection: 'row'}}>
                                <RadioButton value={muscle.id} />
                                <Text>{`${muscle.name.slice(0, 1).toUpperCase()}${muscle.name.slice(1)}`}</Text>
                            </View>
                        )
                    })
                }   
            </RadioButton.Group>
        </View>
    )
}