import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children } : {children: React.ReactNode}) {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

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