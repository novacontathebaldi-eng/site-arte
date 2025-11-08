import { initializeApp, FirebaseApp } from "firebase/app";
import {
  Auth,
  getAuth,
  // As funções abaixo são importadas conforme solicitado,
  // prontas para serem exportadas ou usadas em futuras implementações.
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  // FIX: Cast import.meta to any to resolve TypeScript error 'Property 'env' does not exist on type 'ImportMeta''.
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  // FIX: Cast import.meta to any to resolve TypeScript error 'Property 'env' does not exist on type 'ImportMeta''.
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  // FIX: Cast import.meta to any to resolve TypeScript error 'Property 'env' does not exist on type 'ImportMeta''.
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  // FIX: Cast import.meta to any to resolve TypeScript error 'Property 'env' does not exist on type 'ImportMeta''.
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  // FIX: Cast import.meta to any to resolve TypeScript error 'Property 'env' does not exist on type 'ImportMeta''.
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  // FIX: Cast import.meta to any to resolve TypeScript error 'Property 'env' does not exist on type 'ImportMeta''.
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
};

const app: FirebaseApp = initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
