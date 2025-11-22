import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SettingsDocument } from '../firebase-types';

interface SettingsContextType {
  settings: SettingsDocument | null;
  loading: boolean;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SettingsDocument | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const docRef = doc(db, 'settings', 'global');
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setSettings({ id: docSnap.id, ...docSnap.data() } as SettingsDocument);
            } else {
                console.warn("Global settings document not found in Firestore.");
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const value = { settings, loading };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
