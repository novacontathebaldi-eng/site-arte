import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  updateProfile,
  updatePassword,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  phoneNumber?: string;
  language?: string;
}

const createUserFromFirebaseUser = async (firebaseUser: any): Promise<User> => {
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  const userData = userDoc.exists() ? userDoc.data() : {};

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || userData.displayName || '',
    photoURL: firebaseUser.photoURL || userData.photoURL,
    phoneNumber: firebaseUser.phoneNumber || userData.phoneNumber,
    role: userData.role || 'customer',
    language: userData.language || 'fr',
    createdAt: userData.createdAt?.toDate() || new Date(),
    lastLogin: new Date(),
    emailVerified: firebaseUser.emailVerified,
    preferences: userData.preferences || {
      newsletter: false,
      orderNotifications: true,
      promotionalEmails: false,
      currency: 'EUR'
    },
    stats: userData.stats || {
      totalOrders: 0,
      totalSpent: 0,
      wishlistCount: 0
    }
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      initializeAuth: async () => {
        set({ isLoading: true });
        
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const user = await createUserFromFirebaseUser(firebaseUser);
              set({ user, isAuthenticated: true, isLoading: false });
              
              // Update last login
              await updateDoc(doc(db, 'users', user.uid), {
                lastLogin: new Date()
              });
            } catch (error) {
              console.error('Error initializing auth:', error);
              set({ user: null, isAuthenticated: false, isLoading: false });
            }
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        });

        return unsubscribe;
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = await createUserFromFirebaseUser(userCredential.user);
          set({ user, isAuthenticated: true, isLoading: false });
          
          // Update last login
          await updateDoc(doc(db, 'users', user.uid), {
            lastLogin: new Date()
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const provider = new GoogleAuthProvider();
          const userCredential = await signInWithPopup(auth, provider);
          const firebaseUser = userCredential.user;
          
          // Check if user exists in Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (!userDoc.exists()) {
            // Create new user document
            const newUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL,
              phoneNumber: firebaseUser.phoneNumber,
              role: 'customer',
              language: 'fr',
              createdAt: new Date(),
              lastLogin: new Date(),
              emailVerified: firebaseUser.emailVerified,
              preferences: {
                newsletter: false,
                orderNotifications: true,
                promotionalEmails: false,
                currency: 'EUR'
              },
              stats: {
                totalOrders: 0,
                totalSpent: 0,
                wishlistCount: 0
              }
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          }
          
          const user = await createUserFromFirebaseUser(firebaseUser);
          set({ user, isAuthenticated: true, isLoading: false });
          
          // Update last login
          await updateDoc(doc(db, 'users', user.uid), {
            lastLogin: new Date()
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true });
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
          const firebaseUser = userCredential.user;
          
          // Update profile
          await updateProfile(firebaseUser, {
            displayName: userData.displayName
          });
          
          // Create user document
          const newUser = {
            uid: firebaseUser.uid,
            email: userData.email,
            displayName: userData.displayName,
            photoURL: null,
            phoneNumber: userData.phoneNumber || null,
            role: 'customer',
            language: userData.language || 'fr',
            createdAt: new Date(),
            lastLogin: new Date(),
            emailVerified: false,
            preferences: {
              newsletter: false,
              orderNotifications: true,
              promotionalEmails: false,
              currency: 'EUR'
            },
            stats: {
              totalOrders: 0,
              totalSpent: 0,
              wishlistCount: 0
            }
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          
          // Send verification email
          await sendEmailVerification(firebaseUser);
          
          const user = await createUserFromFirebaseUser(firebaseUser);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await signOut(auth);
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      resetPassword: async (email: string) => {
        await sendPasswordResetEmail(auth, email);
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get();
        if (!user) throw new Error('No user logged in');
        
        try {
          // Update Firebase Auth profile
          if (data.displayName || data.photoURL) {
            await updateProfile(auth.currentUser!, {
              displayName: data.displayName || user.displayName,
              photoURL: data.photoURL || user.photoURL
            });
          }
          
          // Update Firestore document
          await updateDoc(doc(db, 'users', user.uid), {
            ...data,
            updatedAt: new Date()
          });
          
          // Update local state
          const updatedUser = await createUserFromFirebaseUser(auth.currentUser);
          set({ user: updatedUser });
        } catch (error) {
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        const { user } = get();
        if (!user) throw new Error('No user logged in');
        
        try {
          // Re-authenticate user
          const credential = await signInWithEmailAndPassword(auth, user.email, currentPassword);
          
          // Update password
          await updatePassword(credential.user, newPassword);
        } catch (error) {
          throw error;
        }
      },

      sendVerificationEmail: async () => {
        const { user } = get();
        if (!user) throw new Error('No user logged in');
        
        if (auth.currentUser) {
          await sendEmailVerification(auth.currentUser);
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);