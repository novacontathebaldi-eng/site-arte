import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    User, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../hooks/useTranslation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (name:string, email: string, pass: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createUserProfileDocument = async (user: User, additionalData?: {displayName?: string}) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        const { email, displayName, photoURL, emailVerified } = user;
        const createdAt = serverTimestamp();
        try {
            await setDoc(userRef, {
                uid: user.uid,
                displayName: additionalData?.displayName || displayName,
                email,
                photoURL,
                emailVerified,
                createdAt,
                lastLogin: createdAt, // Set lastLogin on creation
                language: 'fr', // Default language
                role: 'user',
                stats: {
                    ordersCount: 0,
                    spentCents: 0,
                },
            });
        } catch(error) {
            console.error("Error creating user document", error);
        }
    } else {
        // Update last login time for existing users
        try {
            await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
        } catch (error) {
            console.error("Error updating last login", error);
        }
    }
    return userRef;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleAuthError = (error: any) => {
        console.error(error.code, error.message);
        switch (error.code) {
            case 'auth/weak-password':
                toast.error(t('auth_error_weak_password'));
                break;
            case 'auth/email-already-in-use':
                toast.error(t('auth_error_email_exists'));
                break;
            case 'auth/invalid-credential':
                 toast.error(t('auth_error_invalid_credentials'));
                break;
            default:
                toast.error(t('auth_error_generic'));
                break;
        }
    };

    const register = async (name: string, email: string, pass: string) => {
        try {
            const { user: createdUser } = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(createdUser, { displayName: name });
            await createUserProfileDocument(createdUser, { displayName: name });
            // Send verification email without blocking the user flow
            sendEmailVerification(createdUser).catch(err => console.error("Email verification error:", err));
            setUser(createdUser); // update state immediately
            toast.success(t('registered_successfully'));
            navigate('/dashboard');
        } catch (error) {
            handleAuthError(error);
        }
    };

    const login = async (email: string, pass: string) => {
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, pass);
            await createUserProfileDocument(user); // This will update lastLogin
            toast.success(t('logged_in_successfully'));
            navigate('/dashboard');
        } catch (error) {
            handleAuthError(error);
        }
    };
    
    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const { user: googleUser } = await signInWithPopup(auth, provider);
            await createUserProfileDocument(googleUser);
            toast.success(t('logged_in_successfully'));
            navigate('/dashboard');
        } catch (error) {
            handleAuthError(error);
        }
    }

    const logout = async () => {
        try {
            await signOut(auth);
            toast.success(t('logged_out_successfully'));
            navigate('/');
        } catch (error) {
            handleAuthError(error);
        }
    };

    const value = { user, loading, register, login, logout, signInWithGoogle };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};