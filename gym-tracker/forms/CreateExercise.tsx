import { Text, TextInput, View, Pressable } from 'react-native';
import { Dispatch, SetStateAction, useState } from 'react';
import { RadioButton } from 'react-native-paper';
import { Checkbox } from 'expo-checkbox';
import { muscleGroups, MuscleGroups, Exercise, Muscle } from '../types/workouts.ts';
import { FormValues } from '@/types/workouts';
import MuscleSelector from '@/components/MuscleSelector';

interface Props {
    closeModal:  () => void,
    exercise: Exercise,
    form: FormValues,
    updateForm: Dispatch<SetStateAction<FormValues>>,
}

export default function CreateExercise(props: Props) {
    const [radioGroup, setRadioGroup] = useState<string>('arms');

    const armMuscles: Muscle[] = [
        { name: 'biceps', id: '41c6578d-a82a-48f2-a815-d7a1953510b2' },
        { name: 'forearms', id: '424a80f8-b242-40fc-aa4a-6c7d5bbd58d4' },
        { name: 'front delts', id: 'a3ec63e4-873d-415a-aabd-3aff82e9f1ec' },
        { name: 'rear delts', id: '337b897c-86a5-46ab-bc81-d60b02db4208' },
        { name: 'side delts', id: '300b0764-908f-441c-9fee-1290235f3ff2' },
        { name: 'triceps', id: 'a15cf503-5b40-4af7-a85b-012f4499c508' },
    ];

    const backMuscles: Muscle[] = [
        { name: 'lats', id: '96eb34d5-3f55-405d-af87-484fa9e073c2' },
        { name: 'traps', id: '7ddd633f-4d00-4b98-ae00-07758a1008c4' },
        { name: 'upper back', id: '9839045d-9951-4d56-8f3f-dd66f5ea59d2' },
    ];

    const chestMuscles: Muscle[] = [
        { name: 'lower chest', id: 'aa121862-3208-4bf4-ac39-0280214dd588' },
        { name: 'mid chest', id: 'c297f47c-2bb2-4f1f-a87a-362e77e0be0e' },
        { name: 'upper chest', id: '2c510399-1a00-443c-bc31-629243aa35b1' },
    ];

    const legMuscles: Muscle[] = [
        { name: 'calves', id: 'acc17cbd-3e52-41b5-a4ff-64fa793b225e' },
        { name: 'glutes', id: 'ea2bdec9-b024-463c-a403-06bfed1714b1' },
        { name: 'hamstrings', id: 'd7766afa-0a74-4ca7-84f7-e84320a64095' },
        { name: 'quadriceps', id: '20489486-fa54-4876-b376-d14852331b73' },
    ];

    const otherMuscles: Muscle[] = [
        { name: 'anterior chain', id: '0d3f36a6-3241-412e-a5e1-013501ea6110' },
        { name: 'cardio', id: 'f85e1ffa-9c89-42cd-8d97-e8bbeb3d2119' },
        { name: 'core', id: 'd70367d7-d03f-4ae9-ab9e-987adb6fa6d3' },
        { name: 'posterior chain', id: '87cfeaeb-6fa6-492b-9894-e2dd7163485d' },
        { name: 'other', id: '7a269dda-ea56-4e86-b1fa-b3d5ce91cdfc' },
    ]

    const renderMuscleSelection = () => {
        switch (radioGroup) {
            case 'arms' : return <MuscleSelector muscleList={armMuscles} exercise={props.exercise} form={props.form} updateForm={props.updateForm} />
            case 'back' : return <MuscleSelector muscleList={backMuscles} exercise={props.exercise} form={props.form} updateForm={props.updateForm} />
            case 'chest' : return <MuscleSelector muscleList={chestMuscles} exercise={props.exercise} form={props.form} updateForm={props.updateForm} />
            case 'legs' : return <MuscleSelector muscleList={legMuscles} exercise={props.exercise} form={props.form} updateForm={props.updateForm} />
            case 'other' : return <MuscleSelector muscleList={otherMuscles} exercise={props.exercise} form={props.form} updateForm={props.updateForm} />
        }
    }

    const updateTargetMuscle = (muscleArray: Muscle[]) => {
        props.updateForm(prev => ({
            ...prev,
            exercises: prev.exercises.map(exc => {
                if (exc.index === props.exercise.index) return {...exc, targetMuscle: muscleArray[0].id}
                return exc
            })
        }))
    }

    return (
        <View styles={{maxHeight: '80%', marginTop: '10%'}}>
            <Text>Create New Exercise</Text>
            <View>
                <Text>Exercise Name:</Text>
                <TextInput 
                    placeholder='Enter Exercise Name'
                    onChangeText={ (text: string) => {
                        props.updateForm(prev => ({...prev, exercises: prev.exercises.map(exc => {
                            if (exc.index === props.exercise.index) return {...exc, name: text}
                            return exc
                        }) }))
                    }}
                />
            </View>
            {/* Select muscle group, show subset of specific muscles from each group */}
            <View>
                <Text>Muscle Group:</Text>
                <RadioButton.Group 
                    value={radioGroup}
                    onValueChange={(value: string) => {
                        setRadioGroup(value)
                        switch (value) {
                            case 'arms' : updateTargetMuscle(armMuscles); break;
                            case 'back' : updateTargetMuscle(backMuscles); break;
                            case 'chest' : updateTargetMuscle(chestMuscles); break;
                            case 'legs' : updateTargetMuscle(legMuscles); break;
                            case 'other' : updateTargetMuscle(otherMuscles); break;
                        }
                    }}
                >
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                        {
                            muscleGroups.map((mGroup: MuscleGroups) => {
                                return (
                                    <View key={mGroup.value}>
                                        <Text>{mGroup.label}</Text>
                                        <RadioButton value={mGroup.value} />
                                    </View>
                                )
                            })
                        }
                    </View>
                </RadioButton.Group>
            </View>
            
            {/* Select specific muscle from group */}
            <View>
                <Text>Muscle:</Text>
                {renderMuscleSelection()}
            </View>

            {/* If exercise is marked unilateral, force all sets to unilateral */}
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <Checkbox 
                    value={props.exercise.isUnilateral}
                    onValueChange={(value: boolean) => {
                        props.updateForm(prev => ({...prev, exercises: prev.exercises.map(exc => {
                            if (exc.index === props.exercise.index) return {...exc, isUnilateral: value}
                            return exc
                        }) }))
                    }}
                />
                <Text>Unilateral Exercise</Text>
            </View>

            {/* Action buttons */}
            <View style={{display: 'flex', flexDirection: 'row'}}>
                {/* If cancelled, reset any exercise fields that were changed on the create exercise modal */}
                <Pressable onPress={() => {
                        props.updateForm(prev => ({...prev, exercises: prev.exercises.map(exc => {
                            if (exc.index === props.exercise.index) return {...exc, isUnilateral: false, targetMuscle: '', name: ''}
                            return exc
                        })}))
                        props.closeModal()
                    }
                }>
                    <Text>Cancel</Text>
                </Pressable>
                <Pressable onPress={() => props.closeModal()}>
                    <Text>Add Exercise</Text>
                </Pressable>
            </View>
        </View>
    )
}