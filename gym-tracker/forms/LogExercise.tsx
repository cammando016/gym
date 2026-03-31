import { ExerciseSearchResultType, LoggedWorkoutExercise, LogWorkoutAction, WorkoutTemplateType } from '@/types/workouts';
import { View, Text, TextInput, Pressable, Modal } from 'react-native';
import workoutStyles from '@/styles/workouts';
import { Dispatch, useEffect, useState } from 'react';
import LogSet from './LogSet';
import layoutStyles from '@/styles/layoutStyles';
import useDebounce from '@/utils/search';
import { dbExerciseSearch } from '@/utils/workouts';
import ExerciseSearchResult from '@/components/ExerciseSearchResult';
import LastTrainedSet from '@/components/LastTrainedSet';

interface Props {
    dispatch: Dispatch<LogWorkoutAction>,
    exerciseData: LoggedWorkoutExercise,
    activeWorkout: boolean,
    exerciseCount: number,
    lastTrainedExercise?: LoggedWorkoutExercise,
}

export default function LogExercise ( props: Props ) {
    //Toggle showing full set list for each exercise
    const [showSets, setShowSets] = useState<boolean>(true);
    //Show modal for adding a new exercise into workout
    const [showAddExercise, setShowAddExercise] = useState<boolean>(false);
    //Substitute exercise modal
    const [subExercise, setSubExercise] = useState<boolean>(false);
    //Store search input value and pass into debounce to look for exercise once user stops typing
    const [exerciseSearchString, setExerciseSearchString] = useState<string>('');
    const debouncedExerciseName = useDebounce(exerciseSearchString, 1000);
    //Store results of search in array to show options to user
    const [searchResults, setSearchResults] = useState<ExerciseSearchResultType[]>([]);

    const newExerciseValues = {
        exerciseName: '', 
        exerciseId: '', 
        repsLower: 0, 
        repsUpper: 0,
        unilateralExercise: false,
        optionalSetModifiers: {
            belt: false, unilateral: false, straps: false
        }
    }
    const [newExercise, setNewExercise] = useState(newExerciseValues);
    //Run exercise search whenever search field updated by user
    useEffect(() => {
        if (!debouncedExerciseName) {
            setSearchResults([]);
            return;
        }

        const runSearch = async () => {
            const res = await dbExerciseSearch(debouncedExerciseName);
            setSearchResults(res.exercises);
        }

        runSearch();
    }, [debouncedExerciseName]);

    return (
        <View style={workoutStyles.exerciseContainer}>
            {/* Modal to search DB for exercises to either add an exercise or substitute exercise */}
            {(showAddExercise || subExercise) && (
                <Modal>
                    <View style={{maxHeight: '80%', marginTop: '10%', padding: 20, paddingTop: 50}}>
                        <View style={[layoutStyles.rowFlex, {justifyContent: 'space-between'}]}>
                            {showAddExercise ?
                                <Text>Add New Exercise</Text>
                                :
                                <Text>Substitute {props.exerciseData.exerciseName}</Text>
                            }
                        </View>
                        {showAddExercise && (
                            <View>
                                <Text>Target Reps</Text>
                                <View style={layoutStyles.rowFlex}>
                                    <TextInput
                                        value={newExercise.repsLower.toString()}
                                        onChangeText={(s: string) => setNewExercise({...newExercise, repsLower: Number(s)})}
                                        placeholder='0'
                                    />
                                    <Text>to</Text>
                                    <TextInput 
                                        value={newExercise.repsUpper.toString()}
                                        onChangeText={(s: string) => setNewExercise({...newExercise, repsUpper: Number(s)})}
                                        placeholder='0'
                                    />
                                </View>
                            </View>
                        )}
                        <View>
                            <Text>Search Exercises:</Text>
                            <TextInput 
                                placeholder='Enter exercise search...'
                                value={newExercise.exerciseName}
                                onChangeText={(s: string) => {
                                    setNewExercise({...newExercise, exerciseName: s})
                                    setExerciseSearchString(s.toLowerCase())
                                }}
                            />
                        </View>
                        {
                            searchResults.length > 0 && (
                                searchResults.map(s => {
                                    return (
                                        <ExerciseSearchResult 
                                            key={s.exercise_id}
                                            exerciseName={s.exercise_name}
                                            targetMuscle={s.muscle_name}
                                            onPress={() => {
                                                setNewExercise({
                                                    ...newExercise, 
                                                    exerciseName: s.exercise_name, 
                                                    exerciseId: s.exercise_id,
                                                    unilateralExercise: s.exercise_unilateral,
                                                    optionalSetModifiers: {
                                                        belt: s.optionalSetModifiers.belt, 
                                                        straps: s.optionalSetModifiers.straps, 
                                                        unilateral: s.optionalSetModifiers.unilateral
                                                    }
                                                });
                                                setSearchResults([]);
                                            }}
                                        />
                                )})
                            )
                        }
                        <View style={layoutStyles.rowFlex}>
                            <Pressable onPress={() => {
                                setNewExercise(newExerciseValues);
                                setExerciseSearchString('');
                                setShowAddExercise(false); 
                                setSubExercise(false);
                            }}>
                                <Text>Cancel</Text>
                            </Pressable>
                            {showAddExercise ? 
                                <Pressable onPress={() => {
                                    props.dispatch({ 
                                        type: 'ADD_EXERCISE', 
                                        exerciseName: newExercise.exerciseName, 
                                        exerciseIndexAddedAfter: props.exerciseData.exerciseIndex, 
                                        exericseId: newExercise.exerciseId, 
                                        repsLower: newExercise.repsLower.toString(), 
                                        repsUpper: newExercise.repsLower.toString(),
                                        unilateralExercise: newExercise.unilateralExercise,
                                        unilateralOption: newExercise.optionalSetModifiers.unilateral,
                                        beltOption: newExercise.optionalSetModifiers.belt,
                                        strapsOption: newExercise.optionalSetModifiers.straps
                                    })
                                    setNewExercise(newExerciseValues);
                                    setExerciseSearchString('');
                                    setShowAddExercise(false)
                                }}>
                                    <Text>Add</Text>
                                </Pressable>
                                :
                                <Pressable onPress={() => {
                                    props.dispatch({
                                        type: 'SUBSTITUTE_EXERCISE',
                                        exerciseIndex: props.exerciseData.exerciseIndex,
                                        newExerciseId: newExercise.exerciseId,
                                        exerciseName: newExercise.exerciseName,
                                        unilateralExercise: newExercise.unilateralExercise,
                                        unilateralOption: newExercise.optionalSetModifiers.unilateral,
                                        beltOption: newExercise.optionalSetModifiers.belt,
                                        strapsOption: newExercise.optionalSetModifiers.straps
                                    })
                                    setNewExercise(newExerciseValues);
                                    setExerciseSearchString('');
                                    setSubExercise(false);
                                }}>
                                    <Text>Set Substitute</Text>
                                </Pressable>
                            }
                        </View>
                    </View>
                </Modal>
            )}
            <View style={[workoutStyles.exerciseHeader, layoutStyles.rowFlex]}>
                <View style={{flexGrow: 1}}>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                        <View style={{display: 'flex', flexDirection: 'row'}}>
                            <Text style={[workoutStyles.headerTextBold, workoutStyles.headerText]}>Exercise: </Text>
                            {props.exerciseData.subbedExercise?.subbedExerciseId ?
                                <Text>{props.exerciseData.subbedExercise.exerciseName}</Text>
                                :
                                <Text style={workoutStyles.headerText}>{props.exerciseData.exerciseName}</Text>
                            }
                        </View>
                        <View style={{display: 'flex', flexDirection: 'row'}}>
                            <Text style={[workoutStyles.headerTextBold, workoutStyles.headerText]}>Target Reps: </Text> 
                            <Text style={workoutStyles.headerText}>{props.exerciseData.exerciseRepsLower} to {props.exerciseData.exerciseRepsUpper}</Text>
                        </View>
                    </View>
                    {
                        showSets ? (
                            <View>
                                {
                                    props.exerciseData.setupNotes && 
                                    <View>
                                        <Text style={[workoutStyles.headerTextBold, workoutStyles.headerText]}>Setup Notes:</Text>
                                        <Text style={workoutStyles.headerText}>{props.exerciseData.setupNotes}</Text>
                                    </View>
                                }
                                {
                                    props.lastTrainedExercise?.exerciseNotes &&
                                    <View style={{display: 'flex', flexDirection: 'row'}}>
                                        <Text style={[workoutStyles.headerTextBold, workoutStyles.headerText]}>Last session notes: </Text>
                                        <Text style={workoutStyles.headerText}>{props.lastTrainedExercise?.exerciseNotes}</Text>
                                    </View>
                                }
                            </View>
                        ) : (
                            <View style={[layoutStyles.rowFlex]}>
                                <Text style={[workoutStyles.headerTextBold, workoutStyles.headerText]}>Sets: </Text>
                                <Text style={workoutStyles.headerText}>{props.exerciseData.sets.length}</Text>
                            </View>
                        )
                    }
                </View>
                <View style={{paddingLeft: 20, paddingRight: 15, alignSelf: 'center'}}>
                    <Pressable onPress={() => setShowSets(!showSets)}>
                        <Text style={workoutStyles.headerText}>{`<`}</Text>
                    </Pressable>
                </View>
            </View>
            {
                showSets && (
                    <View>
                        { props.lastTrainedExercise?.sets[0] && <LastTrainedSet lastTrainedSet={props.lastTrainedExercise?.sets[0]} /> }
                        {
                            props.exerciseData.sets.map(s => {
                            return (
                                <LogSet 
                                    key={s.setId} 
                                    dispatch={props.dispatch}
                                    activeWorkout={props.activeWorkout}
                                    setData={s}
                                    exerciseIndex={props.exerciseData.exerciseIndex}
                                    unilateralExercise={props.exerciseData.subbedExercise?.subbedExerciseId ? props.exerciseData.subbedExercise.unilateralExercise : props.exerciseData.unilateralExercise}
                                    optionalSetModifiers={props.exerciseData.subbedExercise?.subbedExerciseId ? props.exerciseData.subbedExercise.optionalSetModifiers : props.exerciseData.optionalSetModifiers}
                                />
                            )})
                        }

                        <View style={[layoutStyles.rowFlex]}>
                            <Text>Exercise Notes: </Text>
                            <TextInput 
                                placeholder='Leave any notes for next session here'
                                value={props.exerciseData.exerciseNotes}
                                onFocus={() => props.dispatch({ type: 'SET_DROPDOWN_FALSE' })}
                                onChangeText={(s: string) => props.dispatch({ type: 'UPDATE_EXERCISE_NOTES', value: s, exerciseIndex: props.exerciseData.exerciseIndex })}
                            />
                        </View>
                    </View>
                )

            }
            {
                
            }

            <View style={[layoutStyles.rowFlex, workoutStyles.exerciseHeader, {padding: 3, justifyContent: 'space-evenly'}]}>
                <Pressable onPress={() => props.dispatch({ type: 'REMOVE_EXERCISE', exerciseIndex: props.exerciseData.exerciseIndex })}>
                    <Text style={workoutStyles.headerText}>Delete Exercise</Text>
                </Pressable>
                <Pressable onPress={() => setShowAddExercise(true)}>
                    <Text style={workoutStyles.headerText}>Add Exercise</Text>
                </Pressable>
                {
                    props.exerciseData.subbedExercise?.subbedExerciseId ? 
                        <Pressable onPress={() => props.dispatch({ type: 'CLEAR_SUB', exerciseIndex: props.exerciseData.exerciseIndex })}>
                            <Text style={workoutStyles.headerText}>Reset Sub</Text>
                        </Pressable>
                        :
                        <Pressable onPress={() => setSubExercise(true)}>
                            <Text style={workoutStyles.headerText}>Sub Exercise</Text>
                        </Pressable>
                }
                {
                    props.exerciseData.exerciseIndex > 0 && 
                        <Pressable>
                            <Text style={workoutStyles.headerText}>U</Text>
                        </Pressable>
                }
                {
                    props.exerciseData.exerciseIndex < props.exerciseCount - 1 &&
                        <Pressable>
                            <Text style={workoutStyles.headerText}>D</Text>
                        </Pressable>
                }
            </View>
        </View>
    )
}