import { FormValues, SetTracker, SetType, ExerciseSearchResultType } from '@/types/workouts';
import { Button, Text, TextInput, View, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { Exercise } from '../types/workouts.ts';
import NewSet from './NewSet';
import useDebounce from '@/utils/search';
import ExerciseSearchResult from '../components/ExerciseSearchResult.tsx';
import { dbExerciseSearch } from '@/utils/workouts';

interface Props {
    exercise: Exercise,
    exerciseCount: number,
    removeExc: (id: number) => void,
    addSet: (exerciseId: number) => void,
    removeSet: (exerciseId: number, setId: number) => void,
    activeSet: SetTracker,
    activeExercise: number,
    updateActiveSet: (exerciseId: number, setId: number) => void,
    updateActiveExercise: (exerciseIndex: number) => void,
    form: FormValues
    updateForm: (form: FormValues) => void
}

export default function NewExercise(props: Props) {
    //Array of exercises with matching name in form vs db
    const [searchResults, setSearchResults] = useState<ExerciseSearchResultType[]>([]);
    //Only update when user types in the exercise name text input field.
    //Allows search to run when user types, but selecting exercise doesn't update inputValue, hence not triggering useEffects
    const [inputValue, setInputValue] = useState<string>(props.exercise.name);
    console.log(inputValue);

    //Use to search db for exercises with matching name
    const debouncedExerciseName = useDebounce(inputValue, 1000);

    const setsLength: number = props.exercise.sets.length;

    //Search for exercises when user types in exercise name field
    useEffect(() => {
        if (!debouncedExerciseName || debouncedExerciseName.length < 4) {
            setSearchResults([]);
            return;
        }

        const runSearch = async () => {
            const res = await dbExerciseSearch(debouncedExerciseName);
            setSearchResults(res.exercises);
            console.log(res.exercises)
        }

        runSearch();
    }, [debouncedExerciseName]);

    return (
        <View>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text>Exercise Name</Text>
                {
                    props.exerciseCount > 1 && <Button title='Remove Excerise' onPress={() => props.removeExc(props.exercise.index)} />
                }
            </View>
            <View>
                <TextInput 
                    placeholder='Enter exercise name'
                    onFocus={() => props.updateActiveExercise(props.exercise.index)}
                    value={props.form.exercises[props.exercise.index].name}
                    onChangeText={(text: string) => { 
                        setInputValue(text);

                        props.updateForm({ ...props.form, exercises: props.form.exercises.map(exc => {
                            if(exc.index === props.exercise.index) {
                                return {...exc, name: text}
                            } 
                            return exc
                        })})}
                    }
                />

                {/* Only render searched exercises for one exercise at a time */}
                { props.activeExercise === props.exercise.index && (
                // Render list of exercises from db that match user input into exercise name
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                        {
                            searchResults?.length > 0 && (
                                searchResults.map((result) => {
                                    return ( 
                                        <ExerciseSearchResult 
                                            key={result.exercise_id} 
                                            exerciseName={result.exercise_name} 
                                            targetMuscle={result.muscle_name} 
                                            onPress={() => {
                                                props.updateForm({...props.form, exercises: props.form.exercises.map(exc => {
                                                    if (exc.index === props.exercise.index) {
                                                        return {...exc, name: result.exercise_name, dbId: result.exercise_id}
                                                    }
                                                    return exc
                                                })})

                                                setSearchResults([]);
                                            }}
                                        />
                                    )
                                })
                            )
                        }
                    </View>
                )}

                <View>
                    <Text>Rep Range</Text>
                    <View style={{display: 'flex', flexDirection: 'row'}}>
                        <TextInput 
                            placeholder='0'
                            value={props.form.exercises[props.exercise.index].repRangeLower}
                            onChangeText={(n: string) => {
                                props.updateForm({...props.form, exercises: props.form.exercises.map(exc => {
                                    if (exc.index === props.exercise.index) {
                                        return {...exc, repRangeLower: Number(n)}
                                    }
                                    return exc
                                })})
                            }}
                        />
                        <Text> to </Text>
                        <TextInput 
                            placeholder='0'
                            value={props.form.exercises[props.exercise.index].repRangeHigher}
                            onChangeText={(n: string) => {
                                props.updateForm({...props.form, exercises: props.form.exercises.map(exc => {
                                    if (exc.index === props.exercise.index) {
                                        return {...exc, repRangeHigher: Number(n)}
                                    }
                                    return exc
                                })})
                            }}
                        />
                    </View>
                </View>
            </View>

            <View>
                {
                    props.exercise.sets.map((set: { id: number, type: SetType }) => {
                        return <NewSet key={set.id} form={props.form} updateForm={props.updateForm} exerciseId={props.exercise.index} set={set} setCount={setsLength} removeSet={props.removeSet} activeSet={props.activeSet} updateActiveSet={props.updateActiveSet} />
                    })
                }
            </View>

            <View>
                <Button title='Add Set' onPress={() => props.addSet(props.exercise.index)} />
            </View>
        </View>
    )
}