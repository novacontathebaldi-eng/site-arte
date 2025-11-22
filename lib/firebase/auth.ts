
import firebase from 'firebase/compat/app';
import { auth } from './config';
import { User } from 'firebase/auth';

// Re-export types if needed, though typically handled by compat
// Note: We use firebase.auth.* for providers in compat mode

export const signInWithGoogle = async () => {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, pass: string) => {
  try {
    const result = await auth.signInWithEmailAndPassword(email, pass);
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

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user as User);
    });
  });
};
