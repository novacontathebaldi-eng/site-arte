import React, { createContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { syncUserToSupabase } from '../lib/syncUserToSupabase';
import { AuthContextType, UserData, UserPreferences, Profile } from '../types';

// Create context with a default value that matches the full AuthContextType from types.ts
export const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    refetchUser: async () => {},
    updateUserPreferences: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchFullUserData = useCallback(async (firebaseUser: FirebaseUser): Promise<UserData | null> => {
        try {
            // Sync first to ensure the profile exists in Supabase
            await syncUserToSupabase(firebaseUser);

            // Fetch the profile from Supabase
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', firebaseUser.uid)
                .single<Profile>();

            if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
                console.error('Error fetching Supabase profile:', error);
            }
            
            // Construct a UserData object that matches the type definition
            // This merges Firebase Auth info with Supabase profile info
            const userData: UserData = {
                // Spread the original firebase user for any other properties that might be used
                ...(firebaseUser as any),
                // These properties are part of the `User` type in types.ts, mapped from FirebaseUser
                id: firebaseUser.uid,
                email: firebaseUser.email || undefined,
                created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
                // Best guess for email_confirmed_at based on available data
                email_confirmed_at: firebaseUser.emailVerified ? (profile?.updated_at || new Date().toISOString()) : undefined,
                // Create a synthetic user_metadata for components that use it as a fallback
                user_metadata: {
                    display_name: firebaseUser.displayName,
                    avatar_url: firebaseUser.photoURL,
                },
                 // This is the `profile` property of UserData
                profile: profile || null,
            };

            return userData;
        } catch (error) {
            console.error("Error fetching full user data:", error);
            return null;
        }
    }, []);

    const refetchUser = useCallback(async () => {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
            setLoading(true);
            const fullUser = await fetchFullUserData(firebaseUser);
            setUser(fullUser);
            setLoading(false);
        }
    }, [fetchFullUserData]);

    const updateUserPreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
        if (!user || !user.profile) throw new Error("User not logged in or profile not found");
        
        const { error } = await supabase
            .from('profiles')
            .update({ 
                preferences: { ...user.profile.preferences, ...preferences },
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
        
        if (error) {
            console.error("Error updating preferences:", error);
            throw error;
        }
        
        await refetchUser(); // Refresh user data after update
    }, [user, refetchUser]);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const fullUser = await fetchFullUserData(firebaseUser);
                setUser(fullUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [fetchFullUserData]);

    return (
        <AuthContext.Provider value={{ user, loading, refetchUser, updateUserPreferences }}>
            {children}
        </AuthContext.Provider>
    );
};
