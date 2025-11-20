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
import { doc, setDoc, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserDocument } from '../firebase-types';
import { LanguageCode } from '../firebase-types';

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
    await signOut(auth);
  };

  const signupWithEmail = async (name: string, email: string, pass: string): Promise<User> => {
    const { user } = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(user, { displayName: name });
    await createUserProfileDocument(user, { displayName: name });
    const userSnap = await getDoc(doc(db, 'users', user.uid));
    setUserDoc(userSnap.exists() ? userSnap.data() as UserDocument : null);
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
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      setUserDoc(userSnap.exists() ? userSnap.data() as UserDocument : null);
      return user;
  };

  const sendPasswordReset = async(email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  }

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);


  const value = { user, userDoc, loading, logout, signupWithEmail, loginWithEmail, loginWithGoogle, sendPasswordReset, isAuthModalOpen, openAuthModal, closeAuthModal };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};