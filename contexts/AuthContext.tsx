import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logOut: () => Promise<void>;
  signUp: (name: string, email: string, pass: string) => Promise<User>;
  logIn: (email: string, pass: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch our custom user profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ ...firebaseUser, ...userDoc.data() });
        } else {
          // This case might happen with social logins if profile creation failed
           const newUserProfile: UserProfile = {
            ...firebaseUser,
            role: 'customer',
            createdAt: new Date(),
            lastLogin: new Date(),
           };
           await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName,
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL,
                role: 'customer',
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            });
           setUser(newUserProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logOut = async () => {
    await signOut(auth);
  };
  
  const signUp = async (name: string, email: string, pass: string) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      // Create user profile in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        displayName: name,
        email: email,
        photoURL: null,
        role: 'customer',
        language: 'fr',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        emailVerified: firebaseUser.emailVerified,
        preferences: {
            newsletter: true,
            orderNotifications: true,
        },
        stats: {
            totalOrders: 0,
            totalSpent: 0,
            wishlistCount: 0
        }
      });
      
      return firebaseUser;
  };
  
  const logIn = async (email: string, pass: string) => {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
      return userCredential.user;
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
       await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        role: 'customer',
        language: 'fr',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        emailVerified: firebaseUser.emailVerified,
         preferences: {
            newsletter: true,
            orderNotifications: true,
        },
        stats: {
            totalOrders: 0,
            totalSpent: 0,
            wishlistCount: 0
        }
      });
    } else {
        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
    return firebaseUser;
  }

  const value = {
    user,
    loading,
    logOut,
    signUp,
    logIn,
    signInWithGoogle
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
