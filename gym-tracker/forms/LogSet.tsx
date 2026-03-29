import { LoggedWorkoutSet, LogWorkoutAction, WorkoutTemplateType, setTypes } from '@/types/workouts';
import { Dispatch } from 'react';
import { View, Text, TextInput, Pressable, Image } from 'react-native';
import layoutStyles from '../styles/layoutStyles.js';
import workoutStyles from '../styles/workouts.js';

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
        <View style={{paddingTop: 5, paddingBottom: 5}}>
        {
            props.activeWorkout ? (
                <View style={[layoutStyles.rowFlex, ]}>
                    <View>
                        <View style={[layoutStyles.rowFlex, ]}>
                            <View style={[layoutStyles.rowFlex, {flexGrow: 1}]}>
                                <Text>Set {props.setIndex + 1} Type</Text>
                                <View>
                                    <Pressable onPress={() => props.dispatch({ type: 'TOGGLE_SET_TYPE_DROPDOWN', exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })} >
                                        <Text>{props.setData.setType}</Text>
                                    </Pressable>
                                    {
                                        props.setData.showSetTypeDropdown &&
                                            <View>
                                            {
                                                setTypes.filter(s => s.value !== props.setData.setType).map(st => {
                                                    return (
                                                        <Pressable
                                                            key={st.value}
                                                            onPress={() => {
                                                                props.dispatch({ type: 'TOGGLE_SET_TYPE_DROPDOWN', exerciseIndex: props.exerciseIndex, setIndex: props.setIndex });
                                                                props.dispatch({ type: 'UPDATE_SET_TYPE', value: st.value, exerciseIndex: props.exerciseIndex, setIndex: props.setIndex });
                                                            }}
                                                        >
                                                            <Text>{st.label}</Text>
                                                        </Pressable>
                                                    )
                                                })
                                            }
                                            </View>
                                    }
                                </View>
                                <Text>Weight</Text>
                                <TextInput 
                                    placeholder='00'
                                    value={props.setData.weight.toString()}
                                    onFocus={() => props.dispatch({ type: 'SET_DROPDOWN_FALSE' })}
                                    onChangeText={(s: string) => {
                                        props.dispatch({ type: 'UPDATE_SET_WEIGHT', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })
                                    }}
                                ></TextInput>
                            </View>
                        </View>
                        <View style={[layoutStyles.rowFlex,]}>
                            {
                                props.setData.isUnilateral ? (
                                    <View style={{flexGrow: 1}}>
                                        <View style={[layoutStyles.rowFlex,]}>
                                            <Text>Left Reps</Text>
                                            <Text>Full:</Text>
                                            <TextInput 
                                                placeholder='00' 
                                                value={props.setData.reps.left.fullReps.toString()}
                                                onFocus={() => props.dispatch({ type: 'SET_DROPDOWN_FALSE' })}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_LEFT_FULL_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })
                                                }}
                                            />
                                            <Text>Partial:</Text>
                                            <TextInput 
                                                placeholder='00' 
                                                value={props.setData.reps.left.partialReps.toString()}
                                                onFocus={() => props.dispatch({ type: 'SET_DROPDOWN_FALSE' })}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_LEFT_PRTL_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })
                                                }}
                                            />
                                            <Text>Assisted:</Text>
                                            <TextInput 
                                                placeholder='00' 
                                                value={props.setData.reps.left.assistedReps.toString()}
                                                onFocus={() => props.dispatch({ type: 'SET_DROPDOWN_FALSE' })}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_LEFT_ASTD_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })
                                                }}
                                            />
                                        </View>
                                        <View style={[layoutStyles.rowFlex,]}>
                                            <Text>Right Reps</Text>
                                            <Text>Full:</Text>
                                            <TextInput 
                                                placeholder='00' 
                                                value={props.setData.reps.right.fullReps.toString()}
                                                onFocus={() => props.dispatch({ type: 'SET_DROPDOWN_FALSE' })}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_RIGHT_FULL_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })
                                                }}
                                            />
                                            <Text>Partial:</Text>
                                            <TextInput 
                                                placeholder='00' 
                                                value={props.setData.reps.right.partialReps.toString()}
                                                onFocus={() => props.dispatch({ type: 'SET_DROPDOWN_FALSE' })}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_RIGHT_PRTL_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })
                                                }}
                                            />
                                            <Text>Assisted:</Text>
                                            <TextInput 
                                                placeholder='00' 
                                                value={props.setData.reps.right.assistedReps.toString()}
                                                onFocus={() => props.dispatch({ type: 'SET_DROPDOWN_FALSE' })}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_RIGHT_ASTD_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })
                                                }}
                                            />
                                        </View>
                                    </View>
                                ) : (
                                    <View style={[layoutStyles.rowFlex,]}>
                                        <Text>Reps</Text>
                                        <Text>Full:</Text>
                                        <TextInput 
                                            placeholder='00' 
                                            value={props.setData.reps.fullReps.toString()}
                                            onFocus={() => props.dispatch({ type: 'SET_DROPDOWN_FALSE' })}
                                            onChangeText={(s: string) => {
                                                props.dispatch({ type: 'UPDATE_SET_FULL_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })
                                            }}
                                        />
                                        <Text>Partial:</Text>
                                        <TextInput 
                                            placeholder='00' 
                                            value={props.setData.reps.partialReps.toString()}
                                            onFocus={() => props.dispatch({ type: 'SET_DROPDOWN_FALSE' })}
                                            onChangeText={(s: string) => {
                                                props.dispatch({ type: 'UPDATE_SET_PRTL_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })
                                            }}
                                        />
                                        <Text>Assisted:</Text>
                                        <TextInput 
                                            placeholder='00' 
                                            value={props.setData.reps.assistedReps.toString()}
                                            onFocus={() => props.dispatch({ type: 'SET_DROPDOWN_FALSE' })}
                                            onChangeText={(s: string) => {
                                                props.dispatch({ type: 'UPDATE_SET_ASTD_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })
                                            }}
                                        />
                                    </View>
                                )
                            }
                        </View>
                        <Text>Set Notes:</Text>
                        <TextInput 
                            placeholder='Enter set notes here'
                            value={props.setData.setNotes}
                            onFocus={() => props.dispatch({ type: 'SET_DROPDOWN_FALSE' })}
                            onChangeText={(s: string) => {
                                props.dispatch({ type: 'UPDATE_SET_NOTES', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })
                            }}
                        />
                        <View style={[layoutStyles.rowFlex]}>
                            <Pressable onPress={() => props.dispatch({ type: 'ADD_SET', exerciseIndex: props.exerciseIndex, setIndexAddedAfter: props.setIndex })}>
                                <Text>Add Set</Text>
                            </Pressable>
                            <Pressable onPress={() => props.dispatch({ type: 'REMOVE_SET', exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })}>
                                <Text>Delete Set</Text>
                            </Pressable>
                        </View>
                    </View>
                    {
                        (props.exerciseTemplate.optionalSetModifiers.belt ||
                        props.exerciseTemplate.optionalSetModifiers.straps ||
                        props.exerciseTemplate.optionalSetModifiers.unilateral) && (
                            <View style={[layoutStyles.rowFlex,]}>
                                {props.exerciseTemplate.optionalSetModifiers.belt && (
                                    <Pressable
                                        onPress={() => {
                                            props.dispatch({ type: 'TOGGLE_SET_USE_BELT', exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })
                                            props.dispatch({ type: 'SET_DROPDOWN_FALSE' })
                                        }}
                                    >
                                    {
                                        props.setData.usedBelt ? 
                                        <Image 
                                            source={require('../assets/images/liftingBeltGreen.png')}
                                            borderRadius={2}
                                            style={[workoutStyles.setModifier, workoutStyles.trueSetModifier]}
                                        /> 
                                        :
                                        <Image 
                                            source={require('../assets/images/liftingBelt.png')}
                                            borderRadius={2}
                                            style={workoutStyles.setModifier}
                                        />
                                    }
                                    </Pressable>
                                )}
                                {props.exerciseTemplate.optionalSetModifiers.straps && (
                                    <Pressable
                                        onPress={() => {
                                            props.dispatch({ type: 'TOGGLE_SET_USE_STRAPS', exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })
                                            props.dispatch({ type: 'SET_DROPDOWN_FALSE' })
                                        }}
                                    >
                                    {
                                        props.setData.usedStraps ? 
                                        <Image 
                                            source={require('../assets/images/strapsGreen.png')}
                                            borderRadius={2}
                                            style={[workoutStyles.setModifier, workoutStyles.trueSetModifier]}
                                        /> 
                                        :
                                        <Image 
                                            source={require('../assets/images/straps.png')}
                                            borderRadius={2}
                                            style={workoutStyles.setModifier}
                                        />
                                    }
                                    </Pressable>
                                )}
                                {props.exerciseTemplate.optionalSetModifiers.unilateral && (
                                    <Pressable
                                        onPress={() => {
                                            props.dispatch({ type: 'TOGGLE_SET_UNILATERAL', exerciseIndex: props.exerciseIndex, setIndex: props.setIndex })
                                            props.dispatch({ type: 'SET_DROPDOWN_FALSE' })
                                        }}
                                    >
                                        {
                                            props.setData.isUnilateral ? 
                                            <Image 
                                                source={require('../assets/images/unilateralDarkGreenNoLetters.png')}
                                                borderRadius={2}
                                                style={[workoutStyles.setModifier, workoutStyles.trueSetModifier]}
                                            /> 
                                            :
                                            <Image 
                                                source={require('../assets/images/unilateralOff.png')}
                                                borderRadius={2}
                                                style={workoutStyles.setModifier}
                                            />
                                        }
                                    </Pressable>
                                )}
                            </View>
                        )
                    }
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