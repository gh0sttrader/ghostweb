// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface FirebaseServices {
    app: FirebaseApp;
    auth: Auth;
    db: Firestore;
    storage: FirebaseStorage;
}

let services: FirebaseServices | null = null;

// Initialize Firebase only once
if (firebaseConfig.apiKey && !getApps().length) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  services = { app, auth, db, storage };
} else if (getApps().length) {
  const app = getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  services = { app, auth, db, storage };
} else {
    console.warn("Firebase configuration is missing or incomplete. Firebase services are not available.");
}

// Export the initialized services
export const app = services?.app;
export const auth = services?.auth;
export const db = services?.db;
export const storage = services?.storage;