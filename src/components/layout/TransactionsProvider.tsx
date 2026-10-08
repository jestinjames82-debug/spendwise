"use client"

import * as React from "react"
import { getUserTransactions, getUserCategories, addTransactionAction, updateTransactionAction, deleteTransactionAction, addCategoryAction, deleteCategoryAction } from "@/app/actions"
import { errorMessage } from "@/lib/utils"

export interface Transaction {
  id: string
  userId: string
  amount: number
  type: string
  category: string
  date: string
  description: string
  notes?: string | null
  createdAt: Date
}

export interface Category {
  id: string
  userId: string
  name: string
  type: string
  createdAt: Date
}

interface TransactionsContextType {
  transactions: Transaction[]
  customCategories: Category[]
  isLoading: boolean
  error: string | null
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => Promise<void>
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'userId'>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

const TransactionsContext = React.createContext<TransactionsContextType | undefined>(undefined)

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [customCategories, setCustomCategories] = React.useState<Category[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    async function loadData() {
      try {
        const [txData, catData] = await Promise.all([getUserTransactions(), getUserCategories()])
        if (!active) return
        setTransactions(txData)
        setCustomCategories(catData)
      } catch (error) {
        if (active) setError(errorMessage(error, "Could not load your transactions and categories."))
      } finally {
        if (active) setIsLoading(false)
      }
    }
    
    loadData()
    return () => { active = false }
  }, [])

  const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => {
    const created = await addTransactionAction({ ...data, notes: data.notes ?? undefined })
    setTransactions(prev => [created, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const updated = await updateTransactionAction(id, updates)
    setTransactions(prev => prev.map(t => t.id === id ? updated : t).sort((a, b) => b.date.localeCompare(a.date)))
  }

  const deleteTransaction = async (id: string) => {
    await deleteTransactionAction(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const addCategory = async (data: Omit<Category, 'id' | 'createdAt' | 'userId'>) => {
    const created = await addCategoryAction(data)
    setCustomCategories(prev => [...prev, created])
  }

  const deleteCategory = async (id: string) => {
    await deleteCategoryAction(id)
    setCustomCategories(prev => prev.filter(c => c.id !== id))
  }

  return (
    <TransactionsContext.Provider value={{ 
      transactions, customCategories, isLoading, error,
      addTransaction, updateTransaction, deleteTransaction,
      addCategory, deleteCategory
    }}>
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const context = React.useContext(TransactionsContext)
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionsProvider")
  }
  return context
}
