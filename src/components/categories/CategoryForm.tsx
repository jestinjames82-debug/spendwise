"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { cn, errorMessage } from "@/lib/utils"

const categorySchema = z.object({
  name: z.string().trim().min(1, { message: "Category name is required" }),
  type: z.enum(["income", "expense"]),
})

export type CategoryFormData = z.infer<typeof categorySchema>

export type { Category } from "@/components/layout/TransactionsProvider"

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => Promise<void>
  onCancel: () => void
}

export function CategoryForm({ onSubmit, onCancel }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState("")

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      type: "expense",
    },
  })

  const type = useWatch({ control, name: "type" })

  const handleFormSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    setSubmitError("")
    try {
      await onSubmit(data)
    } catch (error) {
      setSubmitError(errorMessage(error, "Could not save category. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
      <div className="space-y-4">
        <div>
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
              onClick={() => setValue("type", "expense")}
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
              onClick={() => setValue("type", "income")}
            >
              Income
            </button>
          </div>
          <input type="hidden" {...register("type")} />
        </div>

        <div>
          <label htmlFor="category-name" className="text-sm font-medium">Category Name</label>
          <input
            id="category-name"
            type="text"
            className={cn(
              "mt-1 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
              errors.name && "border-destructive"
            )}
            placeholder="e.g., Freelance Project"
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
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
          Save Category
        </button>
      </div>
    </form>
  )
}
