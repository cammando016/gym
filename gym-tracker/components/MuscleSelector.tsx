import { Exercise, FormValues } from '@/types/workouts';
import { Text, View } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { Muscle } from '../types/workouts.ts';

interface Props {
    muscleList: Muscle[],
    exercise: Exercise,
    form: FormValues,
    updateForm: (form: FormValues) => void,
}

export default function MuscleSelector(props: Props) {
    return (
        <View>
            <RadioButton.Group
                value={props.form.exercises[props.exercise.index].targetMuscle}
                onValueChange={(value: string) => {
                    props.updateForm({ ...props.form, exercises: props.form.exercises.map(exc => {
                        if(exc.index === props.exercise.index) return {...exc, targetMuscle: value}
                        return exc
                    }) })
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