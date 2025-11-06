// Este arquivo é o ponto central para a configuração do Firebase.
// Ele inicializa o Firebase com as suas chaves de API e exporta os serviços
// que vamos usar no resto do site (como autenticação e banco de dados).

// FIX: Mudei para a biblioteca de compatibilidade para a inicialização para resolver um possível problema de ambiente/versão com o SDK modular.
import firebase from "firebase/compat/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ATENÇÃO, OTÁVIO:
// Cole aqui as suas credenciais do Firebase que você encontra no console do seu projeto.
// É MUITO IMPORTANTE que as chaves que começam com "NEXT_PUBLIC_" sejam guardadas
// como Variáveis de Ambiente no Vercel para segurança.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "SUA_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "SEU_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "SEU_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "SEU_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "SEU_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "SEU_APP_ID",
};

// Inicializa a aplicação Firebase com as configurações acima.
// Verificamos se o app já foi inicializado para evitar erros durante o hot-reloading (recarregamento automático em desenvolvimento).
const app = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

// Exporta os serviços que vamos utilizar:
// auth: para gerenciar login, cadastro, etc.
// db: para interagir com o banco de dados Firestore (ler e escrever dados).
export const auth = getAuth(app);
export const db = getFirestore(app);
