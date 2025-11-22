import { create } from 'zustand';
import { User } from '../types';
import { signInWithGoogle, logout as firebaseLogout, getCurrentUser } from '../lib/firebase/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async () => {
    set({ isLoading: true });
    try {
      const user = await signInWithGoogle();
      // Map Firebase user to our User type
      const appUser: User = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'User',
        photoURL: user.photoURL || undefined,
        role: 'user' // Default role
      };
      set({ user: appUser, isAuthenticated: true, isLoading: false });
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
    try {
      const user = await getCurrentUser();
      if (user) {
         const appUser: User = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'User',
            photoURL: user.photoURL || undefined,
            role: 'user'
          };
        set({ user: appUser, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  }
}));
