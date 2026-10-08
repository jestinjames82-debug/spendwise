"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { createHash, randomBytes } from "node:crypto"
import { z } from "zod"
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/lib/constants"

const kindSchema = z.enum(["income", "expense"])
const amountSchema = z.number().finite().positive("Amount must be greater than zero").max(1e12)
const nameSchema = z.string().trim().min(1).max(100)
const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Choose a valid month")
const emailSchema = z.string().trim().email().max(254)
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").refine(value => Buffer.byteLength(value, "utf8") <= 72, "Password must be at most 72 UTF-8 bytes")
const transactionSchema = z.object({
  amount: amountSchema,
  type: kindSchema,
  category: nameSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
    const date = new Date(`${value}T12:00:00Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  }, "Choose a valid date"),
  description: z.string().trim().min(1).max(500),
  notes: z.string().trim().max(2000).nullable().optional(),
})
const publicProfile = { id: true, email: true, name: true, currency: true, image: true } as const

async function userId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Please sign in to continue")
  return session.user.id
}

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value)
  if (!result.success) throw new Error(result.error.issues[0]?.message || "Invalid input")
  return result.data
}

async function requireCategory(owner: string, name: string, type: "income" | "expense") {
  const defaults = type === "expense" ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES
  if (defaults.includes(name)) return
  if (!await prisma.category.findFirst({ where: { userId: owner, name, type } })) {
    throw new Error("Choose an available category for this transaction type")
  }
}

export async function getUserTransactions() {
  return prisma.transaction.findMany({ where: { userId: await userId() }, orderBy: { date: "desc" } })
}

export async function addTransactionAction(input: unknown) {
  const owner = await userId()
  const data = parse(transactionSchema, input)
  await requireCategory(owner, data.category, data.type)
  const tx = await prisma.transaction.create({ data: { ...data, userId: owner } })
  revalidatePath("/dashboard", "layout")
  return tx
}

export async function updateTransactionAction(id: string, input: unknown) {
  const owner = await userId()
  const data = parse(transactionSchema, input)
  const existing = await prisma.transaction.findFirst({ where: { id, userId: owner } })
  if (!existing) throw new Error("Transaction was not found")
  // Imported transactions can retain a historical category that no longer exists.
  if (data.category !== existing.category || data.type !== existing.type) {
    await requireCategory(owner, data.category, data.type)
  }
  const tx = await prisma.transaction.update({ where: { id, userId: owner }, data })
  revalidatePath("/dashboard", "layout")
  return tx
}

export async function deleteTransactionAction(id: string) {
  await prisma.transaction.delete({ where: { id, userId: await userId() } })
  revalidatePath("/dashboard", "layout")
}

export async function getUserCategories() {
  return prisma.category.findMany({ where: { userId: await userId() }, orderBy: { createdAt: "desc" } })
}

export async function addCategoryAction(input: unknown) {
  const owner = await userId()
  const data = parse(z.object({ name: nameSchema, type: kindSchema }), input)
  const defaults = data.type === "expense" ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES
  const existing = await prisma.category.findMany({ where: { userId: owner, type: data.type }, select: { name: true } })
  if ([...defaults, ...existing.map(item => item.name)].some(name => name.toLowerCase() === data.name.toLowerCase())) {
    throw new Error("A category with this name already exists")
  }
  const category = await prisma.category.create({ data: { ...data, userId: owner } })
  revalidatePath("/dashboard", "layout")
  return category
}

export async function deleteCategoryAction(id: string) {
  const owner = await userId()
  const category = await prisma.category.findFirst({ where: { id, userId: owner } })
  if (!category) throw new Error("Category was not found")
  const [transactions, budgets] = await Promise.all([
    prisma.transaction.count({ where: { userId: owner, category: category.name, type: category.type } }),
    category.type === "expense" ? prisma.budget.count({ where: { userId: owner, category: category.name } }) : Promise.resolve(0),
  ])
  if (transactions || budgets) throw new Error("This category is used by transactions or budgets. Remove or reassign those first.")
  await prisma.category.delete({ where: { id, userId: owner } })
  revalidatePath("/dashboard", "layout")
}

export async function getUserProfile() {
  return prisma.user.findUnique({ where: { id: await userId() }, select: publicProfile })
}

export async function updateUserProfile(input: unknown) {
  const data = parse(z.object({
    name: z.string().trim().max(100).nullable().optional(),
    currency: z.enum(["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD"]).optional(),
  }).strict(), input)
  const user = await prisma.user.update({ where: { id: await userId() }, data, select: publicProfile })
  revalidatePath("/dashboard", "layout")
  return user
}

export async function getUserBudgets(month: string) {
  return prisma.budget.findMany({ where: { userId: await userId(), month: parse(monthSchema, month) } })
}

export async function addBudgetAction(input: unknown) {
  const owner = await userId()
  const data = parse(z.object({ category: nameSchema, amount: amountSchema, month: monthSchema }), input)
  await requireCategory(owner, data.category, "expense")
  if (await prisma.budget.findFirst({ where: { userId: owner, category: data.category, month: data.month } })) {
    throw new Error("A budget for this category and month already exists. Edit the existing budget.")
  }
  const budget = await prisma.budget.create({ data: { ...data, userId: owner } })
  revalidatePath("/dashboard", "layout")
  return budget
}

export async function updateBudgetAction(id: string, input: unknown) {
  const data = parse(z.object({ amount: amountSchema }).strict(), input)
  const budget = await prisma.budget.update({ where: { id, userId: await userId() }, data })
  revalidatePath("/dashboard", "layout")
  return budget
}

export async function deleteBudgetAction(id: string) {
  await prisma.budget.delete({ where: { id, userId: await userId() } })
  revalidatePath("/dashboard", "layout")
}

export async function registerUser(input: unknown) {
  const data = parse(z.object({ email: emailSchema, password: passwordSchema, full_name: z.string().trim().max(100).optional() }), input)
  const email = data.email.toLowerCase()
  if (await prisma.user.findFirst({ where: { OR: [{ email }, { email: data.email }] } })) throw new Error("Email already in use")
  await prisma.user.create({ data: { email, password: await bcrypt.hash(data.password, 12), name: data.full_name || null } })
  return { success: true }
}

export async function requestPasswordReset(input: unknown) {
  const email = parse(emailSchema, input)
  if (process.env.NODE_ENV !== "development") {
    return { success: false, message: "Password-reset email delivery is not configured. Contact the app owner for help." }
  }
  const user = await prisma.user.findFirst({ where: { OR: [{ email: email.toLowerCase() }, { email }] } })
  if (user?.email) {
    const identifier = `password-reset:${user.id}`
    const recent = await prisma.verificationToken.findFirst({ where: { identifier, expires: { gt: new Date(Date.now() + 29 * 60 * 1000) } } })
    if (!recent) {
      const token = randomBytes(32).toString("hex")
      await prisma.$transaction([
        prisma.verificationToken.deleteMany({ where: { identifier } }),
        prisma.verificationToken.create({ data: { identifier, token: createHash("sha256").update(token).digest("hex"), expires: new Date(Date.now() + 30 * 60 * 1000) } }),
      ])
      const link = new URL("/auth/update-password", process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000")
      link.searchParams.set("token", token)
      console.info("[SpendWise local password reset] Open this private, single-use link:", link.toString())
    }
  }
  return { success: true, message: "Email delivery is not configured for this local app. If the account exists, a private reset link was printed in the server console. The link expires in 30 minutes; requests within one minute reuse the existing link." }
}

export async function resetPassword(tokenInput: unknown, passwordInput: unknown) {
  const token = parse(z.string().regex(/^[a-f0-9]{64}$/), tokenInput)
  const password = parse(passwordSchema, passwordInput)
  const digest = createHash("sha256").update(token).digest("hex")
  const record = await prisma.verificationToken.findUnique({ where: { token: digest } })
  if (!record || !record.identifier.startsWith("password-reset:") || record.expires <= new Date()) {
    return { success: false, message: "This reset link is invalid or expired. Request a new link." }
  }
  const hashedPassword = await bcrypt.hash(password, 12)
  await prisma.$transaction(async db => {
    const consumed = await db.verificationToken.deleteMany({ where: { token: digest, expires: { gt: new Date() } } })
    if (!consumed.count) throw new Error("This reset link has already been used or expired")
    await db.user.update({ where: { id: record.identifier.slice("password-reset:".length) }, data: { password: hashedPassword } })
  })
  return { success: true, message: "Your password has been updated. Sign in with your new password." }
}
