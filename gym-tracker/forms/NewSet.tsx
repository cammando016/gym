import { Dispatch, useState } from 'react';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import { Checkbox } from 'expo-checkbox';
import { Exercise, SetTracker, SetType, setTypes, WorkoutSet, WorkoutAction } from '@/types/workouts';

interface Props {
    set: WorkoutSet,
    exercise: Exercise,
    activeSet: SetTracker,
    updateActiveSet: (exerciseId: number, setId: number) => void,
    updateForm: Dispatch<WorkoutAction>,
}

export default function NewSet(props: Props) {
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
        props.updateActiveSet(props.exercise.index, props.set.id);
    }

    const handleSetSelect = (sType: SetType) => {
        setShowDropdown(false)
        props.updateForm({ type: 'SET_SET_TYPE', exerciseIndex: props.exercise.index, setIndex: props.set.id, value: sType })
    }

    return (
        <View>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text>Set {props.exercise.sets.indexOf(props.set) + 1}:</Text>
                <Pressable style={{borderColor: 'black', borderWidth: 1, padding: 3}} onPress={() => toggleDropdown()}>
                    <View style={{flexDirection: 'row'}}>
                        <Text>{props.set.type}</Text>
                    </View>
                </Pressable>

                <Checkbox 
                    value={ props.exercise.isUnilateral ? true : props.set.isUnilateral } 
                    disabled={props.exercise.isUnilateral} 
                    onValueChange={(b: boolean) => props.updateForm({ type: 'SET_UNILATERAL_SET', exerciseIndex: props.exercise.index, setIndex: props.set.id, value: b })}
                />
                <Text>Unilateral Set</Text>
                {
                    props.exercise.sets.length > 1 && <Button title='Remove Set' onPress={() => props.updateForm({ type: 'REMOVE_SET', exerciseIndex: props.exercise.index, setIndex: props.set.id }) }/>
                }
            </View>

            {(showDropdown && props.activeSet.exercise === props.exercise.index && props.activeSet.set === props.set.id) && 
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {
                            setTypes.map((s) => {
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