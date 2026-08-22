import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA8dGR2stMNwS9hGaWrNWewSv48ahhgMZM",
  authDomain: "mytaksapp.firebaseapp.com",
  projectId: "mytaksapp",
  storageBucket: "mytaksapp.firebasestorage.app",
  messagingSenderId: "824172757284",
  appId: "1:824172757284:web:421df37ec400f83cbab3b1",
  measurementId: "G-67J5YE8VHF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);