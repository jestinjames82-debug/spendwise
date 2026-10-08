"use client"

import * as React from "react"
import { PlusCircle, Loader2, Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Dialog } from "@/components/ui/Dialog"
import { CategoryForm, CategoryFormData } from "@/components/categories/CategoryForm"
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/lib/constants"
import { useTransactions } from "@/components/layout/TransactionsProvider"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { errorMessage } from "@/lib/utils"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

export default function CategoriesPage() {
  const { customCategories, isLoading, addCategory, deleteCategory } = useTransactions()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState("")

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this custom category?")) {
      try {
        setDeleteError("")
        await deleteCategory(id)
      } catch (error) {
        console.error("Failed to delete", error)
        setDeleteError(errorMessage(error, "Failed to delete category."))
      }
    }
  }

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      await addCategory(data)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to save category", error)
      throw error 
    }
  }

  const expenseCategories = [
    ...DEFAULT_EXPENSE_CATEGORIES.map(name => ({ id: undefined, name, type: 'expense', isDefault: true })),
    ...customCategories.filter(c => c.type === 'expense').map(c => ({ ...c, isDefault: false }))
  ]

  const incomeCategories = [
    ...DEFAULT_INCOME_CATEGORIES.map(name => ({ id: undefined, name, type: 'income', isDefault: true })),
    ...customCategories.filter(c => c.type === 'income').map(c => ({ ...c, isDefault: false }))
  ]

  return (
    <motion.div 
      className="flex-1 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground mt-1">Manage your income and expense categories.</p>
        </div>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 py-2 rounded-md font-medium transition-colors"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Custom Category
        </button>
      </div>

      {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Expense Categories */}
        <div className="border rounded-xl bg-card shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="bg-rose-500/10 text-rose-500 p-2 rounded-full">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold">Expense Categories</h3>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <motion.ul 
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {expenseCategories.map((cat, i) => (
                  <motion.li 
                    key={cat.id || `default-${i}`}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/20"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    layout
                  >
                    <span className="font-medium">{cat.name}</span>
                    {cat.isDefault ? (
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Default</span>
                    ) : (
                      <button 
                        onClick={() => cat.id && handleDelete(cat.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        title="Delete custom category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </div>

        {/* Income Categories */}
        <div className="border rounded-xl bg-card shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-full">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold">Income Categories</h3>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <motion.ul 
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {incomeCategories.map((cat, i) => (
                  <motion.li 
                    key={cat.id || `default-${i}`} 
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/20"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    layout
                  >
                    <span className="font-medium">{cat.name}</span>
                    {cat.isDefault ? (
                      <span className="text-xs text-muted-foreground uppercase font-semibold">Default</span>
                    ) : (
                      <button 
                        onClick={() => cat.id && handleDelete(cat.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        title="Delete custom category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </div>
      </div>

      <Dialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        title="Add Custom Category"
      >
        <CategoryForm 
          onSubmit={handleFormSubmit}
          onCancel={() => setIsDialogOpen(false)}
        />
      </Dialog>
    </motion.div>
  )
}
