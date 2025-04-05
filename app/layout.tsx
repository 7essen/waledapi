"use client";

"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import LoginForm from "@/components/login-form";
import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard-header";

const inter = Inter({ subsets: ["latin"], display: "fallback" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          {isLoading ? null : (
            <>
              {isLoggedIn && <DashboardHeader setIsLoggedIn={setIsLoggedIn} />}
              {isLoggedIn ? children : <LoginForm setIsLoggedIn={setIsLoggedIn} />}
            </>
          )}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}