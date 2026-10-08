"use client"

import * as React from "react"
import { StatCard } from "@/components/dashboard/StatCard"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"
import { OverviewCharts } from "@/components/dashboard/OverviewCharts"
import { Dialog } from "@/components/ui/Dialog"
import { TransactionForm, TransactionFormData } from "@/components/transactions/TransactionForm"
import { localDate } from "@/lib/utils"
import { TrendingUp, TrendingDown, PiggyBank, PlusCircle, MinusCircle, Loader2, Wallet } from "lucide-react"
import { useProfile } from "@/components/layout/ProfileProvider"
import { useTransactions } from "@/components/layout/TransactionsProvider"
import { motion, Variants } from "framer-motion"

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

export default function DashboardOverview() {
  const { currencySymbol } = useProfile()
  const { transactions, customCategories, isLoading, addTransaction } = useTransactions()
  const [addingType, setAddingType] = React.useState<"income" | "expense" | null>(null)

  const handleAdd = async (data: TransactionFormData) => {
    await addTransaction(data)
    setAddingType(null)
  }

  // Compute stats
  const currentMonth = localDate().slice(0, 7)
  
  let totalIncome = 0
  let totalExpense = 0
  let monthlyIncome = 0
  let monthlyExpense = 0
  
  transactions.forEach(t => {
    const amount = Number(t.amount)
    if (t.type === 'income') {
      totalIncome += amount
      if (t.date.startsWith(currentMonth)) monthlyIncome += amount
    } else {
      totalExpense += amount
      if (t.date.startsWith(currentMonth)) monthlyExpense += amount
    }
  })
  
  const totalBalance = totalIncome - totalExpense
  const totalSavings = totalBalance // or however they define savings
  const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : "0"

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div 
      className="flex-1 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your money today.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setAddingType("income")} className="inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-4 py-2 rounded-md font-medium transition-colors">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Income
          </button>
          <button onClick={() => setAddingType("expense")} className="inline-flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white h-10 px-4 py-2 rounded-md font-medium transition-colors">
            <MinusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </button>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Balance"
          amount={`${currencySymbol}${totalBalance.toLocaleString()}`}
          icon={Wallet}
        />
        <StatCard
          title="Monthly Income"
          amount={`${currencySymbol}${monthlyIncome.toLocaleString()}`}
          icon={TrendingUp}
          trendUp={true}
        />
        <StatCard
          title="Monthly Expenses"
          amount={`${currencySymbol}${monthlyExpense.toLocaleString()}`}
          icon={TrendingDown}
          trendUp={false}
        />
        <StatCard
          title="Total Savings"
          amount={`${currencySymbol}${totalSavings.toLocaleString()}`}
          trend={`${savingsRate}% of income`}
          trendUp={totalSavings >= 0}
          icon={PiggyBank}
        />
      </motion.div>
      
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <OverviewCharts transactions={transactions} />
        <RecentTransactions transactions={transactions} />
      </motion.div>
      <Dialog isOpen={addingType !== null} onClose={() => setAddingType(null)} title={addingType === "income" ? "Add Income" : "Add Expense"}>
        <TransactionForm initialType={addingType ?? "expense"} onSubmit={handleAdd} onCancel={() => setAddingType(null)} customCategories={customCategories} currencySymbol={currencySymbol} />
      </Dialog>
    </motion.div>
  )
}
