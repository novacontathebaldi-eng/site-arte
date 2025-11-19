import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {
  Auth,
  User,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserDocument } from '../firebase-types';
import { LanguageCode } from '../firebase-types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  signupWithEmail: (name: string, email: string, pass: string) => Promise<User>;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  sendPasswordReset: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const createUserProfileDocument = async (user: User, additionalData?: Record<string, any>) => {
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const { email, displayName, photoURL } = user;
      const createdAt = serverTimestamp();
      
      const newUser: UserDocument = {
        uid: user.uid,
        email: email!,
        displayName: displayName || additionalData?.displayName || 'New User',
        photoURL: photoURL,
        phoneNumber: null,
        role: 'customer',
        language: 'fr' as LanguageCode,
        createdAt: createdAt as any, // Firestore will convert this
        lastLogin: createdAt as any, // Firestore will convert this
        emailVerified: user.emailVerified,
        preferences: {
          newsletter: false,
          orderNotifications: true,
          promotionalEmails: false,
        },
        stats: {
          totalOrders: 0,
          totalSpent: 0,
          wishlistCount: 0,
        },
        ...additionalData
      };

      try {
        await setDoc(userRef, newUser);
      } catch (error) {
        console.error("Error creating user document", error);
      }
    }
    return userRef;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await createUserProfileDocument(user);
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const logout = async () => {
    await signOut(auth);
  };

  const signupWithEmail = async (name: string, email: string, pass: string): Promise<User> => {
    const { user } = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(user, { displayName: name });
    await createUserProfileDocument(user, { displayName: name });
    return user;
  };
  
  const loginWithEmail = async (email: string, pass: string): Promise<User> => {
     const { user } = await signInWithEmailAndPassword(auth, email, pass);
     return user;
  };
  
  const loginWithGoogle = async (): Promise<User> => {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      await createUserProfileDocument(user);
      return user;
  };

  const sendPasswordReset = async(email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  }

  const value = { user, loading, logout, signupWithEmail, loginWithEmail, loginWithGoogle, sendPasswordReset };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
