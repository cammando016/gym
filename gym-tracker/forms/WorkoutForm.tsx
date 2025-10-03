import { Exercise, FormValues, SetTracker } from '@/types/workouts';
import { useRef, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import NewExercise from './NewExercise';

export default function WorkoutForm () {
    const exerciseIndex = useRef<number>(1);
    const [activeSet, setActiveSet] = useState<SetTracker>({exercise: 0, set: 0});
    const [form, setForm] = useState<FormValues>({ name: '', exercises: [{ id: 0, name: '', sets: [{ id: 0, type: 'working' }] }] });

    const setCounters = useRef<Record<number, number>>({0: 1});
    //Passed down to NewSet to show only one set type drop down at a time
    const updateActiveSet = (exerciseId: number, setId: number) => setActiveSet({exercise: exerciseId, set: setId});

    const handleAddExercise = () => {
        const newId = exerciseIndex.current;
        setCounters.current[newId] = 1;

        const newExercise: Exercise = {
            id: exerciseIndex.current,
            name: '',
            sets: [{id: 0, type: 'working'}]
        };

        exerciseIndex.current++;
        setForm({
            ...form,
            exercises: [...form.exercises, newExercise]
        });
    }

    const handleAddSet = (exerciseId: number) => {
        const nextSetId = setCounters.current[exerciseId] ?? 0;
        setCounters.current[exerciseId] = nextSetId + 1;

        const newData: FormValues = {
            ...form,
            exercises: form.exercises.map(exc => {
                if (exc.id === exerciseId) {
                    return {
                        ...exc,
                        sets: [...exc.sets, {id: nextSetId, type: 'working'}]
                    }
                }
                return exc;
            })
        }
        setForm(newData);
    }

    const handleRemoveExercise = (exerciseId: number) => {
        const newData: FormValues = {
            ...form,
            exercises: form.exercises.filter(exercise => exercise.id !== exerciseId)
        }

        delete setCounters.current[exerciseId];
        setForm(newData)
    }

    const handleRemoveSet = (exerciseId: number, setId: number) => {
        const newData: FormValues = {
            ...form,
            exercises: form.exercises.map(exc => {
                if(exc.id === exerciseId) {
                    return {
                        ...exc,
                        sets: exc.sets.filter(set => set.id !== setId)
                    }
                }
                return exc;
            })
        }
        setForm(newData);
    }

    const simSubmit = () => {
        alert(JSON.stringify(form));
    }

    return (
        <View>
            <View>
                <Text>Workout Name</Text>
                <TextInput 
                    placeholder='Enter workout name'
                    value={form.name}
                    onChangeText={(text: string) => setForm({...form, name: text})}
                />
            </View>

            <View>
                <View id='exercises'>
                    {
                        form.exercises.map(exercise => {
                            return <NewExercise key={exercise.id} form={form} updateForm={setForm} exercise={exercise} exerciseCount={Object.keys(setCounters.current).length} removeExc={handleRemoveExercise} addSet={handleAddSet} removeSet={handleRemoveSet} activeSet={activeSet} updateActiveSet={updateActiveSet}></NewExercise>
                        })
                    }
                </View>

                <View>
                    <Button title='Add Exercise' onPress={handleAddExercise} />
                </View>
            </View>

            <View style={{display: 'flex', flexDirection: 'row'}}>
                <Button title='Cancel' />
                {/* Still need to make sure reset clears set and exercise id counters */}
                <Button title='Reset Form' onPress={() => setForm({ name: '', exercises: [{ id: 0, name: '', sets: [{ id: 0, type: 'working' }] }] })} />
                <Button title='Submit' onPress={simSubmit} />
            </View>
        </View>
    )
}