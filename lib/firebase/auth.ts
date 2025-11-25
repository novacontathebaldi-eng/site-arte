import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { registerClientToBrevo } from '../../app/actions/registerClient';

export const signInWithGoogle = async () => {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    
    if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            // New User: Create Profile + Register to Brevo
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: 'user',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                preferences: {
                    language: 'fr',
                    theme: 'system'
                }
            };
            await setDoc(userRef, userData);
            
            // Server Action for Email Marketing
            if (user.email && user.displayName) {
                await registerClientToBrevo(user.email, user.displayName);
            }
        } else {
            // Existing User: Update Login Time
            await updateDoc(userRef, {
                lastLogin: new Date().toISOString()
            });
        }
    }
    return user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, pass: string) => {
  try {
    const result = await auth.signInWithEmailAndPassword(email, pass);
    // Update last login
    if (result.user) {
        const userRef = doc(db, 'users', result.user.uid);
        // Using setDoc with merge to ensure doc exists or update it safely
        await setDoc(userRef, {
            lastLogin: new Date().toISOString()
        }, { merge: true });
    }
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const signUpWithEmail = async (email: string, pass: string, displayName: string) => {
  try {
    const result = await auth.createUserWithEmailAndPassword(email, pass);
    if (result.user) {
      await result.user.updateProfile({ displayName });
      
      // Create Firestore Doc manually for Email Auth
      await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: email,
          displayName: displayName,
          role: 'user',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
      });
    }
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await auth.sendPasswordResetEmail(email);
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Error signing out", error);
  }
};

export const getCurrentUser = (): Promise<firebase.User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};