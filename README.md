# SpendWise

SpendWise tracks personal income, expenses, categories, monthly budgets, and spending charts. It uses Next.js 16 with the App Router, React 19, Tailwind CSS 4, Recharts, and Prisma 5.22. Authentication uses NextAuth/Auth.js credentials, bcrypt password hashes, and JWT sessions. Supabase is not required; files in `supabase/` are from the earlier implementation.

## Run locally

Install a supported Node.js LTS release (Node 22 recommended) and npm, then run these commands from this folder:

```sh
npm ci
```

Copy `.env.example` to `.env.local`. Replace `AUTH_SECRET` with the output of:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Keep `AUTH_URL=http://localhost:3000`, then initialize the local database and start the app:

```sh
npm run db:setup
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login), create an account, and sign in. Next.js defaults to port 3000; if that port is occupied, use the URL printed by the server and update `AUTH_URL` for that port.

Local development uses `prisma/schema.prisma` and stores data in `prisma/dev.db`. `db:setup` uses Prisma `db push` with this SQLite schema. It does not reset or seed the database. Do not use `prisma migrate deploy` with the local schema: the checked-in migrations are for PostgreSQL only.

`npm run dev` and `npm run build` regenerate the SQLite client before starting. To run an optimized local build:

```sh
npm run build
npm start
```

Keep the local database backed up separately. Database files, secrets, generated output, and dependencies are excluded from Git and Vercel uploads.

## Deploy to Vercel

The hosted app uses a persistent PostgreSQL database. Vercel's application filesystem cannot be used to persist `dev.db`. `prisma/schema.production.prisma` contains the same models as the local SQLite schema, with a PostgreSQL datasource. The migration under `prisma/migrations/` creates the initial PostgreSQL tables and indexes; it does not copy local accounts or transactions.

1. Import the GitHub repository as a Next.js project in Vercel.
2. Connect a Neon PostgreSQL database through Vercel Marketplace.
3. Configure the following environment variables for the Production environment:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Neon's pooled PostgreSQL connection string; its hostname contains `-pooler`. |
| `DATABASE_URL_UNPOOLED` | The matching unpooled connection string for migrations, supplied by the Neon integration. |
| `AUTH_SECRET` | A new random secret generated with the command above; keep it stable between deployments. |
| `AUTH_URL` | The final HTTPS production origin, without a path, such as `https://your-project.vercel.app`. |
| `AUTH_TRUST_HOST` | `true` for Vercel's trusted reverse proxy. |

Use the database provider's actual URLs, including `sslmode=require`. A `connect_timeout=15` query parameter allows extra time for a sleeping Neon database to wake. The Neon integration supplies the pooled URL as `DATABASE_URL` and the unpooled URL as `DATABASE_URL_UNPOOLED`. If another provider uses different names, map its connection strings to those variables.

4. Set the Vercel build command to `npm run vercel-build` and deploy. This command generates the PostgreSQL Prisma client, applies committed migrations with `prisma migrate deploy`, then runs `next build`. `postinstall` generates a local client during dependency installation; `vercel-build` deliberately replaces it with the hosted client before building.
5. Open the deployed site, create a hosted account, add a transaction, refresh, and verify that the transaction and dashboard totals persist. Local accounts and data remain in the local database unless explicitly migrated.

If Preview deployments are enabled, give them a separate Neon branch/database and corresponding `DATABASE_URL` and `DATABASE_URL_UNPOOLED`. Do not point preview migrations at production. Set `AUTH_URL` for that environment's actual origin or let Auth.js infer the Vercel preview host instead of inheriting the production URL.

Prisma 5.22 reads `url` and `directUrl` from the production schema. Do not add a newer `prisma.config.ts` or upgrade Prisma as part of this deployment setup. Keep both schema model definitions synchronized when changing the data model, and generate/review a new PostgreSQL migration before deploying model changes.

## Password recovery

Password-reset email delivery is **not configured**. In development mode, a reset request for an existing account prints a private, single-use link in the server console. It expires after 30 minutes. Production, including `npm start`, reports that email delivery is unavailable; it does not send email or print a reset link. Add and test an email delivery service before promising hosted password recovery.

## Checks and commands

```sh
npm run lint
npx tsc --noEmit
npm run build
```

- `npm run db:generate`: generate the local SQLite Prisma client.
- `npm run db:setup`: synchronize the local SQLite database with the local schema.
- `npm run db:generate:production`: generate the hosted PostgreSQL client.
- `npm run db:migrate:production`: apply pending PostgreSQL migrations to `DATABASE_URL_UNPOOLED`; this changes that database.
- `npm run vercel-build`: generate the hosted client, apply migrations, and build Next.js.

The two clients share the same generated output, so do not run a hosted build in the same checkout while a local development server is running. Use a separate checkout/build environment for deployment. `npm run dev` restores the local client on the next start.

References: [Prisma deployment on Vercel](https://www.prisma.io/docs/orm/prisma-client/deployment/serverless/deploy-to-vercel), [Prisma and Neon](https://www.prisma.io/docs/orm/overview/databases/neon), and [Vercel Marketplace storage](https://vercel.com/docs/storage).
