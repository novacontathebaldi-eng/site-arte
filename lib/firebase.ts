import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// import { getStorage } from 'firebase/storage';

// TODO: Replace the following with your app's Firebase project configuration.
// These are client-side keys and are safe to expose in your frontend code.
// Go to your Firebase project > Project settings > General tab > Your apps > Web app.
// Find the "Firebase SDK snippet" and select the "Config" option.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your API key
  authDomain: "YOUR_AUTH_DOMAIN", // Replace with your auth domain
  projectId: "YOUR_PROJECT_ID", // Replace with your project ID
  storageBucket: "YOUR_STORAGE_BUCKET", // Replace with your storage bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your messaging sender ID
  appId: "YOUR_APP_ID", // Replace with your app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
// const storage = getStorage(app);


// NOTE: Supabase is used for storage in this project.
export { db, auth };