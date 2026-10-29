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

export const changePassword = async (oldPassword: string, newPassword: string) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/auth/change-password`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({oldPassword, newPassword}),
    });

    if (res.ok) return { ok: true as const };

    const body = await res.json().catch(() => null);
    return {
        ok: false as const,
        status: res.status,
        error: body?.error ?? 'Failed to change password'
    }
}

export const changeRecovery = async (password: string, recQuestion: string, recAnswer: string) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`http://localhost:3000/api/auth/change-recovery`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({password, recQuestion, recAnswer})
    });

    if (res.ok) return { ok: true as const }

    const body = await res.json().catch(() => null);
    return {
        ok: false as const,
        status: res.status,
        error: body?.error ?? 'Failed to update recovery question'
    }
}

export const getSplits = async (username : string) => {
    if (!username) throw new Error('Username not found');
    const res = await fetch(`http://localhost:3000/api/users/${encodeURIComponent(username)}/splits`);
    return res.json();
}