// FIX: Adds the Vite client types reference to resolve errors with `import.meta.env`.
/// <reference types="vite/client" />

// FIX: Changed to Firebase v8 compat imports to resolve module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// As credenciais agora são lidas de forma segura a partir das variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validação para garantir que as variáveis de ambiente foram carregadas
if (!firebaseConfig.apiKey) {
  throw new Error("VITE_FIREBASE_API_KEY is not defined in the environment variables.");
}

// FIX: Changed to Firebase v8 compat initialization.
const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();