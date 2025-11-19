// FIX: Changed to a namespace import to resolve module resolution errors with 'firebase/app'.
import * as firebaseApp from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAWVI9VHvxARMSM3JV-bXs_73UjKh25mn4",
  authDomain: "thebaldi-me.firebaseapp.com",
  projectId: "thebaldi-me",
  storageBucket: "thebaldi-me.firebasestorage.app",
  messagingSenderId: "794996190135",
  appId: "1:794996190135:web:ec7ac21c07fc58847d5632",
};

// Initialize Firebase
const app = !firebaseApp.getApps().length ? firebaseApp.initializeApp(firebaseConfig) : firebaseApp.getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };