import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm"

export const metadata = { title: "Update Password | SpendWise", robots: { index: false, follow: false } }

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8">
        <h1 className="text-2xl font-semibold">Choose a new password</h1>
        <UpdatePasswordForm token={typeof token === "string" ? token : ""} />
      </section>
    </main>
  )
}
