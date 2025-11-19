
// FIX: Using firebase v8 compat libraries for app and auth to resolve module errors, while keeping v9 for firestore.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
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
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
const auth = firebase.auth();
const db = getFirestore(app);

export { app, auth, db };
