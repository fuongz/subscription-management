# PhakeSub - Subscription Management App

## Tech Stack
- **Framework**: TanStack Start (React 19 + TypeScript) with file-based routing
- **Runtime**: Cloudflare Workers via `@cloudflare/vite-plugin` + Vite
- **Database**: Cloudflare D1 (SQLite) via Drizzle ORM
- **Auth**: Better Auth with email/password + Google OAuth, `tanstackStartCookies()` plugin
- **UI**: shadcn/ui + Tailwind CSS v4 + lucide-react icons
- **Brand Icons**: simple-icons package
- **Charts**: recharts via shadcn chart component
- **Tour**: driver.js for guided user onboarding
- **Validation**: Zod schemas for all inputs
- **Package Manager**: Bun

## Database Schema (D1 + Drizzle)

### Tables (managed by Better Auth)
- **user** - id, name, email, emailVerified, image, createdAt, updatedAt
- **session** - id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId
- **account** - id, accountId, providerId, userId, accessToken, refreshToken, idToken, ...
- **verification** - id, identifier, value, expiresAt, createdAt, updatedAt

### Tables (app-specific)
- **subscriptions** - id, user_id (FK→user), name, provider, plan_name, price, currency, billing_cycle (monthly/yearly/weekly), start_date, next_billing_date, status (active/paused/cancelled), category, notes, created_at, updated_at
- **user_preference** - userId (PK, FK→user), currency (default 'USD'), timezone (default 'UTC')

## Project Structure
```
subscription-managements/
├── src/
│   ├── routes/
│   │   ├── __root.tsx              # Root layout (sidebar for authed, plain for public)
│   │   ├── index.tsx               # Landing page (redirect if logged in)
│   │   ├── login.tsx               # Login page (email/password + Google OAuth)
│   │   ├── register.tsx            # Register page (email/password + Google OAuth)
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── $.ts            # Better Auth handler (GET + POST)
│   │   └── _authed/                # Protected route group
│   │       ├── route.tsx           # Auth guard layout
│   │       ├── dashboard.tsx       # Dashboard with stats, renewals, category chart
│   │       ├── settings.tsx        # User settings (name, currency, timezone)
│   │       └── subscriptions/
│   │           ├── index.tsx       # List all subscriptions
│   │           ├── new.tsx         # Add subscription (template picker + form)
│   │           └── $id.tsx         # Edit/view subscription
│   ├── server/
│   │   ├── subscriptions.ts        # Subscription CRUD server functions
│   │   ├── user-preferences.ts     # User preferences CRUD server functions
│   │   └── db.ts                   # Drizzle DB client setup
│   ├── lib/
│   │   ├── auth.ts                 # Better Auth server config (Google OAuth + email/password)
│   │   ├── auth-client.ts          # Better Auth client instance
│   │   ├── currency-utils.ts       # Currency formatting & conversion (USD/VND)
│   │   ├── date-utils.ts           # Date formatting utilities
│   │   └── utils.ts                # Utility functions (cn)
│   ├── db/
│   │   ├── schema.ts               # Drizzle schema (Better Auth tables + app tables)
│   │   └── migrations/             # SQL migrations
│   ├── data/
│   │   └── subscription-templates.ts  # Pre-configured subscription templates with regional pricing
│   ├── hooks/
│   │   └── use-app-tour.ts         # driver.js guided tour hook
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components (sidebar, chart, etc.)
│   │   ├── app-sidebar.tsx         # Main sidebar navigation
│   │   ├── brand-icon.tsx          # Brand icon renderer (simple-icons)
│   │   ├── subscription-card.tsx   # Subscription list item card
│   │   ├── subscription-form.tsx   # Subscription create/edit form
│   │   └── dashboard-stats.tsx     # Dashboard stats, renewals, category chart
│   ├── router.tsx
│   └── routeTree.gen.ts            # Auto-generated
├── public/
├── vite.config.ts
├── wrangler.jsonc
├── drizzle.config.ts
├── tsconfig.json
├── components.json                  # shadcn/ui config
├── package.json
├── .env                             # Non-secrets
├── .env.example                     # Template for secrets
└── CLAUDE.md                        # Claude Code instructions
```

## Completed Features

### 1. Project Scaffolding & Auth
- TanStack Start + Vite + Cloudflare Workers setup
- Better Auth with email/password + Google OAuth
- Protected route group (`_authed/`) with session guard
- Login/Register pages with Google "Continue with" button

### 2. Subscription CRUD
- Server functions via `createServerFn` with Zod validation
- Row-level security (always filter by `userId`)
- Subscription list, create, edit, delete flows

### 3. Sidebar Navigation
- shadcn sidebar component replacing top navbar
- Dashboard, Subscriptions, Settings nav items
- User info + logout in footer
- Active route highlighting
- Mobile responsive (sheet/drawer)

### 4. User Settings
- `user_preference` table (currency, timezone)
- Settings page: update name (via Better Auth), currency, timezone
- User currency preference used throughout app

### 5. Dashboard
- Monthly/yearly spend summary cards
- Upcoming renewals with brand icons and countdown ("Today", "Tomorrow", "Xd left")
- Category breakdown with recharts pie chart (shadcn chart component)
- All amounts respect user's currency preference

### 6. Subscription Templates with Regional Pricing
- `SubscriptionPlan.prices: Record<SupportedCurrency, number>` for per-region pricing
- Real VND prices for: Netflix, YouTube Premium, iCloud+, Google One, Google Gemini
- `withFallbackVND(usd)` helper for services without confirmed VND prices (1 USD = 26,150 VND)
- Templates: Netflix, YouTube Premium, Spotify, Apple Music, Claude, 1Password, Canva Pro, ChatGPT, Duolingo, iCloud+, Google One, Google Gemini, Cloudflare Workers, GitHub Copilot, Vercel, Supabase, JetBrains, PlayStation Plus, Domain Renewal
- Category filter dropdown in template picker
- Brand icons via simple-icons package

### 7. Domain Renewal Template
- `skipPlanSelection: true` — bypasses plan picker, goes directly to form
- `editableFields: ["provider", "planName", "price", "billingCycle"]` — user edits provider (Porkbun, Namecheap, etc.), plan name (domain), price, cycle
- Billing cycle options exclude monthly (yearly/weekly only)
- `plans: []` — no pre-configured plans

### 8. Brand Icons (simple-icons)
- `BrandIcon` component renders SVG icons from simple-icons
- Tree-shaken imports for: netflix, youtube, anthropic, 1password, duolingo, icloud, google, spotify, applemusic, playstation, vercel, supabase, jetbrains, canva, openai, cloudflareworkers, githubcopilot, googlegemini
- `getIconSlugByName()` helper for mapping subscription names to icon slugs
- Globe fallback icon for unrecognized services

### 9. User Tour (driver.js)
- `useAppTour()` hook with 6 tour steps
- Auto-starts on first visit (localStorage persistence)
- `data-tour` attributes on: sidebar-nav, sidebar-user, stats-cards, upcoming-renewals, category-breakdown
- Exports: `startTour`, `resetTour`, `hasCompletedTour`

## Key Architecture Patterns

### Server Functions
```typescript
export const getSubscriptions = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()  // NOT getWebRequest
  const user = await getAuthenticatedUser(request)
  const db = getDb(getD1())
  return db.select().from(subscription).where(eq(subscription.userId, user.id))
})
```

### Cloudflare Bindings
```typescript
import { env } from 'cloudflare:workers'
const db = (env as { DB: D1Database }).DB
```

### Regional Pricing
```typescript
interface SubscriptionPlan {
  name: string;
  prices: Record<SupportedCurrency, number>;  // { USD: 7.99, VND: 74000 }
  billingCycle: "monthly" | "yearly" | "weekly";
}

// For services without confirmed VND prices:
const withFallbackVND = (usd: number) => ({
  USD: usd,
  VND: Math.round(convertCurrency(usd, 'USD', 'VND')),
})
```

### Template Editability
```typescript
interface SubscriptionTemplate {
  id: string;
  name: string;
  provider: string;
  category: string;
  icon: string;
  plans: SubscriptionPlan[];
  editableFields?: Array<"name" | "provider" | "planName" | "price" | "billingCycle" | "category">;
  skipPlanSelection?: boolean;
}
```
