"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { cn, errorMessage, localDate } from "@/lib/utils"

import type { Category, Transaction } from "@/components/layout/TransactionsProvider"
export type { Transaction } from "@/components/layout/TransactionsProvider"
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/lib/constants"

const transactionSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  type: z.enum(["income", "expense"]),
  category: z.string().trim().min(1, { message: "Category is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  description: z.string().trim().min(1, { message: "Description is required" }),
  notes: z.string().optional(),
})

export type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  initialData?: Transaction | null
  initialType?: "income" | "expense"
  onSubmit: (data: TransactionFormData) => Promise<void>
  onCancel: () => void
  customCategories?: Category[]
  currencySymbol?: string
}

export function TransactionForm({ initialData, initialType = "expense", onSubmit, onCancel, customCategories = [], currencySymbol = "₹" }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState("")

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: initialData?.amount,
      type: initialData ? (initialData.type === "income" ? "income" : "expense") : initialType,
      category: initialData?.category ?? "",
      date: initialData?.date ?? localDate(),
      description: initialData?.description ?? "",
      notes: initialData?.notes ?? "",
    },
  })

  const type = useWatch({ control, name: "type" })

  const expenseCategories = [...DEFAULT_EXPENSE_CATEGORIES, ...customCategories.filter(c => c.type === 'expense').map(c => c.name)]
  const incomeCategories = [...DEFAULT_INCOME_CATEGORIES, ...customCategories.filter(c => c.type === 'income').map(c => c.name)]
  const categories = Array.from(new Set([
    ...(type === "income" ? incomeCategories : expenseCategories),
    ...(initialData?.type === type ? [initialData.category] : [])
  ]))

  const selectType = (nextType: "income" | "expense") => {
    if (nextType !== type) {
      setValue("type", nextType)
      setValue("category", "")
    }
  }

  const handleFormSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true)
    setSubmitError("")
    try {
      await onSubmit(data)
    } catch (error) {
      setSubmitError(errorMessage(error, "Could not save transaction. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm font-medium">Type</label>
          <div className="flex rounded-md shadow-sm mt-1">
            <button
              type="button"
              aria-pressed={type === "expense"}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-l-md border",
                type === "expense" 
                  ? "bg-rose-500 text-white border-rose-500" 
                  : "bg-background text-foreground border-input hover:bg-muted"
              )}
              onClick={() => selectType("expense")}
            >
              Expense
            </button>
            <button
              type="button"
              aria-pressed={type === "income"}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-r-md border border-l-0",
                type === "income" 
                  ? "bg-emerald-500 text-white border-emerald-500" 
                  : "bg-background text-foreground border-input hover:bg-muted"
              )}
              onClick={() => selectType("income")}
            >
              Income
            </button>
          </div>
          {/* Hidden input to register type in hook-form */}
          <input type="hidden" {...register("type")} />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="transaction-amount" className="text-sm font-medium">Amount ({currencySymbol})</label>
          <input
            id="transaction-amount"
            type="number"
            step="0.01"
            className={cn(
              "mt-1 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
              errors.amount && "border-destructive"
            )}
            placeholder="0.00"
            {...register("amount")}
          />
          {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="transaction-date" className="text-sm font-medium">Date</label>
          <input
            id="transaction-date"
            type="date"
            className={cn(
              "mt-1 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
              errors.date && "border-destructive"
            )}
            {...register("date")}
          />
          {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
        </div>

        <div className="col-span-2">
          <label htmlFor="transaction-description" className="text-sm font-medium">Description</label>
          <input
            id="transaction-description"
            type="text"
            className={cn(
              "mt-1 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
              errors.description && "border-destructive"
            )}
            placeholder="E.g., Groceries at BigBazaar"
            {...register("description")}
          />
          {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
        </div>

        <div className="col-span-2">
          <label htmlFor="transaction-category" className="text-sm font-medium">Category</label>
          <select
            id="transaction-category"
            className={cn(
              "mt-1 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
              errors.category && "border-destructive"
            )}
            {...register("category")}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
        </div>

        <div className="col-span-2">
          <label htmlFor="transaction-notes" className="text-sm font-medium">Notes (Optional)</label>
          <textarea
            id="transaction-notes"
            className="mt-1 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[80px]"
            placeholder="Any additional details..."
            {...register("notes")}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-md border border-input bg-background hover:bg-muted text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium flex items-center"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update Transaction' : 'Save Transaction'}
        </button>
      </div>
    </form>
  )
}
