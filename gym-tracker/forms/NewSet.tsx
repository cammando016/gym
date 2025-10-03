import { useState } from 'react';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import { SetTracker, SetType, setTypes, WorkoutSet } from '../types/workouts.ts';

interface Props {
    set: WorkoutSet,
    setCount: number,
    exerciseId: number,
    removeSet: (exerciseId: number, setId: number) => void,
    activeSet: SetTracker,
    updateActiveSet: (exerciseId: number, setId: number) => void
}

export default function NewSet(props: Props) {
    const [setType, setSetType] = useState<SetType>('working');
    const [showDropdown, setShowDropdown] = useState<Boolean>(false);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
        props.updateActiveSet(props.exerciseId, props.set.id);
        console.log(props.exerciseId, props.set.id, props.activeSet);
    }

    const handleSetSelect = (value: string) => {
        setSetType(value);
        setShowDropdown(false);
    }

    return (
        <View>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text>Set: {props.set.id}</Text>
                <Pressable style={{borderColor: 'black', borderWidth: 1, padding: '3px'}} onPress={() => toggleDropdown()}>
                    <View style={{flexDirection: 'row'}}>
                        <Text>{(setType || 'Select Set Type')}</Text>
                    </View>
                </Pressable>
                {
                    props.setCount > 1 && <Button title='Remove Set' onPress={() => props.removeSet(props.exerciseId, props.set.id)} />
                }
            </View>

            {(showDropdown && props.activeSet.exercise === props.exerciseId && props.activeSet.set === props.set.id) && 
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {
                            setTypes.map((set: { value: string; label: string; }) => {
                                return (
                                    <Pressable
                                        key={set.value}
                                        onPress={() => handleSetSelect(set.value)}
                                    >
                                        <Text>{set.label}</Text>
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