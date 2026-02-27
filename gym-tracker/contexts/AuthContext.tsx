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

                //Set user to stored user if found, or attempt to decode user to set if not
                if (userString) {
                    const storedUser: User = JSON.parse(userString);
                    setUser(storedUser);
                } else {
                    const decodedUser = jwtDecode<User>(token);
                    setUser(decodedUser);
                    await AsyncStorage.setItem('user', JSON.stringify(decodedUser));
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
    }, [])

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                isLoading,
                login: () => setIsLoggedIn(true),
                logout: () => setIsLoggedIn(false),
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}



export const useAuth = () => useContext(AuthContext);