import formStyles from '@/styles/formStyles.js';
import { LoggedWorkoutSet, LogWorkoutAction, WorkoutTemplateType, setTypes, LoggedSetError } from '@/types/workouts';
import { Dispatch } from 'react';
import { View, Text, TextInput, Pressable, Image } from 'react-native';
import layoutStyles from '../styles/layoutStyles.js';
import workoutStyles from '../styles/workouts.js';

interface Props {
    dispatch: Dispatch<LogWorkoutAction>,
    setData: LoggedWorkoutSet,
    updateActiveSet: (exerciseId: string, setId: string, setType: string) => void,
    exerciseIndex: number,
    exerciseId: string,
    unilateralExercise: boolean,
    optionalSetModifiers: {
        unilateral: boolean,
        belt: boolean,
        straps: boolean,
    },
    setErrors: LoggedSetError,
}

export default function LogSet (props: Props) {
    const focusOnNewField = () => {
        props.dispatch({ type: 'SET_DROPDOWN_FALSE'});
        props.updateActiveSet(props.exerciseId, props.setData.setId, props.setData.setType);
    };
    return (
        <View style={{padding: 5, borderBottomWidth: 1, borderBottomColor: '#619888', borderRadius: '5%'}}>
            <View style={[layoutStyles.rowFlex]}>
                <View style={{flexGrow: 1}}>
                    <Text style={[formStyles.boldText]}>Set {props.setData.setIndex + 1}</Text>
                    <View style={[layoutStyles.rowFlex, formStyles.formRow]}>
                        <View style={[formStyles.inputLabelPair]}>
                            <Text style={{marginTop: 3, alignSelf: 'flex-start'}}>Type: </Text>
                            <View>
                                <Pressable 
                                    onPress={() => {
                                        props.dispatch({ type: 'TOGGLE_SET_TYPE_DROPDOWN', exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex }) 
                                    }} 
                                >
                                    <Text style={[formStyles.input]}>{props.setData.setType}</Text>
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
                                                            props.dispatch({ type: 'TOGGLE_SET_TYPE_DROPDOWN', exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex });
                                                            props.dispatch({ type: 'UPDATE_SET_TYPE', value: st.value, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex });
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
                        </View>
                        <View style={[formStyles.inputLabelPair]}>
                            <Text style={{marginTop: 3, alignSelf: 'flex-start'}}>Weight: </Text>
                            <TextInput
                                style={[formStyles.input, {alignSelf: 'flex-start'}]}
                                keyboardType='decimal-pad'
                                returnKeyType='done'
                                placeholder='00'
                                value={props.setData.weight.toString()}
                                onFocus={focusOnNewField}
                                onChangeText={(s: string) => {
                                    props.dispatch({ type: 'UPDATE_SET_WEIGHT', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                }}
                                onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_SET_WEIGHT', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                            />
                            <Text style={{marginTop: 3, alignSelf: 'flex-start'}}> KGs</Text>
                        </View>
                    </View>
                    { props.setErrors.weight && <Text style={[workoutStyles.errorText]}>{props.setErrors.weight}</Text> }
                    <View style={[layoutStyles.rowFlex]}>
                        {
                            props.setData.isUnilateral ? (
                                <View>
                                    <Text style={[formStyles.boldText]}>Left Reps</Text>
                                    <View style={[layoutStyles.rowFlex, formStyles.formRow]}>
                                        <View style={[formStyles.inputLabelPair]}>
                                            <Text>Full: </Text>
                                            <TextInput 
                                                placeholder='0' 
                                                style={[formStyles.input]}
                                                keyboardType='number-pad'
                                                returnKeyType='done'
                                                value={props.setData.reps.left.fullReps.toString()}
                                                onFocus={focusOnNewField}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_LEFT_FULL_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                                }}
                                                onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_LEFT_FULL_REPS', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                                            />
                                        </View>
                                        <View style={[formStyles.inputLabelPair]}>
                                            <Text>Partial: </Text>
                                            <TextInput 
                                                placeholder='0' 
                                                style={[formStyles.input]}
                                                keyboardType='number-pad'
                                                returnKeyType='done'
                                                value={props.setData.reps.left.partialReps.toString()}
                                                onFocus={focusOnNewField}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_LEFT_PRTL_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                                }}
                                                onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_LEFT_PRTL_REPS', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                                            />
                                        </View>
                                        <View style={[formStyles.inputLabelPair]}>
                                            <Text>Assisted: </Text>
                                            <TextInput 
                                                placeholder='0' 
                                                style={[formStyles.input]}
                                                keyboardType='number-pad'
                                                returnKeyType='done'
                                                value={props.setData.reps.left.assistedReps.toString()}
                                                onFocus={focusOnNewField}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_LEFT_ASTD_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                                }}
                                                onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_LEFT_ASTD_REPS', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                                            />
                                        </View>
                                    </View>
                                    
                                    {/* Effort Measures */}
                                    <View style={[layoutStyles.rowFlex, formStyles.formRow]}>
                                        <View style={[formStyles.inputLabelPair]}>
                                            <Text>RPE: </Text>
                                            <TextInput 
                                                placeholder='0'
                                                style={[formStyles.input]}
                                                keyboardType='number-pad'
                                                returnKeyType='done'
                                                value={props.setData.reps.left.rpe.toString()}
                                                onFocus={focusOnNewField}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_LEFT_RPE', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                                }}
                                                onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_LEFT_RPE', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                                            />
                                        </View>
                                        <View style={[formStyles.inputLabelPair]}> 
                                            <Text>RiR: </Text>
                                            <TextInput 
                                                placeholder='0'
                                                style={[formStyles.input]}
                                                keyboardType='number-pad'
                                                returnKeyType='done'
                                                value={props.setData.reps.left.rir.toString()}
                                                onFocus={focusOnNewField}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_LEFT_RIR', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                                }}
                                                onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_LEFT_RIR', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                                            />
                                        </View>
                                    </View>
                                    
                                    { (props.setErrors.unilateralSet && props.setErrors.left.fullReps) && <Text style={[workoutStyles.errorText]}>{props.setErrors.left.fullReps}</Text>}
                                    { (props.setErrors.unilateralSet && props.setErrors.left.partialReps) && <Text style={[workoutStyles.errorText]}>{props.setErrors.left.partialReps}</Text>}
                                    { (props.setErrors.unilateralSet && props.setErrors.left.assistedReps) && <Text style={[workoutStyles.errorText]}>{props.setErrors.left.assistedReps}</Text>}
                                    { (props.setErrors.unilateralSet && props.setErrors.left.rpe) && <Text style={[workoutStyles.errorText]}>{props.setErrors.left.rpe}</Text>}
                                    { (props.setErrors.unilateralSet && props.setErrors.left.rir) && <Text style={[workoutStyles.errorText]}>{props.setErrors.left.rir}</Text>}
                                    
                                    <Text style={[formStyles.boldText]}>Right Reps</Text>
                                    <View style={[layoutStyles.rowFlex, formStyles.formRow]}>
                                        <View style={[formStyles.inputLabelPair]}>
                                            <Text>Full: </Text>
                                            <TextInput 
                                                placeholder='0' 
                                                style={[formStyles.input]}
                                                keyboardType='number-pad'
                                                returnKeyType='done'
                                                value={props.setData.reps.right.fullReps.toString()}
                                                onFocus={focusOnNewField}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_RIGHT_FULL_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                                }}
                                                onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_RIGHT_FULL_REPS', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                                            />
                                        </View>
                                        <View style={[formStyles.inputLabelPair]}>
                                            <Text>Partial: </Text>
                                            <TextInput 
                                                placeholder='0' 
                                                style={[formStyles.input]}
                                                keyboardType='number-pad'
                                                returnKeyType='done'
                                                value={props.setData.reps.right.partialReps.toString()}
                                                onFocus={focusOnNewField}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_RIGHT_PRTL_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                                }}
                                                onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_RIGHT_PRTL_REPS', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                                            />
                                        </View>
                                        <View style={[formStyles.inputLabelPair]}>
                                            <Text>Assisted: </Text>
                                            <TextInput 
                                                placeholder='0' 
                                                style={[formStyles.input]}
                                                keyboardType='number-pad'
                                                returnKeyType='done'
                                                value={props.setData.reps.right.assistedReps.toString()}
                                                onFocus={focusOnNewField}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_RIGHT_ASTD_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                                }}
                                                onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_RIGHT_ASTD_REPS', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                                            />
                                        </View>
                                    </View>
                                            
                                    {/* Effort Measures */}
                                    <View style={[layoutStyles.rowFlex, formStyles.formRow]}>
                                        <View style={[formStyles.inputLabelPair]}>
                                            <Text>RPE: </Text>
                                            <TextInput 
                                                placeholder='0'
                                                style={[formStyles.input]}
                                                keyboardType='number-pad'
                                                returnKeyType='done'
                                                value={props.setData.reps.right.rpe.toString()}
                                                onFocus={focusOnNewField}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_RIGHT_RPE', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                                }}
                                                onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_RIGHT_RPE', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                                            />
                                        </View>
                                        <View style={[formStyles.inputLabelPair]}>
                                            <Text>RiR: </Text>
                                            <TextInput 
                                                placeholder='0'
                                                style={[formStyles.input]}
                                                keyboardType='number-pad'
                                                returnKeyType='done'
                                                value={props.setData.reps.right.rir.toString()}
                                                onFocus={focusOnNewField}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_RIGHT_RIR', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                                }}
                                                onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_RIGHT_RIR', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                                            />
                                        </View>
                                    </View>

                                    {/* unilateral set right side error messages */}
                                    { (props.setErrors.unilateralSet && props.setErrors.right.fullReps) && <Text style={[workoutStyles.errorText]}>{props.setErrors.right.fullReps}</Text>}
                                    { (props.setErrors.unilateralSet && props.setErrors.right.partialReps) && <Text style={[workoutStyles.errorText]}>{props.setErrors.right.partialReps}</Text>}
                                    { (props.setErrors.unilateralSet && props.setErrors.right.assistedReps) && <Text style={[workoutStyles.errorText]}>{props.setErrors.right.assistedReps}</Text>}
                                    { (props.setErrors.unilateralSet && props.setErrors.right.rpe) && <Text style={[workoutStyles.errorText]}>{props.setErrors.right.rpe}</Text>}
                                    { (props.setErrors.unilateralSet && props.setErrors.right.rir) && <Text style={[workoutStyles.errorText]}>{props.setErrors.right.rir}</Text>}

                                </View>
                            ) : (
                            <View>
                                {/* Reps */}
                                <View>
                                    <Text style={[formStyles.boldText]}>Reps</Text>
                                    <View style={[layoutStyles.rowFlex, formStyles.formRow]}>
                                        <View style={[formStyles.inputLabelPair]}>
                                            <Text>Full: </Text>
                                            <TextInput 
                                                placeholder='0' 
                                                style={[formStyles.input]}
                                                keyboardType='number-pad'
                                                returnKeyType='done'
                                                value={props.setData.reps.fullReps.toString()}
                                                onFocus={focusOnNewField}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_FULL_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                                }}
                                                onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_FULL_REPS', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                                            />
                                        </View>
                                        <View style={[formStyles.inputLabelPair]}>
                                            <Text>Partial: </Text>
                                            <TextInput 
                                                placeholder='0' 
                                                style={[formStyles.input]}
                                                keyboardType='number-pad'
                                                returnKeyType='done'
                                                value={props.setData.reps.partialReps.toString()}
                                                onFocus={focusOnNewField}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_PRTL_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                                }}
                                                onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_PRTL_REPS', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                                            />
                                        </View>
                                        <View style={[formStyles.inputLabelPair]}>
                                            <Text>Assisted: </Text>
                                            <TextInput 
                                                placeholder='0' 
                                                style={[formStyles.input]}
                                                keyboardType='number-pad'
                                                returnKeyType='done'
                                                value={props.setData.reps.assistedReps.toString()}
                                                onFocus={focusOnNewField}
                                                onChangeText={(s: string) => {
                                                    props.dispatch({ type: 'UPDATE_SET_ASTD_REPS', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                                }}
                                                onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_ASTD_REPS', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                                            />
                                        </View>
                                    </View>
                                    
                                </View>
                                {/* Effort Measures */}
                                <View style={[layoutStyles.rowFlex, formStyles.formRow]}>
                                    <View style={[formStyles.inputLabelPair]}>
                                        <Text>RPE: </Text>
                                        <TextInput
                                            keyboardType='number-pad'
                                            returnKeyType='done'
                                            style={[formStyles.input]}
                                            placeholder='0'
                                            value={props.setData.reps.rpe.toString()}
                                            onFocus={focusOnNewField}
                                            onChangeText={(s: string) => {
                                                props.dispatch({ type: 'UPDATE_SET_RPE', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                            }}
                                            onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_RPE', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                                        />
                                    </View>
                                    <View style={[formStyles.inputLabelPair]}>
                                        <Text>RiR: </Text>
                                        <TextInput 
                                            placeholder='0'
                                            style={[formStyles.input]}
                                            keyboardType='number-pad'
                                            returnKeyType='done'
                                            value={props.setData.reps.rir.toString()}
                                            onFocus={focusOnNewField}
                                            onChangeText={(s: string) => {
                                                props.dispatch({ type: 'UPDATE_SET_RIR', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                            }}
                                            onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_RIR', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                                        />
                                    </View>
                                </View>
                                { (!props.setErrors.unilateralSet && props.setErrors.fullReps) && <Text style={[workoutStyles.errorText]}>{props.setErrors.fullReps}</Text> }
                                { (!props.setErrors.unilateralSet && props.setErrors.partialReps) && <Text style={[workoutStyles.errorText]}>{props.setErrors.partialReps}</Text> }
                                { (!props.setErrors.unilateralSet && props.setErrors.assistedReps) && <Text style={[workoutStyles.errorText]}>{props.setErrors.assistedReps}</Text> }
                                { (!props.setErrors.unilateralSet && props.setErrors.rpe) && <Text style={[workoutStyles.errorText]}>{props.setErrors.rpe}</Text>}
                                { (!props.setErrors.unilateralSet && props.setErrors.rir) && <Text style={[workoutStyles.errorText]}>{props.setErrors.rir}</Text>}
                            </View>
                            )
                        }
                    </View>
                    <Text style={[formStyles.boldText]}>Notes</Text>
                    <View>
                        <TextInput 
                            placeholder='Enter set notes here'
                            style={[formStyles.input, formStyles.inputLarge, formStyles.formRow]}
                            value={props.setData.setNotes}
                            onFocus={focusOnNewField}
                            onChangeText={(s: string) => {
                                props.dispatch({ type: 'UPDATE_SET_NOTES', value: s, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                            }}
                            onEndEditing={(event) => props.dispatch({ type: 'VALIDATE_SET_NOTES', value: event.nativeEvent.text, exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}
                        />
                    </View>
                    { props.setErrors.setNotes && <Text style={[workoutStyles.errorText]}>{props.setErrors.setNotes}</Text> }
                </View>
                {
                    //Set interactions: add, delete, toggle set modifiers
                    <View style={[formStyles.setInteractionsContainer]}>
                        <View>
                            <Pressable style={[formStyles.setInteractionButton]} onPress={() => props.dispatch({ type: 'REMOVE_SET', exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })}>
                                <Text style={{textAlign: 'center'}}>X</Text>
                            </Pressable>
                        </View>
                        {(props.optionalSetModifiers.belt ||
                        props.optionalSetModifiers.straps ||
                        props.optionalSetModifiers.unilateral) && (
                            <View style={{marginVertical: 5}}>
                                {props.optionalSetModifiers.belt && (
                                    <Pressable
                                        onPress={() => {
                                            props.dispatch({ type: 'TOGGLE_SET_USE_BELT', exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex });
                                            focusOnNewField();
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
                                {props.optionalSetModifiers.straps && (
                                    <Pressable
                                        onPress={() => {
                                            props.dispatch({ type: 'TOGGLE_SET_USE_STRAPS', exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                            focusOnNewField();
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
                                {props.optionalSetModifiers.unilateral && !props.unilateralExercise && (
                                    <Pressable
                                        onPress={() => {
                                            props.dispatch({ type: 'TOGGLE_SET_UNILATERAL', exerciseIndex: props.exerciseIndex, setIndex: props.setData.setIndex })
                                            focusOnNewField();
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
                        )}

                        <Pressable style={[formStyles.setInteractionButton]} onPress={() => props.dispatch({ type: 'ADD_SET', exerciseIndex: props.exerciseIndex, setIndexAddedAfter: props.setData.setIndex })}>
                            <Text style={{textAlign: 'center'}}>+</Text>
                        </Pressable>
                    </View>
                }
            </View>
        </View>
    )
}