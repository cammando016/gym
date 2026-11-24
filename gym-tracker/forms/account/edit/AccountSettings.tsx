import { useAuth } from '@/contexts/AuthContext';
import layoutStyles from '@/styles/layoutStyles';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Switch } from 'react-native';
import OptionSwitch from '@/forms/account/edit/OptionSwitch';
import LogSetPreferencesPreview from '@/components/LogSetPreferencesPreview';
import { useRouter } from 'expo-router';
import { parseToKg, toDisplay } from '@/utils/unitConversion';
import { EditAccountForm, EditAccountPayload, User } from '@/types/user';
import { validateNameField } from '@/utils/formValiditors';
import Toast from 'react-native-toast-message';
import { updateAccountSettings } from '@/utils/account';

type BooleanFields = 'show_prtl_reps' | 'show_astd_reps' | 'show_rir' | 'show_rpe';
//Match fields from user object to field names in db (camelCase vs kebab_case)
const USER_KEY: Record<BooleanFields, keyof User> = {
    show_prtl_reps: 'showPrtl',
    show_astd_reps: 'showAstd',
    show_rir: 'showRir',
    show_rpe: 'showRpe'
}

interface Props {
    key: string,
    user: User,
}

export default function AccountSettings(props : Props) {
    const { refreshUser } = useAuth();
    const user = props.user;
    const router = useRouter();
    //Toggle showing/hiding setting sections
    const [showUserSettings, setShowUserSettings] = useState<boolean>(false);
    const [showWorkoutSettings, setShowWorkoutSettings] = useState<boolean>(false);

    //Store the value of the user's bodyweight as a kg value, regardless of selected weight unit
    //DB stores all values in KG and converts displayed value on frontend based on account setting
    const [canonicalKg, setCanonicalKg] = useState<number | null>(user ? user.bodyWeight : 0);
    const [editAccountForm, setEditAccountForm] = useState<EditAccountForm>({
        name: {
            value: user ? user.name : '',
            hasChanged: false,
            error: undefined
        },
        weight: {
            value: user ? toDisplay(user.bodyWeight, user.weightUnit) : '',
            hasChanged: false,
            error: undefined
        },
        weight_unit: {
            value: user ? user.weightUnit : 'kg',
            hasChanged: false,
            error: undefined
        },
        show_prtl_reps: {
            value: user ? user.showPrtl : true,
            hasChanged: false,
            error: undefined,
        },
        show_astd_reps: {
            value: user ? user.showAstd : true,
            hasChanged: false,
            error: undefined,
        },
        show_rir: {
            value: user ? user.showRir : true,
            hasChanged: false,
            error: undefined,
        },
        show_rpe: {
            value: user ? user.showRpe : true,
            hasChanged: false,
            error: undefined,
        },
    });

    //Reusable function for fields controlled by switch
    const toggleField = (key: BooleanFields) : void => {
        setEditAccountForm(prev => {
            const flipped = !prev[key].value;
            return {
                ...prev,
                [key]: {
                    ...prev[key],
                    value: flipped,
                    hasChanged: flipped !== user?.[USER_KEY[key]],
                }
            }
        })
    }

    //List of fields controlled by toggle switch to map reusable component
    const toggleableFields : {
        fieldKey: BooleanFields,
        value: boolean,
        hasChanged: boolean,
        error: string | undefined,
        label: string,
        inputLabel: string,
        inputPlaceholder: string,
    }[] = [
        {fieldKey: 'show_prtl_reps', label: 'Show Partial Reps', inputLabel: 'Partial: ', inputPlaceholder: '1', ...editAccountForm.show_prtl_reps},
        {fieldKey: 'show_astd_reps', label: 'Show Assisted Reps', inputLabel: 'Assisted: ', inputPlaceholder: '0', ...editAccountForm.show_astd_reps},
        {fieldKey: 'show_rpe', label: 'Show RPE', inputLabel: 'RPE: ', inputPlaceholder: '9', ...editAccountForm.show_rpe},
        {fieldKey: 'show_rir', label: 'Show Reps in Reserve', inputLabel: 'RiR: ', inputPlaceholder: '0', ...editAccountForm.show_rir}
    ];

    //Object with only edited values to submit patch request
    const changedFields = Object.fromEntries(
        Object.entries(editAccountForm)
            .filter(([ , field]) => field.hasChanged === true)
            .map(([key, field]) => [key, field.value])
    );
    const hasChanges = Object.values(editAccountForm).some(f => f.hasChanged);
    //Disable update account button if any validation fails
    const hasErrors : boolean = Object.values(editAccountForm).some(
        field => field.error !== undefined
    );
    const submitDisabled : boolean = !hasChanges || hasErrors;

    const validateAllFields = () : boolean => {
        let validationPassed : boolean = true;
        const validateName = validateNameField(editAccountForm.name.value, 'First Name');
        if (validateName) {
            setEditAccountForm(prev => (
                {
                    ...prev,
                    name: {
                        ...prev.name,
                        error: validateName
                    }
                }
            ));
            validationPassed = false;
        }
        const validateWeight = parseToKg(editAccountForm.weight.value, editAccountForm.weight_unit.value);
        if (validateWeight === null) {
            setEditAccountForm(prev => (
                {
                    ...prev,
                    bodyWeight: {
                        ...prev.weight,
                        error: 'Enter a valid weight'
                    }
                }
            ));
            validationPassed = false;
        }

        return validationPassed;
    }

    const handleSubmit = async () => {
        if (!validateAllFields()) {
            Toast.show({
                type: 'error',
                text1: 'Please fix errors and retry',
                topOffset: 80
            });
            return;
        }
        const payload : EditAccountPayload = changedFields; 
        if (payload.weight && canonicalKg) payload.weight = canonicalKg;
        const res = await updateAccountSettings(payload);
        
        if (res.ok) {
            await refreshUser();
            Toast.show({
                type: 'success',
                text1: 'Account Updated',
                topOffset: 80
            });
        } else {
            Toast.show({
                type: 'error',
                text1: res.error,
                text2: 'Please try again',
                topOffset: 80
            })
        }
    }
    
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
                                autoCorrect={false}
                                onChangeText={(s: string) => {
                                    setEditAccountForm(prev => ({
                                        ...prev,
                                        name: {
                                            value: s,
                                            hasChanged: user.name.trim() !== s.trim(),
                                            error: validateNameField(s, 'First Name'),
                                        }
                                    }));
                                }}
                                outlineStyle={{
                                    borderColor: editAccountForm.name.error ? 'red' : 'green'
                                }}
                                style={{
                                    fontWeight: editAccountForm.name.hasChanged ? 'bold' : 'normal',
                                }}
                            />
                            {editAccountForm.name.error && <Text>{editAccountForm.name.error}</Text>}
                            <TextInput 
                                label='Weight'
                                keyboardType='decimal-pad'
                                returnKeyType='done'
                                placeholder='Enter your bodyweight'
                                mode='outlined'
                                value={editAccountForm.weight.value}
                                onChangeText={(s: string) => {
                                    const kg = parseToKg(s, editAccountForm.weight_unit.value);
                                    setCanonicalKg(kg);
                                    setEditAccountForm(prev => ({
                                        ...prev,
                                        bodyWeight: {
                                            value: s,
                                            hasChanged: kg !== null && Math.abs(kg - user.bodyWeight) > 0.004,
                                            error: kg === null ? 'Enter a valid weight' : undefined
                                        }
                                    }));
                                }}
                                style={{fontWeight: editAccountForm.weight.hasChanged ? 'bold' : 'normal'}}
                                right={<TextInput.Affix text={ editAccountForm.weight_unit.value.toUpperCase() + 's' } />}
                            />
                            {editAccountForm.weight.error && <Text>{editAccountForm.weight.error}</Text>}
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
                                    value={editAccountForm.weight_unit.value === 'lb'}
                                    onValueChange={() => setEditAccountForm(prev => {
                                        const newUnit = prev.weight_unit.value === 'kg' ? 'lb' : 'kg';

                                        return {
                                            ...prev,
                                            weightUnit: {
                                                ...prev.weight_unit,
                                                value: newUnit,
                                                hasChanged: newUnit !== user.weightUnit
                                            },
                                            bodyWeight: canonicalKg === null ?
                                                prev.weight : 
                                                {
                                                    ...prev.weight,
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
                            {/* Shows how user settings will be rendered when logging a workout */}
                            {/* Filters to the true values from the toggleable fields to update without manually passing each from form */}
                            <Text>Preview Preferences</Text>
                            <LogSetPreferencesPreview 
                                shownFields={toggleableFields.filter(t => t.value).map(t => ({fieldLabel: t.inputLabel, fieldValue: t.inputPlaceholder}))}
                                unit={editAccountForm.weight_unit.value}
                            />
                        </View>
                    }
                </View>

            </ScrollView>

            <View style={[layoutStyles.rowFlex, {backgroundColor: submitDisabled ? 'red' : 'green', justifyContent: 'space-around', flexGrow: 0}]}>
                <Pressable
                    disabled={submitDisabled}
                    onPress={handleSubmit}
                >
                    <Text>Update Account</Text>
                </Pressable>
                <Pressable>
                    <Text>Delete Account</Text>
                </Pressable>
            </View>
        </View>
    )
}