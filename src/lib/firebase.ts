import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
apiKey: "AIzaSyAWVI9VHvxARMSM3JV-bXs_73UjKh25mn4",
authDomain: "thebaldi-me.firebaseapp.com",
projectId: "thebaldi-me",
storageBucket: "thebaldi-me.appspot.com",
messagingSenderId: "794996190135",
appId: "1:794996190135:web:ec7ac21c07fc58847d5632"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
