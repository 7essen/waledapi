import { initializeApp, getApps, FirebaseApp, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

// Firebase app name - using a consistent name prevents duplicate app errors
const APP_NAME = "waledapi-app";

// Add a timestamp parameter to avoid URL caching
const addTimestampToURL = (url: string | undefined): string | undefined => {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_ts=${Date.now()}`;
};

// Firebase configuration using environment variables with timestamp to prevent caching
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: addTimestampToURL(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Log firebase config (except for sensitive info)
console.log("Firebase Config (Vercel):", { 
  hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ? "Set (with timestamp)" : "Not set",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  environment: process.env.NODE_ENV,
  appName: APP_NAME
});

// Initialize Firebase - safely handle potential duplicate initializations
let firebaseApp: FirebaseApp;

try {
  // Check if app with this name already exists and get it
  firebaseApp = getApp(APP_NAME);
  console.log(`Using existing Firebase app with name: ${APP_NAME}`);
} catch (error) {
  // App doesn't exist yet, create a new one with our specific name
  try {
    firebaseApp = initializeApp(firebaseConfig, APP_NAME);
    console.log(`Firebase initialized successfully with name: ${APP_NAME} in ${process.env.NODE_ENV} environment!`);
  } catch (error: any) {
    console.error("Firebase initialization error:", error);
    throw new Error('Failed to initialize Firebase: ' + error.message);
  }
}

// Initialize Firebase services
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);

// Configure database for non-caching on client-side only
if (typeof window !== 'undefined') {
  try {
    database.app.options.databaseURL = addTimestampToURL(database.app.options.databaseURL);
  } catch (error) {
    console.warn("Could not add timestamp to database URL:", error);
  }
}

export { firebaseApp, db, auth, database };

