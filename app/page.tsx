"use client"

import { useEffect, useState } from "react"
import type { VpsAccount } from "@/lib/types"
import DashboardHeader from "@/components/dashboard-header"
import VpsAccountsList from "@/components/vps-accounts-list"
import AddVpsAccountDialog from "@/components/add-vps-account-dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function Dashboard() {
  const { user, loading, signIn } = useAuth()
  const [accounts, setAccounts] = useState<VpsAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    const fetchAccounts = async () => {
      try {
        const responses = await Promise.all([
          fetch("/api/ssh"),
          fetch("/api/vless"),
          fetch("/api/trojan"),
        ])

        const data = await Promise.all(responses.map((res) => res.json()))

        const allAccounts = data.flat()

        // Sort by createdAt in descending order
        allAccounts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

        setAccounts(allAccounts)
      } catch (error: any) {
        console.error("Error fetching accounts:", error)
        setError(`Failed to fetch accounts: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchAccounts()
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 mt-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">VPS Accounts</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>

        {error ? (
          <Card>
            <CardContent>
              <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                <p>{error}</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Retry Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <VpsAccountsList accounts={accounts} isLoading={isLoading} />
            </CardContent>
          </Card>
        )}

        <AddVpsAccountDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} userId={user.uid} />
      </main>
    </div>
  )
}
