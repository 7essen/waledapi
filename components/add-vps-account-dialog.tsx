"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { initializeApp } from "firebase/app"
import { getDatabase, ref, push, set } from "firebase/database"

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

const formSchema = z.object({
  type: z.enum(["SSH", "VLESS", "TROJAN"]),
  ip_address: z.string().min(1, "IP address is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  expiry_date: z.string().min(1, "Expiry date is required"),
  status: z.enum(["active", "inactive"]),
})

type FormValues = z.infer<typeof formSchema>

interface AddVpsAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string
  onAccountAdded?: (accountId: string) => void
}

export default function AddVpsAccountDialog({ open, onOpenChange, userId, onAccountAdded }: AddVpsAccountDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "SSH",
      ip_address: "",
      username: "",
      password: "",
      expiry_date: new Date().toISOString().split("T")[0],
      status: "active",
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    setDebugInfo(["Starting submission process..."])
    setIsSuccess(false)

    try {
      // Initialize Firebase directly
      const app = initializeApp(firebaseConfig)
      setDebugInfo((prev) => [...prev, "Firebase initialized successfully"])

      // Use Realtime Database instead of Firestore
      const database = getDatabase(app)
      setDebugInfo((prev) => [...prev, "Realtime Database initialized"])

      // Create a new account object
      const newAccount = {
        ...values,
        userId: userId || "anonymous",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      setDebugInfo((prev) => [...prev, "Account object created, attempting to write to Realtime Database..."])

      // Write to Realtime Database
      const accountsRef = ref(database, "vpsAccounts")
      const newAccountRef = push(accountsRef)

      await set(newAccountRef, newAccount)

      const newAccountId = newAccountRef.key
      setDebugInfo((prev) => [...prev, `Write successful - Key: ${newAccountId}`])

      // Set success state
      setIsSuccess(true)

      // Call the callback if it exists
      if (onAccountAdded && newAccountId) {
        onAccountAdded(newAccountId)
      }

      toast({
        title: "Account added",
        description: "VPS account has been added successfully.",
      })

      // Don't close the dialog immediately to show success state
      setTimeout(() => {
        form.reset()
        onOpenChange(false)
        setIsSuccess(false)
      }, 2000)
    } catch (error: any) {
      console.error("Error adding account:", error)
      setDebugInfo((prev) => [...prev, `Error: ${error.message}`])

      toast({
        title: "Error",
        description: `Failed to add VPS account: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!isSubmitting) {
          onOpenChange(newOpen)
          if (!newOpen) {
            setIsSuccess(false)
          }
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        {isSuccess ? (
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-center">VPS Account Added!</h2>
            <p className="text-center text-muted-foreground mt-2">
              Your VPS account has been successfully added to the dashboard.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add VPS Account</DialogTitle>
              <DialogDescription>Add a new VPS account to your dashboard.</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SSH">SSH</SelectItem>
                            <SelectItem value="VLESS">VLESS</SelectItem>
                            <SelectItem value="TROJAN">TROJAN</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="ip_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP Address</FormLabel>
                      <FormControl>
                        <Input placeholder="192.168.1.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {debugInfo.length > 0 && (
                  <div className="p-2 bg-muted/20 rounded text-xs space-y-1 max-h-32 overflow-y-auto">
                    <p className="font-medium">Debug Info:</p>
                    {debugInfo.map((info, i) => (
                      <p key={i}>{info}</p>
                    ))}
                  </div>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Account"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

