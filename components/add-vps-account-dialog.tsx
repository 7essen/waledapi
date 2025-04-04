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
import { encryptAccount, getFirebaseConfig } from "@/lib/encryption"
import { initializeApp } from "firebase/app"
import { getDatabase, ref, push, set } from "firebase/database"

const formSchema = z.object({
  type: z.enum(["SSH", "VLESS", "TROJAN", "SOCKS", "SHADOWSOCKS"]),
  server_name: z.string().min(1, "Server name is required"),
  ip_address: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  expiry_date: z.string().optional(),
  config: z.string().optional(),
  status: z.enum(["active", "inactive"]),
}).refine(data => {
  if (data.type === "SSH") {
    return data.ip_address && data.username && data.password && data.expiry_date
  }
  if (data.type === "VLESS" || data.type === "TROJAN" || data.type === "SOCKS" || data.type === "SHADOWSOCKS") {
    return data.config
  }
  return true
}, {
  message: "Required fields are missing based on the selected type",
  path: ["ip_address", "username", "password", "expiry_date", "config"]
})

type FormValues = z.infer<typeof formSchema>

interface AddVpsAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string
  onAccountAdded?: (accountId: string) => void
}
export default function AddVpsAccountDialog({ open, onOpenChange, userId, onAccountAdded }: AddVpsAccountDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  // Initialize Firebase with decrypted configuration
  const app = initializeApp(getFirebaseConfig());
  const database = getDatabase(app);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "SSH",
      server_name: "",
      ip_address: "",
      username: "",
      password: "",
      expiry_date: new Date().toISOString().split("T")[0],
      status: "active",
      config: ""
    },
  });
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      // Create a new account object with only the relevant fields
      const newAccount: any = {
        type: values.type,
        server_name: values.server_name,
        status: values.status,
        userId: userId || "anonymous",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Add fields based on account type
      if (values.type === "SSH") {
        if (values.ip_address) newAccount.ip_address = values.ip_address;
        if (values.username) newAccount.username = values.username;
        if (values.password) newAccount.password = values.password;
        if (values.expiry_date) newAccount.expiry_date = values.expiry_date;
      } else {
        // For VLESS, TROJAN, SOCKS, and Shadowsocks accounts
        if (values.config) newAccount.config = values.config;
      }

      // Encrypt sensitive data
      const encryptedAccount = encryptAccount(newAccount);

      // Write to Realtime Database
      const accountsRef = ref(database, "vpsAccounts");
      const newAccountRef = push(accountsRef);

      await set(newAccountRef, encryptedAccount);

      const newAccountId = newAccountRef.key;

      // Set success state
      setIsSuccess(true);

      // Call the callback if it exists
      if (onAccountAdded && newAccountId) {
        onAccountAdded(newAccountId);
      }

      toast({
        title: "Account added",
        description: "VPS account has been added successfully.",
      });

      // Don't close the dialog immediately to show success state
      setTimeout(() => {
        form.reset();
        onOpenChange(false);
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error adding account:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

      toast({
        title: "Error",
        description: `Failed to add VPS account: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                            <SelectItem value="SOCKS">SOCKS</SelectItem>
                            <SelectItem value="SHADOWSOCKS">Shadowsocks</SelectItem>
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
                  name="server_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Server Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My VPS Server" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("type") === "SSH" && (
                  <>
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
                  </>
                )}

                {(form.watch("type") === "VLESS" || form.watch("type") === "TROJAN" || form.watch("type") === "SOCKS" || form.watch("type") === "SHADOWSOCKS") && (
                  <FormField
                    control={form.control}
                    name="config"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Config</FormLabel>
                        <FormControl>
                          <Input placeholder="Configuration URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
  );
}

