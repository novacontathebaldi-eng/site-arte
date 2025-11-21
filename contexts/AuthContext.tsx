import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase/config';
import { loginWithEmail, loginWithGoogle, signupWithEmail, logoutUser, resetPassword } from '../lib/firebase/auth';
import { UserDocument, LanguageCode } from '../firebase-types';

interface AuthContextType {
  user: User | null;
  userDoc: UserDocument | null;
  loading: boolean;
  logout: () => Promise<void>;
  signupWithEmail: (name: string, email: string, pass: string) => Promise<User>;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  sendPasswordReset: (email: string) => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
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
        createdAt: createdAt as any, 
        lastLogin: createdAt as any,
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
    } else {
        try {
            await updateDoc(userRef, { lastLogin: serverTimestamp() });
        } catch (error) {
            console.error("Error updating last login", error);
        }
    }
    return userRef;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        // Optimization: Only fetch doc if we don't have it or on hard refresh
        await createUserProfileDocument(userAuth);
        const userRef = doc(db, 'users', userAuth.uid);
        const userSnap = await getDoc(userRef);

        setUser(userAuth);
        setUserDoc(userSnap.exists() ? userSnap.data() as UserDocument : null);
      } else {
        setUser(null);
        setUserDoc(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const logout = async () => {
    await logoutUser();
  };

  const handleSignupWithEmail = async (name: string, email: string, pass: string): Promise<User> => {
    const user = await signupWithEmail(email, pass, name);
    await createUserProfileDocument(user, { displayName: name });
    const userSnap = await getDoc(doc(db, 'users', user.uid));
    setUserDoc(userSnap.exists() ? userSnap.data() as UserDocument : null);
    return user;
  };
  
  const handleLoginWithGoogle = async (): Promise<User> => {
      const user = await loginWithGoogle();
      await createUserProfileDocument(user);
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      setUserDoc(userSnap.exists() ? userSnap.data() as UserDocument : null);
      return user;
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const value = { 
    user, 
    userDoc, 
    loading, 
    logout, 
    signupWithEmail: handleSignupWithEmail, 
    loginWithEmail, 
    loginWithGoogle: handleLoginWithGoogle, 
    sendPasswordReset: resetPassword, 
    isAuthModalOpen, 
    openAuthModal, 
    closeAuthModal 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};