import React, { createContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { supabase } from '../lib/supabase';
// Usa a sintaxe do Firebase v8 para corresponder à dependência instalada
// FIX: Switched to Firebase v9 compat imports to provide v8 syntax and types.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { UserData, UserPreferences } from '../types';

// Tipos
type FirebaseUser = firebase.User;

interface AuthState {
  user: UserData | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  refetchUser: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

type AuthAction =
  | { type: 'AUTH_STATE_CHANGED'; payload: UserData | null }
  | { type: 'LOADING' }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'PROFILE_UPDATED'; payload: UserData };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'AUTH_STATE_CHANGED':
      return { loading: false, user: action.payload, error: null };
    case 'AUTH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'PROFILE_UPDATED':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

// Contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provedor
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialState: AuthState = { user: null, loading: true, error: null };
  const [state, dispatch] = useReducer(authReducer, initialState);

  const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<UserData> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', firebaseUser.uid)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignora erro de "não encontrado"

    return { ...firebaseUser.toJSON() as any, profile: profile || null };
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await fetchUserProfile(firebaseUser);
          dispatch({ type: 'AUTH_STATE_CHANGED', payload: userData });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          dispatch({ type: 'AUTH_STATE_CHANGED', payload: null });
        }
      } else {
        dispatch({ type: 'AUTH_STATE_CHANGED', payload: null });
      }
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  const login = async (email: string, password: string, rememberMe = true) => {
    dispatch({ type: 'LOADING' });
    try {
      // Define a persistência da sessão de acordo com a sintaxe da v8
      const persistence = rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
      await auth.setPersistence(persistence);
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };
  
  const googleLogin = async () => {
      dispatch({ type: 'LOADING' });
      try {
          const result = await auth.signInWithPopup(googleProvider);
          if (result.user && result.additionalUserInfo?.isNewUser) {
              const { user } = result;
              await supabase.from('profiles').insert({
                  id: user.uid,
                  display_name: user.displayName,
                  email: user.email,
                  photo_url: user.photoURL,
              });
          }
      } catch (error: any) {
          dispatch({ type: 'AUTH_ERROR', payload: error.message });
          throw error;
      }
  };

  const register = async (email: string, password: string, fullName: string) => {
    dispatch({ type: 'LOADING' });
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      if (!user) throw new Error("User creation failed.");
      
      await user.updateProfile({ displayName: fullName });
      
      const { error: profileError } = await supabase.from('profiles').insert({
          id: user.uid,
          display_name: fullName,
          email: user.email,
      });

      if (profileError) throw profileError;

    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error: any) {
      console.error("Logout error:", error);
    }
  };

  const forgotPassword = async (email: string) => {
    dispatch({ type: 'CLEAR_ERROR' });
    try {
      await auth.sendPasswordResetEmail(email);
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const refetchUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
        await firebaseUser.reload();
        const freshFirebaseUser = auth.currentUser; // Get the fresh instance
        if(freshFirebaseUser){
            const userData = await fetchUserProfile(freshFirebaseUser);
            dispatch({ type: 'PROFILE_UPDATED', payload: userData });
        }
    }
  }, [fetchUserProfile]);

  const updateUserPreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
    if (state.user?.profile) {
        const { error } = await supabase
            .from('profiles')
            .update({ preferences })
            // FIX: Property 'id' does not exist on type 'UserData'. Use 'uid' instead.
            .eq('id', state.user.uid);
        if (error) throw error;
        await refetchUser();
    }
  }, [state.user, refetchUser]);

  const value = { state, login, googleLogin, register, logout, forgotPassword, refetchUser, updateUserPreferences };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};