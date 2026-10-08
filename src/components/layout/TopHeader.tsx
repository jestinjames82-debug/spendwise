"use client"

import { MobileNav } from "@/components/layout/MobileNav"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { User } from "lucide-react"
import Link from "next/link"
import { Wallet } from "lucide-react"
import { useProfile } from "@/components/layout/ProfileProvider"

export function TopHeader() {
  const { profile, isLoading } = useProfile()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-xl hidden md:block">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight">SpendWise</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium hidden sm:block">
              {isLoading ? "..." : profile?.name || profile?.email || "User"}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
