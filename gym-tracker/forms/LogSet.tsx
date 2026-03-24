import { LoggedWorkoutSet, LogWorkoutAction, WorkoutTemplateType } from '@/types/workouts';
import { Dispatch } from 'react';
import { View, Text, TextInput } from 'react-native';
import layoutStyles from '../styles/layoutStyles.js';

interface Props {
    dispatch: Dispatch<LogWorkoutAction>,
    activeWorkout: boolean,
    setData: LoggedWorkoutSet,
    setTemplate: WorkoutTemplateType["exercises"][0]["sets"][0],
    setIndex: number,
    exerciseIndex: number,
    exerciseTemplate: WorkoutTemplateType["exercises"][0],
    optionalSetModifiers: {
        unilateral: boolean,
        belt: boolean,
        straps: boolean,
    },
}

export default function LogSet (props: Props) {
    return (
        <View>
        {
            props.activeWorkout ? (
                <View>
                    <Text>Set {props.setIndex + 1}</Text>
                    <View>
                        <View style={[layoutStyles.rowFlex, ]}>
                            <View style={[layoutStyles.rowFlex, {flexGrow: 1}]}>
                                <Text>Set Type</Text>
                                <TextInput placeholder='Select Set Type' value={props.setData.setType}></TextInput>
                                <Text>Weight</Text>
                                <TextInput 
                                    placeholder='00'
                                    value={props.setData.weight.toString()}
                                    onChangeText={(s: string) => {
                                        props.dispatch({ type: 'UPDATE_SET_WEIGHT', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })
                                    }}
                                ></TextInput>
                            </View>
                            {
                                (props.exerciseTemplate.optionalSetModifiers.belt ||
                                props.exerciseTemplate.optionalSetModifiers.straps ||
                                props.exerciseTemplate.optionalSetModifiers.unilateral) && (
                                    <View style={[layoutStyles.rowFlex,]}>
                                        {props.exerciseTemplate.optionalSetModifiers.belt && <Text>BE</Text>}
                                        {props.exerciseTemplate.optionalSetModifiers.straps && <Text>ST</Text>}
                                        {props.exerciseTemplate.optionalSetModifiers.unilateral && <Text>UL</Text>}
                                    </View>
                                )
                            }
                        </View>
                        <View style={[layoutStyles.rowFlex,]}>
                            {
                                props.setData.isUnilateral ? (
                                    <View style={{flexGrow: 1}}>
                                        <View style={[layoutStyles.rowFlex,]}>
                                            <Text>Left Reps</Text>
                                            <Text>Full:</Text>
                                            <TextInput placeholder='00' />
                                            <Text>Partial:</Text>
                                            <TextInput placeholder='00' />
                                            <Text>Assisted:</Text>
                                            <TextInput placeholder='00' />
                                        </View>
                                        <View style={[layoutStyles.rowFlex,]}>
                                            <Text>Right Reps</Text>
                                            <Text>Full:</Text>
                                            <TextInput placeholder='00' />
                                            <Text>Partial:</Text>
                                            <TextInput placeholder='00' />
                                            <Text>Assisted:</Text>
                                            <TextInput placeholder='00' />
                                        </View>
                                    </View>
                                ) : (
                                    <View style={[layoutStyles.rowFlex,]}>
                                        <Text>Reps</Text>
                                        <Text>Full:</Text>
                                        <TextInput 
                                            placeholder='00' 
                                            value={props.setData.reps.fullReps.toString()}
                                            onChangeText={(s: string) => {
                                                props.dispatch({ type: 'UPDATE_SET_FULL_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })
                                            }}
                                        />
                                        <Text>Partial:</Text>
                                        <TextInput placeholder='00' />
                                        <Text>Assisted:</Text>
                                        <TextInput placeholder='00' />
                                    </View>
                                )
                            }
                            <Text>Note</Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View>
                    {/* <Text>{`Set ${props.set.setIndex + 1}`}</Text>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                        <View>
                            <Text>{`Set Type: ${props.set.setType} Weight: ${props.set.weight}`}</Text>
                            {
                                !props.set.isUnilateral ? (
                                    <Text>{`Reps: Full: ${props.set.reps.fullReps} Partial: ${props.set.reps.partialReps} Assisted: ${props.set.reps.assistedReps}`}</Text>
                                ) : (
                                    <View>
                                        <Text>{`Left Reps: Full: ${props.set.reps.left.fullReps} Partial: ${props.set.reps.left.partialReps} Assisted: ${props.set.reps.left.assistedReps}`}</Text>
                                        <Text>{`Right Reps: Full: ${props.set.reps.right.fullReps} Partial: ${props.set.reps.right.partialReps} Assisted: ${props.set.reps.right.assistedReps}`}</Text>
                                    </View>
                                )
                            }
                            <Text>{`Set Notes: ${props.set.setNotes}`}</Text>
                        </View>
                        <View>
                            {props.optionalSetModifiers.unilateral && <Text style={{color: props.set.isUnilateral ? 'green' : 'red'}}>UL</Text>}
                            {props.optionalSetModifiers.straps && <Text style={{color: props.set.usedStraps ? 'green' : 'red'}}>ST</Text>}
                            {props.optionalSetModifiers.belt && <Text style={{color: props.set.usedBelt ? 'green' : 'red'}}>BE</Text>}
                        </View>
                    </View> */}
                </View>
            )
        }
        </View>
    )
}