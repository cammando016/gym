import { FormValues } from "@/types/user"

export const signup = async (details: FormValues) => {
    const res = await fetch(`http://localhost:3000/api/signup`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(details),
    });
    return await res.json();
};

export const logon = async (details: any) => {
    const res = await fetch(`http://localhost:3000/api/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(details),
    })
    const response = await res.json();

    return {
        status: res.status,
        ...response
    }
};