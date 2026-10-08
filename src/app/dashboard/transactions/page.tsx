"use client"

import * as React from "react"
import { PlusCircle, Search, Edit2, Trash2, ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react"
import { Dialog } from "@/components/ui/Dialog"
import { TransactionForm, Transaction, TransactionFormData } from "@/components/transactions/TransactionForm"
import { cn, errorMessage } from "@/lib/utils"
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/lib/constants"
import { useProfile } from "@/components/layout/ProfileProvider"
import { useTransactions } from "@/components/layout/TransactionsProvider"
import { motion, AnimatePresence, Variants } from "framer-motion"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

export default function TransactionsPage() {
  const { currencySymbol } = useProfile()
  const { 
    transactions, 
    customCategories, 
    isLoading, 
    updateTransaction, 
    deleteTransaction,
    addTransaction
  } = useTransactions()
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null)
  const [deleteError, setDeleteError] = React.useState("")
  
  // Filter State
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterType, setFilterType] = React.useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = React.useState("all")
  const [filterDate, setFilterDate] = React.useState("")


  const expenseCategories = [...DEFAULT_EXPENSE_CATEGORIES, ...customCategories.filter(c => c.type === 'expense').map(c => c.name)]
  const incomeCategories = [...DEFAULT_INCOME_CATEGORIES, ...customCategories.filter(c => c.type === 'income').map(c => c.name)]
  const allCategories = Array.from(new Set([...expenseCategories, ...incomeCategories, ...transactions.map(t => t.category)]))

  const handleAdd = () => {
    setEditingTransaction(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        setDeleteError("")
        await deleteTransaction(id)
      } catch (error) {
        console.error("Failed to delete", error)
        setDeleteError(errorMessage(error, "Failed to delete transaction."))
      }
    }
  }

  const handleFormSubmit = async (data: TransactionFormData) => {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, data)
      } else {
        await addTransaction(data)
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to save transaction", error)
      throw error // Re-throw to be caught by the form
    }
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = filterType === "all" || t.type === filterType
    const matchesCategory = filterCategory === "all" || t.category === filterCategory
    const matchesDate = !filterDate || t.date === filterDate
    
    return matchesSearch && matchesType && matchesCategory && matchesDate
  })

  return (
    <motion.div 
      className="flex-1 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground mt-1">Manage your income and expenses.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 py-2 rounded-md font-medium transition-colors"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </button>
      </div>

      {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}

      {/* Filters */}
      <div className="bg-card border rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            aria-label="Search transactions"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-transparent text-sm"
          />
        </div>
        <select 
          aria-label="Filter transaction type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as "all" | "income" | "expense")}
          className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select 
          aria-label="Filter transaction category"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-10 rounded-md border border-input bg-transparent px-3 text-sm max-w-[200px]"
        >
          <option value="all">All Categories</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input 
          type="date"
          aria-label="Filter transaction date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
        />
        {(searchQuery || filterType !== "all" || filterCategory !== "all" || filterDate) && (
          <button 
            onClick={() => {
              setSearchQuery("")
              setFilterType("all")
              setFilterCategory("all")
              setFilterDate("")
            }}
            className="text-sm text-primary hover:underline px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center flex-col gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading transactions...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Transaction</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody 
                className="divide-y divide-border"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center"
                      >
                        <div className="bg-muted h-12 w-12 rounded-full flex items-center justify-center mb-4">
                          <Search className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <p className="font-medium text-base text-foreground">No transactions found</p>
                        <p className="text-sm mt-1">Try adjusting your filters or add a new transaction.</p>
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredTransactions.map((t) => (
                      <motion.tr 
                        key={t.id} 
                        className="hover:bg-muted/50 transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        layout
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "p-2 rounded-full flex items-center justify-center flex-shrink-0",
                              t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            )}>
                              {t.type === 'income' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="font-medium max-w-[200px] truncate">{t.description}</p>
                              {t.notes && <p className="text-xs text-muted-foreground max-w-[200px] truncate">{t.notes}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                            {t.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                          {t.date}
                        </td>
                        <td className={cn(
                          "px-6 py-4 text-right font-medium whitespace-nowrap",
                          t.type === 'income' ? 'text-emerald-500' : ''
                        )}>
                          {t.type === 'income' ? '+' : '-'}{currencySymbol}{Number(t.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button 
                            onClick={() => handleEdit(t)}
                            className="p-2 hover:text-primary transition-colors inline-block"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(t.id)}
                            className="p-2 hover:text-destructive transition-colors inline-block ml-1"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        title={editingTransaction ? "Edit Transaction" : "Add Transaction"}
      >
        <TransactionForm 
          initialData={editingTransaction} 
          onSubmit={handleFormSubmit}
          onCancel={() => setIsDialogOpen(false)}
          customCategories={customCategories}
          currencySymbol={currencySymbol}
        />
      </Dialog>
    </motion.div>
  )
}
