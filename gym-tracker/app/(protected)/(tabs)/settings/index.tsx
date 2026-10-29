import { useAuth } from '@/contexts/AuthContext';
import layoutStyles from '@/styles/layoutStyles';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Switch } from 'react-native';
import OptionSwitch from '@/forms/account/edit/OptionSwitch';
import LogSetPreferencesPreview from '@/components/LogSetPreferencesPreview';
import { useRouter } from 'expo-router';

type BooleanFields = 'showPrtl' | 'showAstd' | 'showRir' | 'showRpe';

export default function Settings() {
    const { user } = useAuth();
    const router = useRouter();
    const [showUserSettings, setShowUserSettings] = useState<boolean>(false);
    const [showWorkoutSettings, setShowWorkoutSettings] = useState<boolean>(false);

    const [editAccountForm, setEditAccountForm] = useState({
        name: {
            value: user ? user.name : '',
            hasChanged: false,
            error: undefined
        },
        bodyWeight: {
            value: user ? user.bodyWeight.toString() : '',
            hasChanged: false,
            error: undefined
        },
        weightUnit: {
            value: user ? user.weightUnit : 'kg',
            hasChanged: false,
            error: undefined
        },
        showPrtl: {
            value: user ? user.showPrtl : true,
            hasChanged: false,
            error: undefined,
        },
        showAstd: {
            value: user ? user.showAstd : true,
            hasChanged: false,
            error: undefined,
        },
        showRir: {
            value: user ? user.showRir : true,
            hasChanged: false,
            error: undefined,
        },
        showRpe: {
            value: user ? user.showRpe : true,
            hasChanged: false,
            error: undefined,
        },
    });

    const toggleField = (key: BooleanFields) => {
        setEditAccountForm(prev => {
            const flipped = !prev[key].value;
            return {
                ...prev,
                [key]: {
                    ...prev[key],
                    value: flipped,
                    hasChanged: flipped !== user?.[key]
                }
            }
        })
    }

    const toggleableFields : {
        fieldKey: BooleanFields,
        value: boolean,
        hasChanged: boolean,
        error: string | undefined,
        label: string,
        inputLabel: string,
        inputPlaceholder: string,
    }[] = [
        {fieldKey: 'showPrtl', label: 'Show Partial Reps', inputLabel: 'Partial: ', inputPlaceholder: '1', ...editAccountForm.showPrtl},
        {fieldKey: 'showAstd', label: 'Show Assisted Reps', inputLabel: 'Assisted: ', inputPlaceholder: '0', ...editAccountForm.showAstd},
        {fieldKey: 'showRpe', label: 'Show RPE', inputLabel: 'RPE: ', inputPlaceholder: '9', ...editAccountForm.showRpe},
        {fieldKey: 'showRir', label: 'Show Reps in Reserve', inputLabel: 'RiR: ', inputPlaceholder: '0', ...editAccountForm.showRir}
    ];

    if (!user) return <View><Text>You must be logged in to view this page</Text></View>
    return (
        <View style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            <ScrollView style={{flexGrow: 1}}>
                <View>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexGrow: 1}}>
                        <Text style={{flexGrow: 1, fontWeight: 'bold'}}>Account Details</Text>
                        <Pressable onPress={() => setShowUserSettings(!showUserSettings)}>
                            <Text>{showUserSettings ? 'Hide' : 'Show'}</Text>
                        </Pressable>
                    </View>
                    {showUserSettings &&
                        <View>
                            <TextInput
                                label='First Name'
                                placeholder='Enter your first name'
                                mode='outlined'
                                value={editAccountForm.name.value}
                                onChangeText={(s: string) => {
                                    setEditAccountForm({
                                        ...editAccountForm,
                                        name: {
                                            value: s,
                                            hasChanged: editAccountForm.name.value.trim().toLowerCase() !== s.trim().toLowerCase(),
                                            error: undefined,
                                        }
                                    });
                                }}
                                style={{fontWeight: editAccountForm.name.value.trim().toLowerCase() === user.name.trim().toLowerCase() ? 'normal' : 'bold'}}
                            />
                            <TextInput 
                                label='Weight'
                                keyboardType='decimal-pad'
                                returnKeyType='done'
                                placeholder='Enter your bodyweight'
                                mode='outlined'
                                value={editAccountForm.bodyWeight.value}
                                onChangeText={(s: string) => {
                                    setEditAccountForm({
                                        ...editAccountForm,
                                        bodyWeight: {
                                            value: s,
                                            hasChanged: editAccountForm.bodyWeight.value.trim() !== s.trim(),
                                            error: undefined
                                        }
                                    });
                                }}
                                style={{fontWeight: editAccountForm.bodyWeight.value.trim() === user.bodyWeight.toString().trim() ? 'normal' : 'bold'}}
                                right={<TextInput.Affix text={ editAccountForm.weightUnit.value.toUpperCase() + 's' } />}
                            />
                            <View style={{display: 'flex', flexDirection: 'row'}}>
                                <View>
                                    <Text>Username: </Text>
                                    <Text>Password: </Text>
                                    <Text>Recovery Question: </Text>
                                </View>
                                <View>
                                    <Text>{user.username}</Text>
                                    <Text>***************</Text>
                                    <Text>Recovery Answer</Text>
                                </View>
                            </View>
                            <View style={[layoutStyles.rowFlex, {backgroundColor: 'red', justifyContent: 'space-around'}]}>
                                <Pressable
                                    onPress={() => router.push('/settings/change-recovery')}
                                >
                                    <Text>Change Recovery ?</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => router.push('/settings/change-password')}
                                >
                                    <Text>Change Password</Text>
                                </Pressable>
                            </View>
                        </View>
                    }
                </View>

                <View>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexGrow: 1}}>
                        <Text style={{flexGrow: 1, fontWeight: 'bold'}}>Workout Preferences</Text>
                        <Pressable onPress={() => setShowWorkoutSettings(!showWorkoutSettings)}>
                            <Text>{showWorkoutSettings ? 'Hide' : 'Show'}</Text>
                        </Pressable>
                    </View>
                    {showWorkoutSettings &&
                        <View style={{display: 'flex', gap: 10}}>
                            <View style={[layoutStyles.rowFlex, {alignItems: 'center'}]}>
                                <Text>Weight Unit </Text>
                                <Text>KGs</Text>
                                <Switch 
                                    value={editAccountForm.weightUnit.value === 'lb'}
                                    onValueChange={() => setEditAccountForm(prev => {
                                        return {
                                            ...editAccountForm,
                                            weightUnit: {
                                                ...editAccountForm.weightUnit,
                                                value: prev.weightUnit.value === 'kg' ? 'lb' : 'kg',
                                                hasChanged: prev.weightUnit.value === user.weightUnit
                                            },
                                            bodyWeight: {
                                                ...editAccountForm.bodyWeight,
                                                value: prev.weightUnit.value === 'kg' ? 
                                                    (Number(prev.bodyWeight.value) * 2.2046226218).toString() :
                                                    (Number(prev.bodyWeight.value) / 2.2046226218).toString()
                                                ,
                                            }
                                        }
                                    })}
                                    ios_backgroundColor='rgb(0, 255, 0)'
                                />
                                <Text>LBs</Text>
                            </View>
                            {
                                toggleableFields.map(t => (
                                    <OptionSwitch 
                                        hasChanged={t.hasChanged}
                                        label={t.label}
                                        fieldValue={t.value}
                                        toggleField={toggleField}
                                        fieldKey={t.fieldKey}
                                        key={t.fieldKey}
                                    />
                                ))
                            }
                            <Text>Preview Preferences</Text>
                            <LogSetPreferencesPreview 
                                shownFields={toggleableFields.filter(t => t.value).map(t => ({fieldLabel: t.inputLabel, fieldValue: t.inputPlaceholder}))}
                                unit={editAccountForm.weightUnit.value}
                            />
                        </View>
                    }
                </View>

            </ScrollView>

            <View style={[layoutStyles.rowFlex, {backgroundColor: 'red', justifyContent: 'space-around', flexGrow: 0}]}>
                <Pressable>
                    <Text>Update Account</Text>
                </Pressable>
                <Pressable>
                    <Text>Delete Account</Text>
                </Pressable>
            </View>
        </View>
    )
}