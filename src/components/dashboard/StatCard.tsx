import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  amount: string
  trend?: string
  trendUp?: boolean
  icon: LucideIcon
  className?: string
}

export function StatCard({ title, amount, trend, trendUp, icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)}>
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="p-6 pt-0">
        <div className="text-2xl font-bold">{amount}</div>
        {trend && (
          <p className={cn("text-xs mt-1", trendUp ? "text-emerald-500" : "text-rose-500")}>
            {trend} from last month
          </p>
        )}
      </div>
    </div>
  )
}
