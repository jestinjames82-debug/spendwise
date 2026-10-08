"use client"

import * as React from "react"
import { Edit2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface BudgetCardProps {
  category: string
  budgetAmount: number
  spentAmount: number
  currencySymbol?: string
  onEdit: () => void
  onDelete: () => void
}

export function BudgetCard({ category, budgetAmount, spentAmount, currencySymbol = "₹", onEdit, onDelete }: BudgetCardProps) {
  const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0
  const isOverBudget = spentAmount > budgetAmount
  const isNearBudget = percentage >= 80 && !isOverBudget

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 relative group transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{category}</h3>
        
        <div className="flex items-center space-x-1">
          <button 
            onClick={onEdit}
            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors"
            title="Edit budget"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button 
            onClick={onDelete}
            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-destructive transition-colors"
            title="Delete budget"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <span className="text-2xl font-bold">{currencySymbol}{spentAmount.toLocaleString()}</span>
          <span className="text-muted-foreground text-sm ml-2">spent</span>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          of {currencySymbol}{budgetAmount.toLocaleString()}
        </div>
      </div>

      <div className="h-3 w-full bg-muted rounded-full overflow-hidden mb-2">
        <div 
          className={cn(
            "h-full transition-all duration-500 rounded-full",
            isOverBudget ? "bg-destructive" : isNearBudget ? "bg-amber-500" : "bg-emerald-500"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className={cn(
          "font-medium",
          isOverBudget ? "text-destructive" : isNearBudget ? "text-amber-500" : "text-emerald-500"
        )}>
          {percentage.toFixed(0)}%
        </span>
        <span className="text-muted-foreground">
          {isOverBudget 
            ? `Over budget by ${currencySymbol}${(spentAmount - budgetAmount).toLocaleString()}`
            : `${currencySymbol}${(budgetAmount - spentAmount).toLocaleString()} remaining`
          }
        </span>
      </div>
    </div>
  )
}
