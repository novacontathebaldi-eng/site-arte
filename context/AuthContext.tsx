import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { UserData, AuthContextType, Profile, UserPreferences, User } from '../types';

export const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    refetchUser: async () => {},
    updateUserPreferences: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = useCallback(async (supabaseUser: User): Promise<UserData | null> => {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = 0 rows returned
            console.error('Error fetching profile:', error);
            return { ...supabaseUser, profile: null };
        }
        
        return { ...supabaseUser, profile: profile as Profile };
    }, []);

    useEffect(() => {
        setLoading(true);
        // FIX: In Supabase v2, onAuthStateChange returns an object with a `data` property containing the subscription.
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const userData = await fetchUserProfile(session.user as User);
                setUser(userData);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        // FIX: In Supabase v2, unsubscribe is called on the subscription object.
        return () => authListener?.subscription.unsubscribe();
    }, [fetchUserProfile]);
    
    const refetchUser = useCallback(async () => {
        // FIX: In Supabase v2, `getUser` is async and returns the user in a data object.
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser) {
            setLoading(true);
            const userData = await fetchUserProfile(supabaseUser as User);
            setUser(userData);
            setLoading(false);
        }
    }, [fetchUserProfile]);

    const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
        if (user?.profile) {
            const updatedPreferences = { ...user.profile.preferences, ...preferences };
            const { error } = await supabase
                .from('profiles')
                .update({ preferences: updatedPreferences, updated_at: new Date().toISOString() })
                .eq('id', user.id);

            if (error) {
                console.error("Error updating preferences:", error);
                throw error;
            }
            await refetchUser();
        }
    };

    const value = { user, loading, refetchUser, updateUserPreferences };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
