"use client"

import * as React from "react"
import { Loader2, PieChart as PieChartIcon } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts"
import { format, parseISO } from "date-fns"
import { OverviewCharts } from "@/components/dashboard/OverviewCharts"
import { useProfile } from "@/components/layout/ProfileProvider"
import { useTransactions } from "@/components/layout/TransactionsProvider"
import { motion, Variants } from "framer-motion"
import { localDate } from "@/lib/utils"

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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#64748b']

export default function AnalyticsPage() {
  const { currencySymbol } = useProfile()
  const { transactions, isLoading } = useTransactions()

  // Month Selection state
  const currentMonthStr = localDate().slice(0, 7)
  const [selectedMonth, setSelectedMonth] = React.useState<string>(currentMonthStr)

  // Process pie chart data for selected month
  const categoryData = React.useMemo(() => {
    const dataMap = new Map<string, number>()
    
    transactions.forEach(t => {
      if (t.type === 'expense' && t.date.startsWith(selectedMonth)) {
        dataMap.set(t.category, (dataMap.get(t.category) ?? 0) + Number(t.amount))
      }
    })

    return Array.from(dataMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) // Sort largest first
  }, [transactions, selectedMonth])

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
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground mt-1">Deep dive into your financial habits.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <OverviewCharts transactions={transactions} />
        
        <div className="min-w-0 lg:col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
          <div className="p-6 border-b flex flex-wrap gap-3 items-center justify-between">
            <div>
              <h3 className="tracking-tight text-lg font-bold">Expense Breakdown</h3>
              <p className="text-sm text-muted-foreground">By category</p>
            </div>
            <input 
              type="month"
              aria-label="Expense breakdown month"
              value={selectedMonth}
              onChange={(e) => { if (/^\d{4}-\d{2}$/.test(e.target.value)) setSelectedMonth(e.target.value) }}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            />
          </div>
          <div className="p-3 sm:p-6 h-[350px] flex flex-col">
            {categoryData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <PieChartIcon className="h-12 w-12 opacity-20 mb-4" />
                <p>No expenses for {format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius="45%"
                    outerRadius="75%"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => [`${currencySymbol}${Number(value).toLocaleString()}`, undefined]}
                    contentStyle={{ 
                      backgroundColor: 'var(--card)',
                      color: 'var(--card-foreground)',
                      borderRadius: '8px', 
                      border: '1px solid var(--border)',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
