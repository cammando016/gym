import { View, Text, TextInput, Pressable } from 'react-native';
import { useMemo, useState } from 'react';
import { EditSplitPayload, Split, SplitDay, SplitFormPayload } from '@/types/workouts';
import { Checkbox } from 'expo-checkbox';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useRouter } from 'expo-router';
import { createSplit, editSplit } from '@/utils/workouts';
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";


// <--------- TO DO -------------->
/*
Ensure users can't submit a day without either workout template or rest day selected
Reorder workouts
Implement advanced search for workout templates, text input runs basic string match on user's own workouts, limited results
Advanced Search:
Filters for muscle groups trained in workout, name, privacy, more than limited number of options returned on basic search
*/

interface Props {
    existingSplit?: Split,
}

export default function SplitForm( props: Props ) {
    const { data: workouts } = useWorkoutTemplates();
    const router = useRouter();

    const { user } = useAuth();
    const queryClient = useQueryClient();
     
    const [form, setForm] = useState<SplitDay[]>( props.existingSplit ? 
        props.existingSplit.workouts.map((w, i) => {
            return {
                dayIndex: i,
                workoutTemplateId: w.workoutId,
                workoutName: w.workoutName,
                restDay: w.restDay
            }
        })
        : 
        [{
            dayIndex: 0,
            workoutTemplateId: '',
            workoutName: '',
            restDay: false,
        }]
    );

    const [editMode, setEditMode] = useState<boolean>(props.existingSplit ? false : true);
    const toggleEditMode = () => {
        setEditMode(!editMode);
        setExerciseListOpen(false);
    }

    const [newDayIndex, setNewDayIndex] = useState<number>(props.existingSplit ? props.existingSplit.workouts.length : 1);
    const [activeDay, setActiveDay] = useState<number>(0);
    const [splitName, setSplitName] = useState<string>(props.existingSplit ? props.existingSplit.splitName : '');
    const [exerciseListOpen, setExerciseListOpen] = useState<boolean>(false);

    //Error handling
    const [errors, setErrors] = useState<{error: boolean, index: number}[]>(props.existingSplit ? 
        props.existingSplit.workouts.map(w => {
            return {
                error: w.restDay === false && w.workoutId === '',
                index: w.dayIndex
            }
        })
        :
        [{error: true, index: 0}]
    );
    const [nameError, setNameError] = useState<boolean> (splitName === '' ? true : false);

    const submitDisabled = useMemo(() => {
        return errors.some(e => e.error === true);
    }, [errors])

    const handleSubmit = async () => {
        const formPayload : SplitFormPayload = {
            splitName: splitName.toLowerCase().trim(),
            split: form.map((f, i) => {
                return {
                    workoutTemplateId: f.restDay ? '' : f.workoutTemplateId,
                    restDay: f.restDay,
                    dayIndex: i
                }
            })
        }

        const res = await createSplit(formPayload);
        if (res.message) {
            router.back();
            alert(`${splitName} created`);
        } else alert (`Error creating split: ${res.error}. Please try again`);
    }

    const handleAddDay = () => {
        setForm(prev => [
            ...prev,
            {
                dayIndex: newDayIndex,
                workoutTemplateId: '',
                workoutName: '',
                restDay: false,
            }
        ]);
        setErrors(prev => [...prev, {error: true, index: newDayIndex}]);
        setNewDayIndex(newDayIndex + 1);
    }

    const handleDeleteDay = (dayIndex: number) => { 
        setForm(form.filter(f => f.dayIndex !== dayIndex));
        setErrors(errors.filter(e => e.index !== dayIndex)); 
    }

    const handleSelectWorkout = (workoutId: string, workoutName: string, clickedIndex: number) => {
        setForm(prev => prev.map(p => p.dayIndex === clickedIndex ? {...p, workoutName: workoutName, workoutTemplateId: workoutId} : p));
        setExerciseListOpen(false);
    }

    const handleSubmitEditSplit = async () => {
        //Check for changed days
        const firstChangedDay = form.find((f, i) =>
            !props.existingSplit?.workouts[i] ||
            f.dayIndex !== props.existingSplit?.workouts[i].dayIndex ||
            f.restDay !== props.existingSplit.workouts[i].restDay ||
            f.workoutTemplateId !== props.existingSplit.workouts[i].workoutId
        );
        const changedName : string | undefined = props.existingSplit?.splitName === splitName ? undefined : splitName;
        
        //Check if any split data returned, don't send to backend if not
        if (!firstChangedDay && changedName === undefined && form.length === props.existingSplit?.workouts.length) {
            alert(`No changes detected for ${splitName} split`);
            router.back();
        } else {
            const changedDays : SplitDay[] = form.length === props.existingSplit?.workouts.length ? //If length is the same, no added or deleted days, only pass changed days
                form.filter((f, i) => 
                    !props.existingSplit?.workouts[i] ||
                    f.dayIndex !== props.existingSplit?.workouts[i].dayIndex ||
                    f.restDay !== props.existingSplit.workouts[i].restDay ||
                    f.workoutTemplateId !== props.existingSplit.workouts[i].workoutId
                ) : 
                firstChangedDay ? //If length wasn't the same, check which day is first edited
                form.filter(f => f.dayIndex >= firstChangedDay.dayIndex) 
                : []; //Empty list of changes if only name of split was changed
            const formPayload : EditSplitPayload = {
                splitName: changedName,
                splitLength: form.length,
                split: changedDays.map(d => {
                    return {
                        workoutTemplateId: d.restDay ? '' : d.workoutTemplateId,
                        restDay: d.restDay,
                        dayIndex: d.dayIndex
                    }
                })
            }
            const res = await editSplit(formPayload, props.existingSplit?.splitId!!)
            if (res.message) {
                queryClient.refetchQueries({ queryKey: ['splits', user?.username]})
                router.back();
                alert(`${splitName} Updated`);
            } else alert(`Error updating split: ${res.error}. Please try again`);
        }
    }

    return (
        <View>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <View style={{display: 'flex', flexGrow: 1, flexDirection: 'row'}}>
                    <Text>Name:</Text>
                    <View style={{flexGrow: 1, borderWidth: 0.5, borderColor: 'black'}}>
                        <TextInput
                            autoFocus
                            placeholder='Enter a name for your split'
                            value={splitName}
                            onChangeText={(value: string) => {
                                setSplitName(value);
                                setNameError(value === '' ? true : false);
                            }}
                            editable={editMode}
                        />
                    </View>
                </View>
                { props.existingSplit &&
                    <Pressable onPress={toggleEditMode}>
                        <Text style={{color: editMode ? 'green' : 'red'}}>{editMode ? 'Editing Split' : 'Edit Split'}</Text>
                    </Pressable>
                }
            </View>
            <View>
                {
                    form.map((day, i) => {
                        return (
                            <View key={day.dayIndex}>
                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                                    <Text>Day {i + 1}:</Text>
                                    <View style={{flexGrow: 1, borderWidth: 0.5, borderColor: 'black'}}>
                                        <TextInput
                                            placeholder={day.restDay ? 'REST DAY SELECTED' : 'Search Workout Templates'}
                                            value={day.restDay ? '' : day.workoutName}
                                            onChangeText={(value: string) => {
                                                setForm(prev =>
                                                    prev.map(d => d.dayIndex === day.dayIndex ? {...d, workoutName: value} : d )    
                                                );
                                            }}
                                            editable={editMode && !day.restDay}
                                            onFocus={() => {
                                                setActiveDay(day.dayIndex);
                                                setExerciseListOpen(true);
                                            }}
                                        />
                                    </View>
                                    <View style={{display: 'flex', flexDirection: 'row'}}>
                                        <Checkbox 
                                            disabled={!editMode}
                                            value={day.restDay}
                                            onValueChange={(value: boolean) => {
                                                setForm(prev =>
                                                    prev.map(d => d.dayIndex === day.dayIndex ? {...d, restDay: value, workoutTemplateId: '', workoutName: ''} : d )
                                                );
                                                setErrors(prev => 
                                                    prev.map(e => e.index === day.dayIndex ? {...e, error: value === true ? false : true} : e )
                                                );
                                            }}
                                        />
                                        <Text>Rest Day</Text>
                                    </View>
                                    { form.length > 1 && editMode && <Pressable onPress={() => handleDeleteDay(day.dayIndex)} style={{borderWidth: 0.5, borderColor: 'black'}}><Text>X</Text></Pressable> }
                                </View>

                                <View>
                                    { day.dayIndex === activeDay && exerciseListOpen && day.workoutName.length > 0 && (
                                        workouts?.filter(workout => workout.workoutName.includes(form[i].workoutName.toLowerCase().trim())).map(w => {
                                            return (
                                                <Pressable 
                                                    onPress={() => {
                                                        handleSelectWorkout(w.workoutId, w.workoutName, day.dayIndex);
                                                        setErrors(prev => prev.map(e => e.index === day.dayIndex ? {...e, error: false} : e ))
                                                    }} 
                                                    key={w.workoutId}
                                                >
                                                    <Text>{w.workoutName}</Text>
                                                </Pressable>
                                            )
                                        })
                                    )}
                                </View>
                                
                            </View>
                        )
                    })
                }
                <Pressable onPress={handleAddDay}><Text>Add Day</Text></Pressable>
            </View>

            <View style={{display: 'flex', flexDirection: 'row', }}>
                <Pressable onPress={() => router.back()}>
                    <Text>Cancel</Text>
                </Pressable>

                {
                    props.existingSplit ? (
                        <Pressable onPress={handleSubmitEditSplit} disabled={nameError || submitDisabled} >
                            <Text style={{color: nameError || submitDisabled ? 'red' : 'green'}}>Edit Split</Text>
                        </Pressable>
                    ) : (
                        <Pressable onPress={handleSubmit} disabled={nameError || submitDisabled} >
                            <Text style={{color: nameError || submitDisabled ? 'red' : 'green'}}>Create Split</Text>
                        </Pressable>
                    )
                }
                
            </View>
        </View>
    )
}