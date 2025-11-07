import React, { createContext, useCallback, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { syncUserToSupabase } from '../lib/syncUserToSupabase';
import { AuthContextType, UserData, Profile, UserPreferences } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppUser = useCallback(async (firebaseUser: FirebaseUser): Promise<UserData | null> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', firebaseUser.uid)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching Supabase profile:', error);
      return null;
    }

    const adaptedUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email || undefined,
      user_metadata: {
        display_name: firebaseUser.displayName,
        avatar_url: firebaseUser.photoURL,
      },
      created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
      email_confirmed_at: firebaseUser.emailVerified ? new Date().toISOString() : undefined,
    };
    
    return { ...adaptedUser, profile: profile as Profile } as UserData;
  }, []);

  const refetchUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
        setLoading(true);
        await firebaseUser.reload(); // Get latest user data from Firebase
        const appUser = await fetchAppUser(firebaseUser);
        setUser(appUser);
        setLoading(false);
    }
  }, [fetchAppUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
            await syncUserToSupabase(firebaseUser);
            const appUser = await fetchAppUser(firebaseUser);
            setUser(appUser);
        } catch (e) {
            console.error("Auth context setup failed:", e);
            setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchAppUser]);

  const updateUserPreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
    if (!user) throw new Error("User not authenticated.");
    
    const currentPreferences = user.profile?.preferences || { orderUpdates: true, promotions: false, newArtworks: true };
    const updatedPreferences = { ...currentPreferences, ...preferences };

    const { error } = await supabase
      .from('profiles')
      .update({ preferences: updatedPreferences, updated_at: new Date().toISOString() })
      .eq('id', user.id);
      
    if (error) throw error;
    await refetchUser();
  }, [user, refetchUser]);
  
  const value: AuthContextType = { user, loading, refetchUser, updateUserPreferences };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
