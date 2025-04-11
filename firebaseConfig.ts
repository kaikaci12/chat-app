import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  initializeAuth,
} from "firebase/auth";
import { collection, getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import directly

const firebaseConfig = {
  apiKey: "AIzaSyCpEeY6BQY3_DOXcbCNvkVLq1RdzW2vodg",
  authDomain: "social-media-8aede.firebaseapp.com",
  projectId: "social-media-8aede",
  storageBucket: "social-media-8aede.firebasestorage.app",
  messagingSenderId: "213686090121",
  appId: "1:213686090121:web:bd4e441dbdb5146c9c0958",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);
export const userRef = collection(db, "users");
export const roomRef = collection(db, "rooms");
