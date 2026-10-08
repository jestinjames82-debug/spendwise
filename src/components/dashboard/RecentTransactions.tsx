"use client"

import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { useProfile } from "@/components/layout/ProfileProvider"
import { Transaction } from "@/components/transactions/TransactionForm"

export function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  const { currencySymbol } = useProfile()
  const recent = transactions.slice(0, 5) // Show only latest 5

  return (
    <div className="min-w-0 rounded-xl border bg-card text-card-foreground shadow-sm lg:col-span-3">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <h3 className="tracking-tight text-lg font-bold">Recent Transactions</h3>
      </div>
      <div className="p-6">
        {recent.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No recent transactions.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {recent.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full flex items-center justify-center flex-shrink-0 ${
                    transaction.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none max-w-[150px] sm:max-w-[200px] truncate">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground mt-1">{transaction.category} • {transaction.date}</p>
                  </div>
                </div>
                <div className={`font-medium whitespace-nowrap ${
                  transaction.type === 'income' ? 'text-emerald-500' : ''
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{Number(transaction.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
