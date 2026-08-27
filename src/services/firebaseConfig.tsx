import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
// @ts-ignore — getReactNativePersistence съществува в React Native build-а на Firebase,
// но липсва в споделените TypeScript дефиниции (известен проблем на Firebase JS SDK).
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

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

// На уеб ползваме стандартния getAuth (браузърът пази сесията сам чрез localStorage).
// На Android/iOS Firebase Auth НЯМА вградена персистентност — трябва изрично да ѝ кажем
// да пази сесията в AsyncStorage, иначе логинът се губи всеки път при затваряне на приложението.
export const auth = Platform.OS === 'web'
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

export const db = getFirestore(app);