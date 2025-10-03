import { useState } from 'react';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import { FormValues, SetTracker, SetType, setTypes, WorkoutSet } from '../types/workouts.ts';

interface Props {
    set: WorkoutSet,
    setCount: number,
    exerciseId: number,
    removeSet: (exerciseId: number, setId: number) => void,
    activeSet: SetTracker,
    updateActiveSet: (exerciseId: number, setId: number) => void
    form: FormValues
    updateForm: (form: FormValues) => void
}

export default function NewSet(props: Props) {
    const setType = props.form.exercises[props.exerciseId].sets[props.set.id].type;
    const [showDropdown, setShowDropdown] = useState<Boolean>(false);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
        props.updateActiveSet(props.exerciseId, props.set.id);
        console.log(props.exerciseId, props.set.id, props.activeSet);
    }

    const handleSetSelect = (value: SetType) => {
        setShowDropdown(false)
        props.updateForm({ ...props.form, exercises: props.form.exercises.map((exc: { id: number; sets: { id: number; }[]; }) => {
                if (exc.id === props.exerciseId) {
                    return { ...exc, sets: exc.sets.map((s: { id: number; }) => {
                        if (s.id === props.set.id) {
                            return {...s, type: value}
                        }
                        return s;
                    })}
                }
                return exc;
            })
        })
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