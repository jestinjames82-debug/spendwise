"use client"

import * as React from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { format, parseISO, subMonths, isAfter, startOfMonth } from "date-fns"
import { useProfile } from "@/components/layout/ProfileProvider"
import { Transaction } from "@/components/transactions/TransactionForm"

export function OverviewCharts({ transactions }: { transactions: Transaction[] }) {
  const { currencySymbol } = useProfile()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
  }, [])

  // Process data for the last 6 months
  const chartData = React.useMemo(() => {
    const today = new Date()
    const sixMonthsAgo = startOfMonth(subMonths(today, 5))
    
    // Initialize array for last 6 months
    const dataMap: Record<string, { month: string; income: number; expense: number }> = {}
    
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(today, i)
      const key = format(d, 'yyyy-MM')
      dataMap[key] = { month: format(d, 'MMM yyyy'), income: 0, expense: 0 }
    }

    transactions.forEach(t => {
      const date = parseISO(t.date)
      if (!isAfter(date, sixMonthsAgo) && date.getTime() < sixMonthsAgo.getTime()) return
      
      const key = format(date, 'yyyy-MM')
      if (dataMap[key]) {
        if (t.type === 'income') {
          dataMap[key].income += Number(t.amount)
        } else {
          dataMap[key].expense += Number(t.amount)
        }
      }
    })

    return Object.values(dataMap)
  }, [transactions])

  if (!isMounted) {
    return <div className="min-w-0 lg:col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex items-center justify-center min-h-[350px]">Loading chart...</div>
  }

  return (
    <div className="min-w-0 lg:col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
      <div className="p-6 border-b">
        <h3 className="tracking-tight text-lg font-bold">Income & Expenses Overview</h3>
        <p className="text-sm text-muted-foreground">Last 6 months</p>
      </div>
      <div className="p-3 sm:p-6 h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickFormatter={(value) => `${currencySymbol}${value.toLocaleString()}`}
              dx={-10}
            />
            <Tooltip 
              cursor={{ fill: 'var(--muted)', fillOpacity: 0.5 }}
              contentStyle={{ 
                backgroundColor: 'var(--card)',
                color: 'var(--card-foreground)',
                borderRadius: '8px', 
                border: '1px solid var(--border)',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value) => [`${currencySymbol}${Number(value).toLocaleString()}`, undefined]}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px' }}
            />
            <Bar 
              dataKey="income" 
              name="Income"
              fill="#10b981" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={40}
            />
            <Bar 
              dataKey="expense" 
              name="Expenses"
              fill="#f43f5e" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
