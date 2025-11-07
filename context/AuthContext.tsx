import React, { createContext, useCallback, useEffect, useState } from 'react';
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthContextType, UserData, Profile, UserPreferences } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<UserData> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is ok for new users
      console.warn('Could not fetch user profile.', error.message);
      return { ...supabaseUser, profile: null };
    }

    return { ...supabaseUser, profile: profile as Profile };
  }, []);
  
  const refetchUser = useCallback(async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        const userData = await fetchUserProfile(supabaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
  }, [fetchUserProfile]);


  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userData = await fetchUserProfile(session.user);
        setUser(userData);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          const userData = await fetchUserProfile(session.user);
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);

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
