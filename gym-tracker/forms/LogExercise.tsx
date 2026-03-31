import { ExerciseSearchResultType, LoggedWorkoutExercise, LogWorkoutAction, WorkoutTemplateType } from '@/types/workouts';
import { View, Text, TextInput, Pressable, Modal } from 'react-native';
import workoutStyles from '@/styles/workouts';
import { Dispatch, useEffect, useState } from 'react';
import LogSet from './LogSet';
import layoutStyles from '@/styles/layoutStyles';
import useDebounce from '@/utils/search';
import { dbExerciseSearch } from '@/utils/workouts';
import ExerciseSearchResult from '@/components/ExerciseSearchResult';

interface Props {
    dispatch: Dispatch<LogWorkoutAction>,
    exerciseData: LoggedWorkoutExercise,
    activeWorkout: boolean,
    lastTrainedExercise?: LoggedWorkoutExercise,
}

export default function LogExercise ( props: Props ) {
    const [showAddExercise, setShowAddExercise] = useState<boolean>(false);
    const [exerciseSearchString, setExerciseSearchString] = useState<string>('');
    const [searchResults, setSearchResults] = useState<ExerciseSearchResultType[]>([]);
    const debouncedExerciseName = useDebounce(exerciseSearchString, 1000);
    const [newExercise, setNewExercise] = useState({
        exerciseName: '', 
        exerciseId: '', 
        repsLower: 0, 
        repsUpper: 0,
        unilateralExercise: false,
        optionalSetModifiers: {
            belt: false, unilateral: false, straps: false
        }
    });

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
            {showAddExercise && (
                <Modal>
                    <View style={{maxHeight: '80%', marginTop: '10%', padding: 20, paddingTop: 50}}>
                        <View style={[layoutStyles.rowFlex, {justifyContent: 'space-between'}]}>
                            <Text>Add New Exercise</Text>
                        </View>
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
                        <View>
                            <Text>Search Exercises:</Text>
                            <TextInput 
                                placeholder='Enter exercise search...'
                                value={exerciseSearchString}
                                onChangeText={(s: string) => setExerciseSearchString(s.toLowerCase())}
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
                                                        straps: s.optionalSetModifiers.belt, 
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
                            <Pressable onPress={() => setShowAddExercise(false)}><Text>Cancel</Text></Pressable>
                            <Pressable onPress={() => {
                                setShowAddExercise(false)
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
                            }}>
                                <Text>Add</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            )}
            <View style={[workoutStyles.exerciseHeader, layoutStyles.rowFlex]}>
                <View>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                        <View style={{display: 'flex', flexDirection: 'row'}}>
                            <Text style={[workoutStyles.headerTextBold, workoutStyles.headerText]}>Exercise: </Text>
                            <Text style={workoutStyles.headerText}>{props.exerciseData.exerciseName}</Text>
                        </View>
                    </View>
                    {
                        props.exerciseData.setupNotes && 
                        <View>
                            <Text style={[workoutStyles.headerTextBold, workoutStyles.headerText]}>Setup Notes:</Text>
                            <Text style={workoutStyles.headerText}>{props.exerciseData.setupNotes}</Text>
                        </View>
                    }
                    <View style={{display: 'flex', flexDirection: 'row'}}>
                        <Text style={[workoutStyles.headerTextBold, workoutStyles.headerText]}>Target Reps: </Text> 
                        <Text style={workoutStyles.headerText}>{props.exerciseData.exerciseRepsLower} to {props.exerciseData.exerciseRepsUpper}</Text>
                    </View>
                    <View style={{display: 'flex', flexDirection: 'row'}}>
                        <Text style={[workoutStyles.headerTextBold, workoutStyles.headerText]}>Last session notes: </Text>
                        <Text style={workoutStyles.headerText}>{props.lastTrainedExercise?.exerciseNotes}</Text>
                    </View>
                </View>

                <View>
                    <Pressable onPress={() => props.dispatch({ type: 'REMOVE_EXERCISE', exerciseIndex: props.exerciseData.exerciseIndex })}>
                        <Text style={workoutStyles.headerText}>Delete Exercise</Text>
                    </Pressable>
                    <Pressable onPress={() => setShowAddExercise(true)}>
                        <Text style={workoutStyles.headerText}>Add Exercise</Text>
                    </Pressable>
                </View>
            </View>
            {
                props.exerciseData.sets.map(s => {
                    return (
                        <LogSet 
                            key={s.setId} 
                            dispatch={props.dispatch}
                            activeWorkout={props.activeWorkout}
                            setData={s}
                            exerciseIndex={props.exerciseData.exerciseIndex}
                            optionalSetModifiers={props.exerciseData.optionalSetModifiers}
                        ></LogSet>)
                })
            }
            <Text>Exercise Notes:</Text>
            <TextInput 
                placeholder='Leave any notes for next session here'
                value={props.exerciseData.exerciseNotes}
                onFocus={() => props.dispatch({ type: 'SET_DROPDOWN_FALSE' })}
                onChangeText={(s: string) => props.dispatch({ type: 'UPDATE_EXERCISE_NOTES', value: s, exerciseIndex: props.exerciseData.exerciseIndex })}
            />
        </View>
    )
}