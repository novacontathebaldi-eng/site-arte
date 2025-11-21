import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  User,
  AuthError
} from 'firebase/auth';
import { auth } from './config';

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const signupWithEmail = async (email: string, pass: string, displayName?: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName) {
      await firebaseUpdateProfile(result.user, { displayName });
    }
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (user: User, data: { displayName?: string; photoURL?: string }) => {
  try {
    await firebaseUpdateProfile(user, data);
  } catch (error) {
    throw error;
  }
};