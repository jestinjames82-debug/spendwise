"use client"

import { useProfile } from "@/components/layout/ProfileProvider"
import { useTransactions } from "@/components/layout/TransactionsProvider"

export function DataStatus() {
  const { error: profileError } = useProfile()
  const { error: transactionError } = useTransactions()
  const errors = Array.from(new Set([profileError, transactionError].filter(Boolean)))

  if (errors.length === 0) return null

  return (
    <div role="alert" className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4">
      <p className="font-medium">Some account data could not be loaded.</p>
      {errors.map(error => <p key={error} className="mt-1 text-sm">{error}</p>)}
      <button className="mt-3 text-sm font-medium underline" onClick={() => window.location.reload()}>Retry loading</button>
    </div>
  )
}
