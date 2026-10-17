# SpendWise

A full-stack personal finance web app for recording income and expenses, managing monthly category budgets, and visualizing spending.

**[Live demo](https://spendwise-pennypath.vercel.app/)**

## Features

- **Transactions:** Add, edit, and delete income or expenses with a date, category, description, and optional notes. Search descriptions and notes; filter by type, category, or exact date.
- **Categories:** Use default income/expense categories or create custom ones. Categories referenced by transactions or budgets cannot be deleted.
- **Budgets:** Set monthly limits by expense category, edit limits, and compare them with spending for the selected month.
- **Analytics:** View six months of income versus expenses in a bar chart and a selected month's expense breakdown in a category chart.
- **Accounts:** Register and sign in with email/password; financial records are scoped to the authenticated user.
- **Responsive UI:** Desktop and mobile layouts, including mobile dashboard navigation.

## Technical implementation

| Layer | Implementation |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| UI and charts | Tailwind CSS 4, Recharts |
| Authentication | NextAuth v5 beta, Prisma adapter, credentials provider, JWT sessions |
| Data access | Prisma 5; SQLite locally and PostgreSQL for hosted builds |
| Validation | Zod schemas in Server Actions |
| Hosting | Vercel configuration with a PostgreSQL-specific build command |

Implementation details are available directly in the source:

- [Server Actions](src/app/actions.ts) handle transaction, category, budget, and profile operations. They derive ownership from the session, validate inputs, and scope database operations by user ID.
- [Authentication](src/auth.ts) verifies bcrypt password hashes. Registration hashes passwords with bcrypt; password changes invalidate existing sessions on their next request.
- [Prisma schemas](prisma/) define users, transactions, categories, budgets, and authentication records.
- [Dashboard components](src/components/dashboard/) and [analytics](src/app/dashboard/analytics/page.tsx) aggregate transaction data for the charts.

## Deployment evidence

[Vercel configuration](vercel.json) installs dependencies with `npm ci` and runs `npm run vercel-build`. That script generates the production Prisma client, applies committed migrations, and builds Next.js.

The [production schema](prisma/schema.production.prisma) uses `DATABASE_URL` for PostgreSQL and `DATABASE_URL_UNPOOLED` for the direct migration connection. [.env.example](.env.example) documents Neon's pooled/direct connection setup and authentication variables.

Repository milestones on **8 October 2026**:

- [Repaired app and PostgreSQL setup](https://github.com/jestinjames82-debug/spendwise/commit/2ae4d85d4ab48fb95dc6f25fc2e4beced4103b90).
- [Vercel production build configuration](https://github.com/jestinjames82-debug/spendwise/commit/75037f94176598f2126d0b14f5dbabab52dfd25a).
- [Neon unpooled connection variable for migrations](https://github.com/jestinjames82-debug/spendwise/commit/df2da77a994fd4306aab9e03c9764d957bda2497).

## Run locally

```bash
git clone https://github.com/jestinjames82-debug/spendwise.git
cd spendwise
npm ci
cp .env.example .env.local
```

Replace `AUTH_SECRET` in `.env.local` with a random secret; the example file includes a generation command. Keep `AUTH_URL=http://localhost:3000`, then run:

```bash
npm run db:setup
npm run dev
```

Open [localhost:3000](http://localhost:3000). Local development uses SQLite. Available checks are `npm run lint` and `npm run build`.

For Vercel, configure `AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST`, `DATABASE_URL`, and `DATABASE_URL_UNPOOLED` as described in the example environment file.

## Next improvements

These are proposed work, not completed features:

- **Password recovery:** Configure production email delivery. The current reset flow only prints a private reset link to the server console in development; production requests report that email delivery is unavailable.
- **Regression coverage:** Add automated tests for user ownership checks, transaction validation, duplicate monthly budgets, and password-reset token handling.
- **Monthly reports:** Extend the existing monthly category breakdown with downloadable spending summaries.
- **Savings goals:** Add target amounts and progress tracking alongside the existing expense budgets.

## Author

**Jestin James** — B.Tech Computer Science and Engineering (AI & ML).
