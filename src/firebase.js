import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAcII6zXH643ZRhrXiSvfWjxhMv9VJGInc",
  authDomain: "roadmap-tracker-3b671.firebaseapp.com",
  projectId: "roadmap-tracker-3b671",
  storageBucket: "roadmap-tracker-3b671.firebasestorage.app",
  messagingSenderId: "194314156004",
  appId: "1:194314156004:web:a99eef7e2f26cda83e79f1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);