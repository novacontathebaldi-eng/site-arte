import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// As credenciais agora são lidas de forma segura a partir das variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Validação para garantir que as variáveis de ambiente foram carregadas
if (!firebaseConfig.apiKey) {
  throw new Error("FIREBASE_API_KEY is not defined in the environment variables.");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
