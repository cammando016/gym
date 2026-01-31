import { Dispatch, useState } from 'react';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import { SetTracker, SetType, setTypes, WorkoutSet, WorkoutAction } from '../types/workouts.ts';
import { Checkbox } from 'expo-checkbox';
import { Exercise } from '@/types/workouts';

interface Props {
    set: WorkoutSet,
    setCount: number,
    exerciseId: number,
    exercise: Exercise
    removeSet: (exerciseId: number, setId: number) => void,
    activeSet: SetTracker,
    updateActiveSet: (exerciseId: number, setId: number) => void,
    updateForm: Dispatch<WorkoutAction>,
    unilateralExercise: boolean,
}

export default function NewSet(props: Props) {
    console.log(props.unilateralExercise)
    const setType = props.set.type;
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
        props.updateActiveSet(props.exerciseId, props.set.id);
    }

    const handleSetSelect = (sType: SetType) => {
        setShowDropdown(false)
        props.updateForm({ type: 'SET_SET_TYPE', exerciseIndex: props.exercise.index, setIndex: props.set.id, value: sType })
    }

    return (
        <View>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text>Set: {props.set.id}</Text>
                <Pressable style={{borderColor: 'black', borderWidth: 1, padding: '3px'}} onPress={() => toggleDropdown()}>
                    <View style={{flexDirection: 'row'}}>
                        <Text>{setType}</Text>
                    </View>
                </Pressable>

                <Checkbox 
                    value={ props.unilateralExercise ? true : props.set.isUnilateral } 
                    disabled={props.unilateralExercise} 
                    onValueChange={(b: boolean) => props.updateForm({ type: 'SET_UNILATERAL_SET', exerciseIndex: props.exercise.index, setIndex: props.set.id, value: b })}
                />
                <Text>Unilateral Set</Text>
                {
                    props.setCount > 1 && <Button title='Remove Set' onPress={() => props.removeSet(props.exerciseId, props.set.id)} />
                }
            </View>

            {(showDropdown && props.activeSet.exercise === props.exerciseId && props.activeSet.set === props.set.id) && 
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {
                            setTypes.map((s: { value: string; label: string; }) => {
                                return (
                                    <Pressable
                                        key={s.value}
                                        onPress={() => handleSetSelect(s.value)}
                                    >
                                        <Text>{s.label}</Text>
                                    </Pressable>
                                )
                            })
                        }
                    </View>
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'rgba(255, 255, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'rgb(0, 255, 255)',
        paddingBottom: 20,
    },
})