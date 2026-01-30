import { Exercise, FormValues, SetTracker, PrivacyType } from '@/types/workouts';
import { useRef, useState } from 'react';
import { Button, Text, TextInput, View, ScrollView, StyleSheet } from 'react-native';
import { RadioButton } from 'react-native-paper';
import NewExercise from './NewExercise';
import { validateRequiredAlphanumericSymbolsField } from '../utils/formValiditors';

export default function WorkoutForm () {
    const exerciseIndex = useRef<number>(1);
    const [activeSet, setActiveSet] = useState<SetTracker>({exercise: 0, set: 0});
    const [activeExercise, setActiveExercise] = useState<number>(0);
    const [form, setForm] = useState<FormValues>({ name: '', privacy: 'private', exercises: [{ index: 0, dbId: 0, name: '', repRangeLower: 0, repRangeHigher: 0, isUnilateral: false, sets: [{ id: 0, type: 'working', isUnilateral: false }] }] });

    const setCounters = useRef<Record<number, number>>({0: 1});
    //Passed down to NewSet to show only one set type drop down at a time
    const updateActiveSet = (exerciseId: number, setId: number) => setActiveSet({exercise: exerciseId, set: setId});
    const updateActiveExercise = (exerciseIndex: number) => setActiveExercise(exerciseIndex);

    const handleAddExercise = () => {
        const newId = exerciseIndex.current;
        setCounters.current[newId] = 1;

        const newExercise: Exercise = {
            index: exerciseIndex.current,
            dbId: 0,
            name: '',
            repRangeLower: 0,
            repRangeHigher: 0,
            isUnilateral: false,
            sets: [{id: 0, type: 'working', isUnilateral: false}]
        };

        exerciseIndex.current++;
        setForm(prev => ({
            ...prev,
            exercises: [...prev.exercises, newExercise]
        }));
    }

    const handleAddSet = (exerciseId: number) => {
        const nextSetId = setCounters.current[exerciseId] ?? 0;
        setCounters.current[exerciseId] = nextSetId + 1;

        const newData: FormValues = {
            ...form,
            exercises: form.exercises.map(exc => {
                if (exc.index === exerciseId) {
                    return {
                        ...exc,
                        sets: [...exc.sets, {id: nextSetId, type: 'working', isUnilateral: false}]
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
            exercises: form.exercises.filter(exercise => exercise.index !== exerciseId)
        }

        delete setCounters.current[exerciseId];
        setForm(newData)
    }

    const handleRemoveSet = (exerciseId: number, setId: number) => {
        const newData: FormValues = {
            ...form,
            exercises: form.exercises.map(exc => {
                if(exc.index === exerciseId) {
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

    const styles = StyleSheet.create({
        privacy: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-evenly'
        }
    })

    return (
        <View>
            <ScrollView>
                <View>
                    <Text>Workout Name</Text>
                    <TextInput 
                        placeholder='Enter workout name'
                        value={form.name}
                        onChangeText={(text: string) => setForm(prev => ({...prev, name: text}))}
                    />
                </View>
                
                <RadioButton.Group onValueChange={(newValue: PrivacyType) => setForm(prev => ({...prev, privacy: newValue}))} value={form.privacy}>
                    <View style={[styles.privacy]}>
                        <View>
                            <Text>Private</Text>
                            <RadioButton value='private'/>
                        </View>
                        <View>
                            <Text>Friends</Text>
                            <RadioButton value='friends'/>
                        </View>
                        <View>
                            <Text>Public</Text>
                            <RadioButton value='public'/>
                        </View>
                    </View>
                </RadioButton.Group>

                <View>
                    <View id='exercises'>
                        {
                            form.exercises.map(exercise => {
                                return <NewExercise key={exercise.index} form={form} updateForm={setForm} exercise={exercise} exerciseCount={Object.keys(setCounters.current).length} removeExc={handleRemoveExercise} addSet={handleAddSet} removeSet={handleRemoveSet} activeSet={activeSet} activeExercise={activeExercise} updateActiveSet={updateActiveSet} updateActiveExercise={updateActiveExercise}></NewExercise>
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
                    <Button title='Reset Form' onPress={() => setForm({ name: '', privacy: 'private', exercises: [{ index: 0, dbId: 0, name: '', repRangeLower: 0, repRangeHigher: 0, isUnilateral: false, sets: [{ id: 0, type: 'working', isUnilateral: false }] }] })} />
                    <Button title='Submit' onPress={simSubmit} />
                </View>
            </ScrollView>
        </View>
    )
}