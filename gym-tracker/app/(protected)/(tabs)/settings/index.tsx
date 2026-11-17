import { useAuth } from '@/contexts/AuthContext';
import layoutStyles from '@/styles/layoutStyles';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Switch } from 'react-native';
import OptionSwitch from '@/forms/account/edit/OptionSwitch';
import LogSetPreferencesPreview from '@/components/LogSetPreferencesPreview';
import { useRouter } from 'expo-router';
import { kgToLb, lbToKg, parseToKg, toDisplay } from '@/utils/unitConversion';
import { EditAccountForm, WeightUnit } from '@/types/user';

type BooleanFields = 'showPrtl' | 'showAstd' | 'showRir' | 'showRpe';

export default function Settings() {
    const { user } = useAuth();
    const router = useRouter();
    const [showUserSettings, setShowUserSettings] = useState<boolean>(false);
    const [showWorkoutSettings, setShowWorkoutSettings] = useState<boolean>(false);

    const [canonicalKg, setCanonicalKg] = useState<number | null>(user ? user.bodyWeight : 0);
    const [editAccountForm, setEditAccountForm] = useState<EditAccountForm>({
        name: {
            value: user ? user.name : '',
            hasChanged: false,
            error: undefined
        },
        bodyWeight: {
            value: user ? toDisplay(user.bodyWeight, user.weightUnit) : '',
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

    const changedFields = Object.fromEntries(
        Object.entries(editAccountForm)
            .filter(([ , field]) => field.hasChanged === true)
            .map(([key, field]) => [key, field.value])
    );

    // console.log(changedFields);

    const toggleField = (key: BooleanFields) : void => {
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

    const checkWeightKgValueChanged = (typedWeight: string, weightUnit: WeightUnit) : boolean => {
        const enteredAsKg = weightUnit === 'kg' ? Number(typedWeight.trim()) : lbToKg(Number(typedWeight.trim()));
        if (typedWeight.trim() === '' || Number.isNaN(enteredAsKg)) return true;

        const savedKg = user?.bodyWeight!!;
        return Math.abs(enteredAsKg - savedKg) > 0.05;
    }

    const handleSubmit = async () => {

    }

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
                                    setEditAccountForm(prev => ({
                                        ...prev,
                                        name: {
                                            value: s,
                                            hasChanged: user.name.trim().toLowerCase() !== s.trim().toLowerCase(),
                                            error: undefined,
                                        }
                                    }));
                                }}
                                style={{fontWeight: editAccountForm.name.hasChanged ? 'bold' : 'normal'}}
                            />
                            <TextInput 
                                label='Weight'
                                keyboardType='decimal-pad'
                                returnKeyType='done'
                                placeholder='Enter your bodyweight'
                                mode='outlined'
                                value={editAccountForm.bodyWeight.value}
                                onChangeText={(s: string) => {
                                    const kg = parseToKg(s, editAccountForm.weightUnit.value);
                                    setCanonicalKg(kg);
                                    setEditAccountForm(prev => ({
                                        ...prev,
                                        bodyWeight: {
                                            value: s.trim(),
                                            hasChanged: kg !== null && Math.abs(kg - user.bodyWeight) > 0.004,
                                            error: kg === null ? 'Enter a valid weight' : undefined
                                        }
                                    }));
                                }}
                                style={{fontWeight: editAccountForm.bodyWeight.hasChanged ? 'bold' : 'normal'}}
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
                                    <Text>{user.recoveryQuestion}</Text>
                                </View>
                            </View>
                            <View style={[layoutStyles.rowFlex, {backgroundColor: 'red', justifyContent: 'space-around'}]}>
                                <Pressable
                                    onPress={() => router.push('/settings/change-password')}
                                >
                                    <Text>Change Password</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => router.push('/settings/change-recovery')}
                                >
                                    <Text>Change Recovery ?</Text>
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
                                        const newUnit = prev.weightUnit.value === 'kg' ? 'lb' : 'kg';

                                        return {
                                            ...prev,
                                            weightUnit: {
                                                ...prev.weightUnit,
                                                value: newUnit,
                                                hasChanged: newUnit !== user.weightUnit
                                            },
                                            bodyWeight: canonicalKg === null ?
                                                prev.bodyWeight : 
                                                {
                                                    ...prev.bodyWeight,
                                                    value: toDisplay(canonicalKg, newUnit)
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