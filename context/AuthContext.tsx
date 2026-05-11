'use client'

import { getUser } from "@/actions/auth/get-user";
import { User } from "@/interfaces/user";
import { createClient } from "@/lib/supabase/client";
import { createContext, useContext, useEffect, useState } from "react";

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    getUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getUserData = async () => {
        setIsLoading(true);
        try {
            const userData = await getUser();
            if (userData) {
                setUser(userData);
            }
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setIsLoading(false);
        }
    };

    const AuthState = async () => {

        const supabase = await createClient()

        supabase.auth.onAuthStateChange((event, session) => {

            const eventType = [
                'INITIAL_SESSION',
                'SIGNED_IN',
                'SIGNED_OUT',
                'PASSWORD_RECOVERY',
                'TOKEN_REFRESHED',
                'USER_UPDATED'
            ]

            if (eventType.includes(event)) {
                if (session) {
                    getUserData();
                } else {
                    setUser(null);
                }
            }
        })

    }

    useEffect(() => {
        AuthState();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, getUserData }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
