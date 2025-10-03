import { FormValues, SetTracker, SetType } from '@/types/workouts';
import { Button, Text, TextInput, View } from 'react-native';
import { Exercise } from '../types/workouts.ts';
import NewSet from './NewSet';

interface Props {
    exercise: Exercise,
    exerciseCount: number,
    removeExc: (id: number) => void,
    addSet: (exerciseId: number) => void,
    removeSet: (exerciseId: number, setId: number) => void,
    activeSet: SetTracker,
    updateActiveSet: (exerciseId: number, setId: number) => void
    form: FormValues
    updateForm: (form: FormValues) => void
}

export default function NewExercise(props: Props) {
    const setsLength: number = props.exercise.sets.length;

    return (
        <View>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text>Exercise Name</Text>
                {
                    props.exerciseCount > 1 && <Button title='Remove Excerise' onPress={() => props.removeExc(props.exercise.id)} />
                }
            </View>
            <View>
                <TextInput 
                    placeholder='Enter exercise name'
                    value={props.form.exercises[props.exercise.id].name}
                    onChangeText={(text: string) => { 
                        props.updateForm({ ...props.form, exercises: props.form.exercises.map(exc => {
                            if(exc.id === props.exercise.id) {
                                return {...exc, name: text}
                            } 
                            return exc
                        })})}
                    }
                />
            </View>

            <View>
                {
                    props.exercise.sets.map((set: { id: number, type: SetType }) => {
                        return <NewSet key={set.id} form={props.form} updateForm={props.updateForm} exerciseId={props.exercise.id} set={set} setCount={setsLength} removeSet={props.removeSet} activeSet={props.activeSet} updateActiveSet={props.updateActiveSet} />
                    })
                }
            </View>

            <View>
                <Button title='Add Set' onPress={() => props.addSet(props.exercise.id)} />
            </View>
            
        </View>
    )
}