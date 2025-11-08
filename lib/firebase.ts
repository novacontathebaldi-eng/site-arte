/// <reference types="vite/client" />

// Utiliza a sintaxe do Firebase v8 (namespaced)
// FIX: Switched to Firebase v8 compat libraries to match namespaced syntax and resolve type/initialization errors.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const firebaseConfig = {
  // NOTE: The 'import.meta.env' properties are part of the Vite build process.
  // The "Property 'env' does not exist on type 'ImportMeta'" error is typically a TypeScript configuration issue
  // (e.g., missing "vite/client" in tsconfig.json types) and cannot be fixed here.
  // The code itself is correct for a Vite environment.
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializa o Firebase apenas se ainda não foi inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();