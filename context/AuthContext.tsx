import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserData, Language, AuthContextType } from '../types';

// Este é o Contexto de Autenticação. Ele vai compartilhar as informações
// do usuário logado (ou a ausência dele) para toda a aplicação.

// Cria o contexto com um valor inicial.
export const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

// Este é o Provedor. Ele vai "envelopar" nossa aplicação e gerenciar o estado de autenticação.
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // useEffect é usado para "escutar" as mudanças no estado de autenticação do Firebase.
    // Isso roda apenas uma vez quando o componente é montado.
    useEffect(() => {
        // onAuthStateChanged é uma função do Firebase que nos notifica sempre que
        // um usuário faz login ou logout.
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // Se o usuário está logado no Firebase...
                const userRef = doc(db, 'users', firebaseUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    // ... e já tem um perfil no nosso banco de dados (Firestore),
                    // nós carregamos esses dados.
                    setUser(userSnap.data() as UserData);
                } else {
                    // ... mas é o primeiro login dele (ex: via Google),
                    // nós criamos um perfil para ele no Firestore.
                    const newUser: UserData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        role: 'customer', // Todo novo usuário é um cliente.
                        language: (navigator.language.split('-')[0] as Language) || 'fr',
                        createdAt: serverTimestamp(),
                    };
                    await setDoc(userRef, newUser);
                    setUser(newUser);
                }
            } else {
                // Se não há usuário logado no Firebase, definimos nosso estado como nulo.
                setUser(null);
            }
            // Marcamos o carregamento como concluído.
            setLoading(false);
        });

        // A função de "cleanup" do useEffect. Ela cancela a "escuta" quando o componente
        // é desmontado, para evitar vazamentos de memória.
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};