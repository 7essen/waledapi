"use client"

import { ModeToggle } from "@/components/mode-toggle"
import { Server } from "lucide-react"

export default function DashboardHeader() {
  return (
    <header className="border-b bg-white py-4">
          <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Server className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">VPS Manager</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground hidden md:inline-block">Admin Dashboard</span>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

