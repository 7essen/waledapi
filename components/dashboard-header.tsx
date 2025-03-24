"use client"

import { ModeToggle } from "@/components/mode-toggle";
import { Server } from "lucide-react";
import { Button } from "./ui/button";
import { Dispatch, SetStateAction, ReactNode } from "react";

interface Props {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  children?: ReactNode;
}

export default function DashboardHeader({ setIsLoggedIn, children }: Props) {
  return (
    <>
      <header className="bg-background py-4 border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-foreground">VPS Manager</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              Admin Dashboard
            </span>
            <ModeToggle />
            {setIsLoggedIn && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsLoggedIn(false);
                }}
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
