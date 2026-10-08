"use client"

import * as React from "react"
import { getUserProfile, updateUserProfile } from "@/app/actions"
import { errorMessage } from "@/lib/utils"

export interface Profile {
  id: string
  email: string
  name: string | null
  currency: string
}

interface ProfileContextType {
  profile: Profile | null
  isLoading: boolean
  error: string | null
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  currencySymbol: string
}

const ProfileContext = React.createContext<ProfileContextType | undefined>(undefined)

const currencySymbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    async function loadProfile() {
      try {
        const data = await getUserProfile()
        if (!active) return
        if (data) {
          setProfile({
            id: data.id,
            email: data.email || "",
            name: data.name,
            currency: data.currency
          })
        }
      } catch (error) {
        if (active) setError(errorMessage(error, "Could not load your profile."))
      } finally {
        if (active) setIsLoading(false)
      }
    }
    
    loadProfile()
    return () => { active = false }
  }, [])

  const updateProfileReq = async (updates: Partial<Profile>) => {
    if (!profile) throw new Error("Your profile is not loaded. Refresh the page and try again.")

    try {
      const data = await updateUserProfile(updates)
      if (data) {
        setProfile({
            id: data.id,
            email: data.email || "",
            name: data.name,
            currency: data.currency
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  const currencySymbol = profile?.currency ? (currencySymbols[profile.currency] || profile.currency) : "₹"

  return (
    <ProfileContext.Provider value={{ profile, isLoading, error, updateProfile: updateProfileReq, currencySymbol }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = React.useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
