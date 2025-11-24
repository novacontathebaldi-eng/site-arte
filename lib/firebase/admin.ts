import 'server-only';
import * as admin from 'firebase-admin';

// Singleton para o Firebase Admin
// Evita reinicialização em hot-reload
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Corrige problemas de quebra de linha em variáveis de ambiente (Vercel/env files)
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();