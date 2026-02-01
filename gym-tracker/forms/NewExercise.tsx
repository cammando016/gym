import { SetTracker, SetType, ExerciseSearchResultType, WorkoutAction, Exercise } from '@/types/workouts';
import { Button, Text, TextInput, View, ScrollView, Pressable, Modal } from 'react-native';
import { useEffect, useState, Dispatch } from 'react';
import NewSet from './NewSet';
import useDebounce from '@/utils/search';
import ExerciseSearchResult from '../components/ExerciseSearchResult.tsx';
import { dbExerciseSearch } from '@/utils/workouts';
import CreateExercise from './CreateExercise';

interface Props {
    exercise: Exercise,
    exerciseCount: number,
    removeExc: (id: number) => void,
    addSet: (exerciseId: number) => void,
    activeSet: SetTracker,
    activeExercise: number,
    updateActiveSet: (exerciseId: number, setId: number) => void,
    updateActiveExercise: (exerciseIndex: number) => void,
    updateForm: Dispatch<WorkoutAction>,
}

export default function NewExercise(props: Props) {
    //Array of exercises with matching name in form vs db
    const [searchResults, setSearchResults] = useState<ExerciseSearchResultType[]>([]);
    //Only update when user types in the exercise name text input field.
    //Allows search to run when user types, but selecting exercise doesn't update inputValue, hence not triggering useEffects
    const [inputValue, setInputValue] = useState<string>(props.exercise.name);

    //Use to search db for exercises with matching name
    const debouncedExerciseName = useDebounce(inputValue, 1000);

    //state value to show or hide modal for adding a new exercise not in DB
    const [showCreateExercise, setShowCreateExercise] = useState<boolean>(false);

    //Search for exercises when user types in exercise name field
    useEffect(() => {
        if (!debouncedExerciseName ) {
            setSearchResults([]);
            return;
        }

        const runSearch = async () => {
            const res = await dbExerciseSearch(debouncedExerciseName);
            setSearchResults(res.exercises);
        }

        runSearch();
    }, [debouncedExerciseName]);

    const createExercise = () => {
        props.updateForm({ type: 'CREATE_DB_EXERCISE', exerciseIndex: props.exercise.index });
        setShowCreateExercise(true);
    }

    const closeCreateExercise = () => {
        setShowCreateExercise(false);
    }

    return (
        <View>

            {showCreateExercise && (
                <Modal>
                    <CreateExercise closeModal={closeCreateExercise} exercise={props.exercise} updateForm={props.updateForm} />
                </Modal>
            )}

            <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text>Exercise Name</Text>
                {
                    props.exerciseCount > 1 && <Button title='Remove Excerise' onPress={() => props.removeExc(props.exercise.index)} />
                }
            </View>
            <View>
                <TextInput 
                    placeholder='Search exercises'
                    onFocus={() => props.updateActiveExercise(props.exercise.index)}
                    value={props.exercise.name}
                    onChangeText={(text: string) => { 
                        setInputValue(text);
                        props.updateForm({ type: 'SET_EXERCISE_NAME', value: text, exerciseIndex: props.exercise.index })
                    }}
                />

                {/* Only render searched exercises for one exercise at a time */}
                { props.activeExercise === props.exercise.index && (
                // Render list of exercises from db that match user input into exercise name
                    searchResults?.length > 0 && (
                        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                            <Pressable onPress={() => createExercise()}>
                                <Text>Create New Exercise</Text>
                            </Pressable>
                            <ScrollView horizontal={true}><View style={{display: 'flex', flexDirection: 'row'}}>
                                {searchResults.map((result) => {
                                    return ( 
                                        <ExerciseSearchResult 
                                            key={result.exercise_id} 
                                            exerciseName={result.exercise_name} 
                                            targetMuscle={result.muscle_name} 
                                            onPress={() => {
                                                props.updateForm({ type: 'SELECT_EXERCISE', exerciseIndex: props.exercise.index, newFieldValues: {
                                                    name: result.exercise_name,
                                                    isUnilateral: result.exercise_unilateral,
                                                    dbId: result.exercise_id
                                                }})
                                                setSearchResults([]);
                                            }}
                                        />
                                    )
                                })
                                }
                            </View></ScrollView>
                        </View>
                    )
                )}

                <View>
                    <Text>Rep Range</Text>
                    <View style={{display: 'flex', flexDirection: 'row'}}>
                        <TextInput 
                            placeholder='0'
                            value={props.exercise.repRangeLower}
                            onChangeText={(n: string) => {
                                props.updateForm({ type: 'SET_EXERCISE_REPS_TARGET_LOWER', exerciseIndex: props.exercise.index, value: Number(n) })
                            }}
                        />
                        <Text> to </Text>
                        <TextInput 
                            placeholder='0'
                            value={props.exercise.repRangeHigher}
                            onChangeText={(n: string) => {
                                props.updateForm({ type: 'SET_EXERCISE_REPS_TARGET_UPPER', exerciseIndex: props.exercise.index, value: Number(n) })
                            }}
                        />
                    </View>
                </View>
            </View>

            <View>
                {
                    props.exercise.sets.map((set: { id: number, type: SetType }) => {
                        return <NewSet key={set.id} exercise={props.exercise} updateForm={props.updateForm} set={set} activeSet={props.activeSet} updateActiveSet={props.updateActiveSet} />
                    })
                }
            </View>

            <View>
                <Button title='Add Set' onPress={() => props.addSet(props.exercise.index)} />
            </View>
        </View>
    )
}