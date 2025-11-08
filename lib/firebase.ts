// Utiliza a sintaxe do Firebase v8 (namespaced)
// FIX: Switched to Firebase v8 compat libraries to match namespaced syntax and resolve type/initialization errors.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// FIX: Switched from import.meta.env to process.env to resolve TypeScript errors regarding 'ImportMeta'.
// These environment variables are now defined in vite.config.ts for global replacement.
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Inicializa o Firebase apenas se ainda não foi inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();