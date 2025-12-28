import { FormValues, SignupPayload } from '@/types/user';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';
import { signup } from '@/utils/account';
import DateTimePicker from '@react-native-community/datetimepicker';
import { validateOptionalNumericField, validatePasswordsMatch, validateRequiredAlphabeticalField, validateRequiredAlphanumericField, validateRequiredField } from '@/utils/formValiditors';

export default function AccountForm() {
    const router = useRouter();
    const today = new Date();

    const [form, setForm] = useState<FormValues>({
        name: '',
        birthday: new Date(2000, 0, 1),
        username: '',
        weight: '',
        weightUnit: 'kg',
        benchPr: '',
        squatPr: '',
        deadPr: '',
        password: '',
        confirmPassword: ''
    });
    type FormErrors = Partial<Record<keyof FormValues, string>>;
    const [errors, setErrors] = useState<FormErrors>({});

    const [showDatePicker, setShowDatePicker] = useState<boolean>(false)

    const validateForm = (form: FormValues): FormErrors => {
        const errors: FormErrors = {};
        // Name must be provided and be letters only
        const nameCheck = validateRequiredAlphabeticalField(form.name, 'Name');
        const usernameCheck = validateRequiredAlphanumericField(form.username, 'Username');
        const passwordCheck = validateRequiredField(form.password, 'Password');
        const confirmPasswordCheck = validatePasswordsMatch(form.password, form.confirmPassword);

        if (nameCheck.isInvalid) errors.name = nameCheck.error;
        if (usernameCheck.isInvalid) errors.username = usernameCheck.error;
        if (passwordCheck.isInvalid) errors.password = passwordCheck.error;
        if (confirmPasswordCheck.isInvalid) errors.confirmPassword = confirmPasswordCheck.error;

        return errors;
    }

    const handleCancel = () => router.back();
    const handleSubmit = async () => {
        //Check for form value errors before submitting to backend
        const errors = validateForm(form);
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }
        const payload : SignupPayload = {
            ...form, 
            weight: Number(form.weight), 
            benchPr: Number(form.benchPr), 
            squatPr: Number(form.squatPr),
            deadPr: Number(form.deadPr)
        };
        //Submit form values to backend if all fields were valid
        const res = await signup(payload);
        if (res.message) {
            alert('Sign Up Worked!');
        }
        else alert('Sign up Error');
    }

    return (
        <View>
            <Text>First Name *</Text>
            <TextInput 
                placeholder='Your First Name'
                value={form.name}
                autoCorrect={false}
                onChangeText={(s: string) => setForm(prev => ({...prev, name: s}))}
                onBlur={() => {
                    const errorCheck = validateRequiredAlphabeticalField(form.name, 'First Name');
                    setErrors(prev => {
                        if (errorCheck.isInvalid) return {...prev, name: errorCheck.error};
                        const {name, ...rest} = prev;
                        return rest;
                    });
                }}
            />
            {
                errors.name && <Text>{errors.name}</Text>
            }
            <Text>Username *</Text>
            <TextInput 
                placeholder='Your Username'
                value={form.username}
                autoCapitalize='none'
                autoCorrect={false}
                onChangeText={(s: string) => setForm(prev => ({...prev, username: s}))}
                onBlur={() => {
                    const errorCheck = validateRequiredAlphanumericField(form.username, 'Username');
                    setErrors(prev => {
                        if (errorCheck.isInvalid) return {...prev, username: errorCheck.error}
                        const {username, ...rest} = prev;
                        return rest;
                    })
                }}
            />
            {
                errors.username && <Text>{errors.username}</Text>
            }
            <Text>Birthday *</Text>
            <View>
                <Pressable onPress={() => setShowDatePicker(true)}>
                    <Text>{form.birthday.toDateString()}</Text>
                </Pressable>

                {
                    showDatePicker && (
                        <DateTimePicker 
                            value={form.birthday}
                            mode="date"
                            display="spinner"
                            minimumDate={new Date(1900, 0, 1)}
                            maximumDate={new Date(today.getFullYear() - 12, today.getMonth(), today.getDate())}
                            onChange={(_ : any, selectedDate: Date) => {
                                setShowDatePicker(false);
                                if(selectedDate) setForm(prev => ({...prev, birthday: (selectedDate)}))
                            }}
                        />
                    )
                }
            </View>
            <Text>Preferred Weight Unit *</Text>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text>KGs</Text>
                <Switch 
                    value={form.weightUnit === 'kg' ? false : true}
                    onValueChange={() => form.weightUnit === 'kg' ? setForm(prev => ({...prev, weightUnit: 'lb'})) : setForm(prev => ({...prev, weightUnit: 'kg'}))}
                    ios_backgroundColor='rgb(0, 255, 0)'
                />
                <Text>LBs</Text>
            </View>
            <Text>Weight:</Text>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <TextInput 
                    value={form.weight}
                    onChangeText={(s: string) => setForm(prev => ({...prev, weight: s}))}
                    onBlur={() => {
                        const errorCheck = validateOptionalNumericField(form.weight, 'Weight');
                        setErrors(prev => {
                            if (errorCheck.isInvalid) return {...prev, weight: errorCheck.error};
                            const {weight, ...rest} = prev;
                            return rest;
                        })
                    }}
                    keyboardType='number-pad'
                    maxLength={3}
                />
                <Text>{form.weightUnit.toUpperCase() + 's'}</Text>
                {
                    errors.weight && <Text>{errors.weight}</Text>
                }
            </View>
            <Text>Starting PRs</Text>
            <Text>Bench Press PR</Text>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <TextInput 
                    value={form.benchPr}
                    onChangeText={(s: string) => setForm({...form, benchPr: s})}
                    onBlur={() => {
                        const errorCheck = validateOptionalNumericField(form.benchPr, 'Bench PR');
                        setErrors(prev => {
                            if (errorCheck.isInvalid) return {...prev, benchPr: errorCheck.error};
                            const {benchPr, ...rest} = prev;
                            return rest;
                        })
                    }}
                    maxLength={7}
                    inputMode='decimal'
                    keyboardType='decimal-pad'
                />
                <Text>{form.weightUnit.toUpperCase() + 's'}</Text>
                {
                    errors.benchPr && <Text>{errors.benchPr}</Text>
                }
            </View>
            <Text>Back Squat PR</Text>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <TextInput 
                    value={form.squatPr}
                    onChangeText={(s: string) => setForm({...form, squatPr: s})}
                    onBlur={() => {
                        const errorCheck = validateOptionalNumericField(form.squatPr, 'Squat PR');
                        setErrors(prev => {
                            if (errorCheck.isInvalid) return {...prev, squatPr: errorCheck.error};
                            const {squatPr, ...rest} = prev;
                            return rest;
                        })
                    }}
                    maxLength={7}
                    inputMode='decimal'
                    keyboardType='decimal-pad'
                />
                <Text>{form.weightUnit.toUpperCase() + 's'}</Text>
                {
                    errors.squatPr && <Text>{errors.squatPr}</Text>
                }
            </View>
            <Text>Deadlift PR</Text>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <TextInput 
                    value={form.deadPr}
                    onChangeText={(s: string) => setForm({...form, deadPr: s})}
                    onBlur={() => {
                        const errorCheck = validateOptionalNumericField(form.deadPr, 'Deadlift PR');
                        setErrors(prev => {
                            if (errorCheck.isInvalid) return {...prev, deadPr: errorCheck.error};
                            const {deadPr, ...rest} = prev;
                            return rest;
                        })
                    }}
                    maxLength={7}
                    inputMode='decimal'
                    keyboardType='decimal-pad'
                />
                <Text>{form.weightUnit.toUpperCase() + 's'}</Text>
                {
                    errors.deadPr && <Text>{errors.deadPr}</Text>
                }
            </View>
            <Text>Password *</Text>
            <TextInput 
                value={form.password}
                onChangeText={(s: string) => setForm({...form, password: s})}
                onBlur={() => {
                    const errorCheck = validateRequiredField(form.password, 'Password');
                    setErrors(prev => {
                        if (errorCheck.isInvalid) return {...prev, password: errorCheck.error};
                        const {password, ...rest} = prev;
                        return rest;
                    })
                }}
                textContentType='password'
                secureTextEntry={true}
                autoCapitalize='none'
                autoCorrect={false}
            />
            {
                errors.password && <Text>{errors.password}</Text>
            }
            <Text>Confirm Password *</Text>
            <TextInput
                value={form.confirmPassword}
                onChangeText={(s: string) => setForm({...form, confirmPassword: s})}
                onBlur={() => {
                    const errorCheck = validatePasswordsMatch(form.password, form.confirmPassword);
                    setErrors(prev => {
                        if (errorCheck.isInvalid) return {...prev, confirmPassword: errorCheck.error};
                        const {confirmPassword, ...rest} = prev;
                        return rest;
                    })
                }}
                textContentType='password'
                secureTextEntry={true}
                autoCapitalize='none'
                autoCorrect={false}
            />
            {
                errors.confirmPassword && <Text>{errors.confirmPassword}</Text>
            }
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <Pressable onPress={handleCancel}>
                    <Text>Cancel</Text>
                </Pressable>
                <Pressable 
                    onPress={handleSubmit}
                    disabled={Object.keys(errors).length > 0}
                >
                    <Text style={Object.keys(errors).length > 0 && {color: 'red'} }>Sign Up</Text>
                </Pressable>
            </View>
        </View>
    )
}