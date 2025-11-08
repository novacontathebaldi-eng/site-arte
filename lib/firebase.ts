// Usa a sintaxe do Firebase v8 para corresponder à dependência instalada
// FIX: Switched to Firebase v9 compat imports to provide v8 syntax and types.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// As variáveis de ambiente são definidas em vite.config.ts para substituição global.
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