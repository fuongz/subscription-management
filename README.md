# PhakeSub

A clean, fast subscription tracker built on Cloudflare's edge. Know exactly where your money goes every month.

## What it does

- **Track subscriptions** — Add from built-in templates (Netflix, YouTube, Claude, etc.) or create custom entries
- **Auto-calculate renewals** — Next billing date updates automatically based on your billing cycle
- **See your spending** — Monthly/yearly totals, category breakdowns, upcoming renewals at a glance
- **Google sign-in** — One-click OAuth alongside email/password auth

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | [TanStack Start](https://tanstack.com/start) + React 19 + TypeScript |
| Database | Cloudflare D1 (SQLite) via [Drizzle ORM](https://orm.drizzle.team) |
| Auth | [Better Auth](https://better-auth.com) with Google OAuth |
| UI | [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS v4 |
| Animations | [Motion](https://motion.dev) |
| Validation | [Zod](https://zod.dev) |
| Deployment | [Cloudflare Workers](https://workers.cloudflare.com) |

## Getting started

```bash
# Install dependencies
bun install

# Set up local secrets (create .dev.vars from example)
cp .env.example .dev.vars
# Then fill in your secrets in .dev.vars

# Run database migrations
bun run db:migrate

# Start dev server
bun run dev
```

App runs at `http://localhost:3002`.

## Environment variables

Non-secret config goes in `.env`. Secrets go in `.dev.vars` (local) or Wrangler secrets (production).

| Variable | Where | Description |
|----------|-------|-------------|
| `BETTER_AUTH_URL` | `.env` | App URL (`http://localhost:3002` for dev) |
| `BETTER_AUTH_SECRET` | `.dev.vars` | Session signing key |
| `BETTER_AUTH_GOOGLE_CLIENT_ID` | `.dev.vars` | Google OAuth client ID |
| `BETTER_AUTH_GOOGLE_CLIENT_SECRET` | `.dev.vars` | Google OAuth client secret |

## Deploy to Cloudflare

```bash
# Set production secrets (encrypted, nobody can read them back)
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put BETTER_AUTH_URL
wrangler secret put BETTER_AUTH_GOOGLE_CLIENT_ID
wrangler secret put BETTER_AUTH_GOOGLE_CLIENT_SECRET

# Run migrations on production D1
bun run db:migrate:prod

# Deploy
bun run deploy
```

Don't forget to add your production callback URL in Google Cloud Console:

```
https://<your-worker>.workers.dev/api/auth/callback/google
```

## Project structure

```
src/
├── routes/              # File-based routing
│   ├── index.tsx        # Landing page
│   ├── login.tsx        # Sign in
│   ├── register.tsx     # Sign up
│   └── _authed/         # Protected routes
│       ├── dashboard.tsx
│       └── subscriptions/
├── components/          # UI components
├── server/              # Server functions + DB queries
├── db/                  # Schema + migrations
├── lib/                 # Auth, utils
└── data/                # Subscription templates
```

## Built-in templates

Ready-to-use templates with real pricing for quick entry:

Netflix, YouTube Premium, Claude, 1Password, Duolingo, iCloud+, Google One

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server |
| `bun run build` | Production build |
| `bun run deploy` | Build + deploy to Cloudflare |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Apply migrations (local) |
| `bun run db:migrate:prod` | Apply migrations (production) |
| `bun run test` | Run tests |

## Security

- All server functions require authentication
- Row-level authorization — users only see their own data
- Zod runtime validation on every input
- CSP, X-Content-Type-Options, and Referrer-Policy headers
- Secrets stored via Cloudflare encrypted secrets, not in code
- Parameterized queries via Drizzle ORM — no SQL injection

---

Built with care by [@phuongphung](https://github.com/fuongz) and [Claude](https://claude.ai).
