import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from 'shared/lib/firebase';
import { UserData, AuthContextType, UserProfile, UserPreferences } from 'shared/types';

export const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    refetchUser: async () => {},
    updateUserPreferences: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = useCallback(async (firebaseUser: User): Promise<UserData> => {
        const userRef = doc(firestore, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return { ...firebaseUser, profile: userSnap.data() as UserProfile };
        } else {
            // Profile doesn't exist, create it
            const newUserProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
                role: 'user',
                language: 'fr',
                emailVerified: firebaseUser.emailVerified,
                createdAt: serverTimestamp(),
            };
            await setDoc(userRef, newUserProfile);
            return { ...firebaseUser, profile: newUserProfile };
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    const userData = await fetchUserProfile(firebaseUser);
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth state change error:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [fetchUserProfile]);
    
    const refetchUser = useCallback(async () => {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
            setLoading(true);
            try {
                const userData = await fetchUserProfile(firebaseUser);
                setUser(userData);
            } catch (error) {
                console.error("Error refetching user:", error);
            } finally {
                setLoading(false);
            }
        }
    }, [fetchUserProfile]);

    const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
        if (user?.profile) {
            const userRef = doc(firestore, 'users', user.uid);
            const updatedPreferences = { ...user.profile.preferences, ...preferences };
            await setDoc(userRef, { preferences: updatedPreferences, updatedAt: serverTimestamp() }, { merge: true });
            await refetchUser();
        }
    };

    const value = { user, loading, refetchUser, updateUserPreferences };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
