import { FormValues, SetTracker, SetType, ExerciseSearchResultType } from '@/types/workouts';
import { Button, Text, TextInput, View } from 'react-native';
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
    updateActiveSet: (exerciseId: number, setId: number) => void
    form: FormValues
    updateForm: (form: FormValues) => void
}

export default function NewExercise(props: Props) {
    //Array of exercises with matching name in form vs db
    const [searchResults, setSearchResults] = useState<ExerciseSearchResultType[]>([]);
    //Use to search db for exercises with matching name
    const debouncedExerciseName = useDebounce(props.exercise.name, 1000);

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
                    value={props.form.exercises[props.exercise.index].name}
                    onChangeText={(text: string) => { 
                        props.updateForm({ ...props.form, exercises: props.form.exercises.map(exc => {
                            if(exc.index === props.exercise.index) {
                                return {...exc, name: text}
                            } 
                            return exc
                        })})}
                    }
                />
                <View>
                    {
                        searchResults?.length > 0 && (
                            searchResults.map((result) => {
                                return <ExerciseSearchResult key={result.exercise_id} exerciseName={result.exercise_name} targetMuscle={result.muscle_name} />
                            })
                        )
                    }
                </View>
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