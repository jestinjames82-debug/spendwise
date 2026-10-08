"use client"

import * as React from "react"
import { useProfile } from "@/components/layout/ProfileProvider"
import { signOut } from "next-auth/react"
import { Loader2, Save } from "lucide-react"
import { motion, Variants } from "framer-motion"
import { errorMessage } from "@/lib/utils"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

const currencies = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
]

export default function SettingsPage() {
  const { profile, isLoading, updateProfile } = useProfile()
  
  const [fullName, setFullName] = React.useState("")
  const [currency, setCurrency] = React.useState("INR")
  const [isSaving, setIsSaving] = React.useState(false)
  const [successMsg, setSuccessMsg] = React.useState("")
  const [saveError, setSaveError] = React.useState("")
  
  React.useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFullName(profile.name || "")
      setCurrency(profile.currency || "INR")
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMsg("")
    setSaveError("")
    
    try {
      await updateProfile({
        name: fullName,
        currency: currency
      })
      setSuccessMsg("Profile updated successfully!")
      setTimeout(() => setSuccessMsg(""), 3000)
    } catch (error) {
      console.error("Failed to update profile", error)
      setSaveError(errorMessage(error, "Failed to update profile."))
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div 
      className="flex-1 space-y-6 max-w-4xl"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </motion.div>

      <div className="grid gap-6">
        <motion.div variants={itemVariants} className="border rounded-xl bg-card shadow-sm">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-lg">Profile</h3>
            <p className="text-sm text-muted-foreground">Update your personal information.</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSave} className="space-y-6 max-w-xl">
              {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
              <div>
                <label htmlFor="profile-email" className="text-sm font-medium">Email Address</label>
                <input 
                  id="profile-email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">Your email cannot be changed.</p>
              </div>
              
              <div>
                <label htmlFor="profile-name" className="text-sm font-medium">Full Name</label>
                <input 
                  id="profile-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="profile-currency" className="text-sm font-medium">Default Currency</label>
                <select
                  id="profile-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol}) - {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  This currency symbol will be used across the entire dashboard.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSaving || !profile}
                  className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </button>
                {successMsg && (
                  <p role="status" className="text-sm text-emerald-500 font-medium animate-in fade-in">{successMsg}</p>
                )}
              </div>
            </form>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="border rounded-xl border-destructive/20 bg-destructive/5 shadow-sm">
          <div className="p-6">
            <h3 className="font-semibold text-lg text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">Log out of your account on this device.</p>
            <div className="flex gap-4">
              <button 
                onClick={handleLogout}
                className="inline-flex items-center justify-center border border-input bg-background hover:bg-muted h-10 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
