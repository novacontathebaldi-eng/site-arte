// FIX: The following imports were updated to use the Firebase v9 compatibility layer (`/compat`).
// This is necessary to support the existing v8 (namespaced) syntax throughout the application
// while using a modern version of the Firebase SDK, resolving the namespace and property errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/auth'; // Import for authentication
import 'firebase/compat/functions'; // Import for Firebase Functions

// New Firebase configuration for the art gallery project.
const firebaseConfig = {
  apiKey: "AIzaSyBctHb4KzodpCgxRcPNY4NuKFYX71-wSbQ",
  authDomain: "arte-meeh.firebaseapp.com",
  projectId: "arte-meeh",
  storageBucket: "arte-meeh.appspot.com",
  messagingSenderId: "160070945903",
  appId: "1:160070945903:web:5e881331486f459ca1519a"
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
  
  db.settings({
    experimentalForceLongPolling: true,
  });
  
  console.log("Firebase initialized successfully. Connecting to Firestore, Storage, Auth, and Functions...");
} catch (error) {
  console.error('Failed to initialize Firebase. Check your firebaseConfig object in `services/firebase.ts`.', error);
}

export { db, storage, auth, functions };