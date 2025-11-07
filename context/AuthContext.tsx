import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserData, Language, AuthContextType, UserPreferences } from '../types';

// Cria o contexto com um valor inicial.
export const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    refetchUser: async () => {},
    updateUserPreferences: async () => {},
});

// Este é o Provedor. Ele vai "envelopar" nossa aplicação e gerenciar o estado de autenticação.
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = useCallback(async (firebaseUser: FirebaseUser) => {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            setUser(userSnap.data() as UserData);
        } else {
            const newUser: UserData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: 'customer',
                language: (navigator.language.split('-')[0] as Language) || 'fr',
                createdAt: serverTimestamp(),
                preferences: {
                    orderUpdates: true,
                    promotions: false,
                    newArtworks: true,
                }
            };
            await setDoc(userRef, newUser);
            setUser(newUser);
        }
    }, []);

    // Função para recarregar os dados do usuário do Firestore
    const refetchUser = useCallback(async () => {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
            setLoading(true);
            await fetchUserData(firebaseUser);
            setLoading(false);
        }
    }, [fetchUserData]);

    const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { preferences });
            await refetchUser();
        }
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                await fetchUserData(firebaseUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [fetchUserData]);

    return (
        <AuthContext.Provider value={{ user, loading, refetchUser, updateUserPreferences }}>
            {children}
        </AuthContext.Provider>
    );
};