// FIX: The following imports were updated to use the Firebase v9 compatibility layer (`/compat`).
// This is necessary to support the existing v8 (namespaced) syntax throughout the application
// while using a modern version of the Firebase SDK, resolving the namespace and property errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/auth'; // Import for authentication
import 'firebase/compat/functions'; // Import for Firebase Functions

// New Firebase configuration for the "thebaldi-me" project.
const firebaseConfig = {
  apiKey: "AIzaSyAWVI9VHvxARMSM3JV-bXs_73UjKh25mn4",
  authDomain: "thebaldi-me.firebaseapp.com",
  projectId: "thebaldi-me",
  storageBucket: "thebaldi-me.firebasestorage.app",
  messagingSenderId: "794996190135",
  appId: "1:794996190135:web:ec7ac21c07fc58847d5632"
};


let db: firebase.firestore.Firestore | null = null;
let storage: firebase.storage.Storage | null = null;
let auth: firebase.auth.Auth | null = null; // Add auth service
let functions: firebase.functions.Functions | null = null; // Add functions service

try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.firestore();
  storage = firebase.storage();
  auth = firebase.auth();
  functions = firebase.functions();
  
  // This setting might be useful in some environments, keeping it.
  db.settings({
    experimentalForceLongPolling: true,
  });
  
  console.log("Firebase initialized successfully for thebaldi-me project.");
} catch (error) {
  console.error('Failed to initialize Firebase. Check your firebaseConfig object in `services/firebase.ts`.', error);
}

export { db, storage, auth, functions };