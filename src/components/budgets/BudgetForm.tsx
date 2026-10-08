"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { cn, errorMessage } from "@/lib/utils"

const budgetSchema = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
})

export type BudgetFormData = z.infer<typeof budgetSchema>

export interface Budget extends BudgetFormData {
  id: string
  month: string
  createdAt: Date
}

interface BudgetFormProps {
  initialData?: Budget | null
  categories: string[]
  currencySymbol?: string
  onSubmit: (data: BudgetFormData) => Promise<void>
  onCancel: () => void
}

export function BudgetForm({ initialData, categories, currencySymbol = "₹", onSubmit, onCancel }: BudgetFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: initialData || {
      category: "",
      amount: undefined,
    },
  })

  const handleFormSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true)
    setSubmitError("")
    try {
      await onSubmit(data)
    } catch (error) {
      setSubmitError(errorMessage(error, "Could not save budget. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
      <div className="space-y-4">
        <div>
          <label htmlFor="budget-category" className="text-sm font-medium">Category</label>
          <select
            id="budget-category"
            className={cn(
              "mt-1 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
              errors.category && "border-destructive",
              initialData && "opacity-50 cursor-not-allowed"
            )}
            {...register("category")}
            disabled={!!initialData} // Usually you don't change category of an existing budget, just amount
          >
            <option value="">Select a category</option>
            {Array.from(new Set([...categories, ...(initialData ? [initialData.category] : [])])).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <label htmlFor="budget-amount" className="text-sm font-medium">Monthly Budget Amount ({currencySymbol})</label>
          <input
            id="budget-amount"
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
          {initialData ? 'Update Budget' : 'Save Budget'}
        </button>
      </div>
    </form>
  )
}
