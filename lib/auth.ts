import { initializeApp } from "firebase/app"
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, User } from "firebase/auth"
import { useState, useEffect } from "react"

interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<User>
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Log Firebase config (without sensitive data)
console.log("Firebase Config:", {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
})

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user")
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in with:", email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("Sign in successful")
      return userCredential.user
    } catch (error: any) {
      console.error("Sign in error:", error)
      let errorMessage = "Failed to sign in"
      
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email address"
          break
        case "auth/user-disabled":
          errorMessage = "This account has been disabled"
          break
        case "auth/user-not-found":
          errorMessage = "No account found with this email"
          break
        case "auth/wrong-password":
          errorMessage = "Incorrect password"
          break
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later"
          break
        default:
          errorMessage = error.message || "An error occurred during sign in"
      }
      
      throw new Error(errorMessage)
    }
  }

  return {
    user,
    loading,
    signIn,
  }
} 