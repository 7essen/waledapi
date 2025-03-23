"use client"

import { useEffect, useState } from "react"
import { initializeApp } from "firebase/app"
import { getDatabase, ref, onValue } from "firebase/database"
import type { VpsAccount } from "@/lib/types"
import DashboardHeader from "@/components/dashboard-header"
import VpsAccountsList from "@/components/vps-accounts-list"
import AddVpsAccountDialog from "@/components/add-vps-account-dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

// Direct Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDRNcrIOz8mUHRqQk4d_JUualOIIBc9w4E",
  authDomain: "waledpro-f.firebaseapp.com",
  databaseURL: "https://waledpro-f-default-rtdb.firebaseio.com",
  projectId: "waledpro-f",
  storageBucket: "waledpro-f.firebasestorage.app",
  messagingSenderId: "289358660533",
  appId: "1:289358660533:web:8cff3ff3a9759e6f990ffc",
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [accounts, setAccounts] = useState<VpsAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newAccountId, setNewAccountId] = useState<string | null>(null)

  // Add a function to handle new account creation
  const handleAccountAdded = (accountId: string) => {
    setNewAccountId(accountId)
    // Clear the new account highlight after 5 seconds
    setTimeout(() => {
      setNewAccountId(null)
    }, 5000)
  }

  useEffect(() => {
    try {
      // Initialize Firebase directly
      const app = initializeApp(firebaseConfig)
      const database = getDatabase(app)

      // Reference to vpsAccounts in Realtime Database
      const accountsRef = ref(database, "vpsAccounts")

      // Listen for changes
      const unsubscribe = onValue(
        accountsRef,
        (snapshot) => {
          const accountsData: VpsAccount[] = []

          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const account = childSnapshot.val()
              accountsData.push({
                id: childSnapshot.key,
                ...account,
              })
            })

            // Sort by createdAt in descending order
            accountsData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
          }

          setAccounts(accountsData)
          setIsLoading(false)
        },
        (error) => {
          console.error("Database error:", error)
          setError(`Database error: ${error.message}`)
          setIsLoading(false)
        },
      )

      return () => {
        // No need to unsubscribe as onValue doesn't return an unsubscribe function
      }
    } catch (err: any) {
      console.error("Firebase initialization error:", err)
      setError(`Failed to initialize database: ${err.message}`)
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">VPS Accounts</h1>
          <div className="flex gap-2">
            <Link href="/test">
              <Button variant="outline">Test Firebase</Button>
            </Link>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </div>
        </div>

        {error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
            <p>{error}</p>
            <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </div>
        ) : (
          <VpsAccountsList accounts={accounts} isLoading={isLoading} newAccountId={newAccountId} />
        )}

        <AddVpsAccountDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          userId={user?.uid}
          onAccountAdded={handleAccountAdded}
        />
      </main>
    </div>
  )
}

