import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

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
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ? "Set (with timestamp)" : "Not set",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  environment: process.env.NODE_ENV
});

// Initialize Firebase - safely handle potential duplicate initializations
let firebaseApp: FirebaseApp;

// Check if any Firebase apps have been initialized
const apps = getApps();
if (apps.length === 0) {
  // No apps initialized yet, create a new one
  try {
    firebaseApp = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully in", process.env.NODE_ENV, "environment!");
  } catch (error: any) {
    console.error("Firebase initialization error:", error);
    throw new Error('Failed to initialize Firebase: ' + error.message);
  }
} else {
  // Use the existing app
  firebaseApp = apps[0];
  console.log("Using existing Firebase app");
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

