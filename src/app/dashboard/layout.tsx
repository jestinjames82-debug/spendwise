import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { ProfileProvider } from "@/components/layout/ProfileProvider"
import { TransactionsProvider } from "@/components/layout/TransactionsProvider"
import { TopHeader } from "@/components/layout/TopHeader"
import { DataStatus } from "@/components/layout/DataStatus"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProfileProvider>
      <TransactionsProvider>
        <div className="flex min-h-screen flex-col">
          <TopHeader />
          <div className="flex flex-1 container mx-auto px-4 md:px-0">
            <DashboardSidebar />
            <main className="min-w-0 flex-1 overflow-x-hidden md:pl-8 py-8">
              <DataStatus />
              {children}
            </main>
          </div>
        </div>
      </TransactionsProvider>
    </ProfileProvider>
  )
}
