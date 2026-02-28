import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, User } from '@/types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children } : {children: React.ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const loadUser = async() => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                //Check if user already exists in local storage
                const userString = await AsyncStorage.getItem('user');

                if (userString) {
                    const storedUser: User = JSON.parse(userString);
                    setUser(storedUser);
                } else {
                    await AsyncStorage.removeItem('token');
                    setUser(null);
                    setIsLoggedIn(false);
                }

                setIsLoggedIn(true);
            } catch (error) {
                console.error('Authentication error:', error);
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('user');
                setUser(null);
                setIsLoggedIn(false);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (token: string, userData: User) => {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        setIsLoggedIn(true);
    }

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');

        setUser(null);
        setIsLoggedIn(false);
    }

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
}