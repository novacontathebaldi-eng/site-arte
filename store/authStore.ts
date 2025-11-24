import { create } from 'zustand';
import { User } from '../types';
import { signInWithGoogle, logout as firebaseLogout, getCurrentUser } from '../lib/firebase/auth';
import { auth } from '../lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  loginWithGoogle: async () => {
    set({ isLoading: true });
    try {
      // signInWithGoogle from lib now handles Firestore creation
      const firebaseUser = await signInWithGoogle();
      
      if (firebaseUser) {
         const appUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL || undefined,
            role: 'user'
         };
         set({ user: appUser, isAuthenticated: true, isLoading: false });
      }
    } catch (error) {
      console.error('Login failed:', error);
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await firebaseLogout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Logout failed:', error);
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  checkAuth: async () => {
    set({ isLoading: true });
    // Subscribe to Auth Changes for robustness against refreshes
    onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
             const appUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || 'User',
                photoURL: firebaseUser.photoURL || undefined,
                role: 'user'
             };
             set({ user: appUser, isAuthenticated: true, isLoading: false });
        } else {
             set({ user: null, isAuthenticated: false, isLoading: false });
        }
    });
  }
}));