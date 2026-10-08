"use client"

import * as React from "react"
import { PlusCircle, Loader2, Target } from "lucide-react"
import { Dialog } from "@/components/ui/Dialog"
import { BudgetForm, Budget, BudgetFormData } from "@/components/budgets/BudgetForm"
import { BudgetCard } from "@/components/budgets/BudgetCard"
import { DEFAULT_EXPENSE_CATEGORIES } from "@/lib/constants"
import { useProfile } from "@/components/layout/ProfileProvider"
import { useTransactions } from "@/components/layout/TransactionsProvider"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { getUserBudgets, addBudgetAction, updateBudgetAction, deleteBudgetAction } from "@/app/actions"
import { errorMessage, localDate } from "@/lib/utils"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

export default function BudgetsPage() {
  const { profile, currencySymbol, isLoading: profileLoading } = useProfile()
  
  const [budgets, setBudgets] = React.useState<Budget[]>([])
  const [loadedMonth, setLoadedMonth] = React.useState<string | null>(null)
  const [loadError, setLoadError] = React.useState("")
  const [actionError, setActionError] = React.useState("")
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingBudget, setEditingBudget] = React.useState<Budget | null>(null)
  
  const currentMonthStr = localDate().slice(0, 7)
  const [selectedMonth, setSelectedMonth] = React.useState<string>(currentMonthStr)

  const { transactions, customCategories } = useTransactions()
  const profileId = profile?.id
  const isLoading = profileLoading || (Boolean(profileId) && loadedMonth !== selectedMonth)
  
  React.useEffect(() => {
    let active = true
    async function loadData() {
      try {
        const budgetsData = await getUserBudgets(selectedMonth)
        if (!active) return
        setBudgets(budgetsData)
        setLoadError("")
      } catch (error) {
        if (active) {
          setBudgets([])
          setLoadError(errorMessage(error, "Could not load your budgets."))
        }
      } finally {
        if (active) setLoadedMonth(selectedMonth)
      }
    }
    
    if (profileId) {
       loadData()
    }
    return () => { active = false }
  }, [profileId, selectedMonth])

  const spentData = React.useMemo(() => {
    const spent = new Map<string, number>()
    transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.date.startsWith(selectedMonth)) {
        spent.set(tx.category, (spent.get(tx.category) ?? 0) + Number(tx.amount))
      }
    })
    return spent
  }, [transactions, selectedMonth])

  const expenseCategories = Array.from(new Set([
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...customCategories.filter(c => c.type === "expense").map(c => c.name)
  ]))

  const availableCategories = editingBudget 
    ? expenseCategories
    : expenseCategories.filter(cat => !budgets.find(b => b.category === cat))

  const handleAdd = () => {
    setEditingBudget(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      try {
        setActionError("")
        await deleteBudgetAction(id)
        setBudgets(prev => prev.filter(b => b.id !== id))
      } catch (error) {
        console.error("Failed to delete", error)
        setActionError(errorMessage(error, "Could not delete budget."))
      }
    }
  }

  const handleFormSubmit = async (data: BudgetFormData) => {
    if (!profile) throw new Error("Your profile is not loaded. Refresh the page and try again.")

    try {
      if (editingBudget) {
        const updated = await updateBudgetAction(editingBudget.id, { amount: data.amount })
        if (updated) {
          setBudgets(prev => prev.map(b => b.id === editingBudget.id ? updated : b))
        }
      } else {
        const created = await addBudgetAction({
          category: data.category,
          amount: data.amount,
          month: selectedMonth
        })
        if (created) {
          setBudgets(prev => [...prev, created])
        }
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to save budget", error)
      throw error
    }
  }

  return (
    <motion.div 
      className="flex-1 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
          <p className="text-muted-foreground mt-1">Set limits for your expenses and track your spending.</p>
        </div>
        <button 
          onClick={handleAdd}
          disabled={isLoading || !profile || availableCategories.length === 0 || Boolean(loadError)}
          className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Budget
        </button>
      </div>

      {(loadError || actionError) && <p role="alert" className="rounded-lg border border-destructive p-4 text-sm text-destructive">{loadError || actionError}</p>}

      <div className="flex items-center justify-between bg-card border rounded-xl p-4 shadow-sm">
        <h3 className="font-medium">Budget Month</h3>
        <input 
          type="month"
          aria-label="Budget month"
          value={selectedMonth}
          onChange={(e) => { if (/^\d{4}-\d{2}$/.test(e.target.value)) setSelectedMonth(e.target.value) }}
          className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : loadError ? (
        <button onClick={() => window.location.reload()} className="text-sm text-primary underline">Retry loading budgets</button>
      ) : budgets.length === 0 ? (
        <div className="border rounded-xl bg-card shadow-sm p-12 text-center flex flex-col items-center">
          <div className="bg-muted h-12 w-12 rounded-full flex items-center justify-center mb-4">
            <Target className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="font-medium text-base text-foreground">No budgets set</p>
          <p className="text-sm mt-1 text-muted-foreground mb-6 max-w-sm">
            You haven&apos;t set any budgets for {new Date(selectedMonth + '-01T12:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} yet.
          </p>
          <button 
            onClick={handleAdd}
            disabled={!profile}
            className="inline-flex items-center justify-center border border-input bg-background hover:bg-muted h-10 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Create your first budget
          </button>
        </div>
      ) : (
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {budgets.map((budget) => (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <BudgetCard 
                  category={budget.category}
                  budgetAmount={budget.amount}
                  spentAmount={spentData.get(budget.category) ?? 0}
                  currencySymbol={currencySymbol}
                  onEdit={() => handleEdit(budget)}
                  onDelete={() => handleDelete(budget.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Dialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        title={editingBudget ? "Edit Budget" : "Add Budget"}
      >
        <BudgetForm 
          initialData={editingBudget}
          categories={availableCategories}
          currencySymbol={currencySymbol}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsDialogOpen(false)}
        />
      </Dialog>
    </motion.div>
  )
}
