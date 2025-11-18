// FIX: Use Firebase compat for app initialization to resolve module resolution issues.
import firebase from "firebase/compat/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// FIX: Firebase config is hardcoded as requested to fix environment issues.
const firebaseConfig = {
  apiKey: "AIzaSyAWVI9VHvxARMSM3JV-bXs_73UjKh25mn4",
  authDomain: "thebaldi-me.firebaseapp.com",
  projectId: "thebaldi-me",
  storageBucket: "thebaldi-me.firebasestorage.app",
  messagingSenderId: "794996190135",
  appId: "1:794996190135:web:ec7ac21c07fc58847d5632"
};

// Initialize Firebase using the compat library, which is more robust in some environments.
// FIX: Replaced `firebase.getApp()` with `firebase.app()` which is the correct method for the compat library to get the default Firebase app instance.
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };