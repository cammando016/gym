import { SignupPayload, LogonFormValues } from "@/types/user"
import AsyncStorage from "@react-native-async-storage/async-storage";

export const signup = async (details: SignupPayload) => {
    const res = await fetch(`http://localhost:3000/api/signup`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(details),
    });
    return await res.json();
};

export const logon = async (details: LogonFormValues) => {
    const res = await fetch(`http://localhost:3000/api/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(details),
    })
    const response = await res.json();

    if (res.ok && response.token) await AsyncStorage.setItem('token', response.token);

    return {
        status: res.status,
        ...response
    }
};

export const getSplits = async (username : string) => {
    if (!username) throw new Error('Username not found');
    const res = await fetch(`http://localhost:3000/api/users/${encodeURIComponent(username)}/splits`);
    return res.json();
}