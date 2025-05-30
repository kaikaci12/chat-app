import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, getFirestore } from "firebase/firestore";

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
export const usersRef = collection(db, "users");
export const roomRef = collection(db, "rooms");
