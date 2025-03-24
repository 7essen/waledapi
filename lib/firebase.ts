import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase
let firebaseApp
if (!getApps().length) {
  try {
    firebaseApp = initializeApp(firebaseConfig)
    console.log("Firebase initialized successfully!")
  } catch (error: any) {
    console.error("Firebase initialization error:", error)
    throw new Error('Failed to initialize Firebase: ' + error.message)
  }
} else {
  firebaseApp = getApps()[0] // if already initialized, use that one
}

const db = getFirestore(firebaseApp)
const auth = getAuth(firebaseApp)

// Get database instance
const database = getDatabase(firebaseApp)

export { firebaseApp, db, auth, database }

