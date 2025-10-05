import { FormValues } from '@/types/user';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';

export default function AccountForm() {
    const [form, setForm] = useState<FormValues>({
        name: '',
        birthDay: 1,
        birthMonth: 1,
        birthYear: 2000,
        username: '',
        weight: 0,
        weightUnit: 'kg',
        benchPr: 0,
        squatPr: 0,
        deadPr: 0,
        password: '',
        confirmPassword: ''
    });

    const router = useRouter();

    const handleCancel = () => router.back();
    const handleSubmit = () => alert(JSON.stringify(form));

    return (
        <View>
            <Text>Name:</Text>
            <TextInput 
                placeholder='Your Name'
                value={form.name}
                onChangeText={(s: string) => setForm({...form, name: s})}
            />
            <Text>Username:</Text>
            <TextInput 
                placeholder='Your Username'
                value={form.username}
                onChangeText={(s: string) => setForm({...form, username: s})}
            />
            <Text>Birthday:</Text>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text>Day: </Text>
                <TextInput 
                    value={form.birthDay}
                    onChangeText={(n: number) => setForm({...form, birthDay: n})}
                    keyboardType='number-pad'
                />
                <Text>Month: </Text>
                <TextInput 
                    value={form.birthMonth}
                    onChangeText={(n: number) => setForm({...form, birthMonth: n})}
                    keyboardType='number-pad'
                />
                <Text>Year: </Text>
                <TextInput 
                    value={form.birthYear}
                    onChangeText={(n: number) => setForm({...form, birthYear: n})}
                    keyboardType='number-pad'
                />
            </View>
            <Text>Preferred Weight Unit:</Text>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text>KGs</Text>
                <Switch 
                    value={form.weightUnit === 'kg' ? false : true}
                    onValueChange={() => form.weightUnit === 'kg' ? setForm({...form, weightUnit: 'lb'}) : setForm({...form, weightUnit: 'kg'})}
                    ios_backgroundColor='rgb(0, 255, 0)'
                />
                <Text>LBs</Text>
            </View>
            <Text>Weight:</Text>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <TextInput 
                    value={form.weight}
                    onChangeText={(n: number) => setForm({...form, weight: n})}
                    keyboardType='number-pad'
                />
                <Text>{form.weightUnit.toUpperCase() + 's'}</Text>
            </View>
            <Text>Starting PRs</Text>
            <Text>Bench Press PR:</Text>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <TextInput 
                    value={form.benchPr}
                    onChangeText={(n: number) => setForm({...form, benchPr: n})}
                />
                <Text>{form.weightUnit.toUpperCase() + 's'}</Text>
            </View>
            <Text>Squat PR:</Text>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <TextInput 
                    value={form.squatPr}
                    onChangeText={(n: number) => setForm({...form, squatPr: n})}
                />
                <Text>{form.weightUnit.toUpperCase() + 's'}</Text>
            </View>
            <Text>Deadlift PR:</Text>
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <TextInput 
                    value={form.deadPr}
                    onChangeText={(n: number) => setForm({...form, deadPr: n})}
                />
                <Text>{form.weightUnit.toUpperCase() + 's'}</Text>
            </View>
            <Text>Password</Text>
            <TextInput 
                value={form.password}
                onChangeText={(s: string) => setForm({...form, password: s})}
                textContentType='password'
            />
            <Text>Confirm Password</Text>
            <TextInput
                value={form.confirmPassword}
                onChangeText={(s: string) => setForm({...form, confirmPassword: s})}
            />
            <View style={{display: 'flex', flexDirection: 'row'}}>
                <Pressable onPress={handleCancel}>
                    <Text>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSubmit}>
                    <Text>Sign Up</Text>
                </Pressable>
            </View>
        </View>
    )
}