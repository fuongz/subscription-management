import { createServerFn } from '@tanstack/react-start'
import { getDb } from './db'
import { userPreference } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getAuth } from '@/lib/auth'
import { getRequest } from '@tanstack/react-start/server'
import { env } from 'cloudflare:workers'
import { z } from 'zod'

function getD1(): D1Database {
  return (env as { DB: D1Database }).DB
}

async function getAuthenticatedUser(request: Request) {
  const d1 = getD1()
  const auth = getAuth(d1)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session.user
}

// ─── Zod schemas ────────────────────────────────────────────────

const updatePreferencesSchema = z.object({
  currency: z.enum(['USD', 'EUR', 'GBP', 'VND', 'JPY']),
  timezone: z.string().min(1).max(100),
})

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>

// ─── Server functions ───────────────────────────────────────────

export const getUserPreferences = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  if (!request) throw new Error('No request context')

  const user = await getAuthenticatedUser(request)
  const db = getDb(getD1())

  const result = await db
    .select()
    .from(userPreference)
    .where(eq(userPreference.userId, user.id))

  return result[0] || { userId: user.id, currency: 'USD', timezone: 'UTC' }
})

export const updateUserPreferences = createServerFn({ method: 'POST' })
  .inputValidator((input: UpdatePreferencesInput) => {
    return updatePreferencesSchema.parse(input)
  })
  .handler(async ({ data }) => {
    const request = getRequest()
    if (!request) throw new Error('No request context')

    const user = await getAuthenticatedUser(request)
    const db = getDb(getD1())

    await db
      .insert(userPreference)
      .values({
        userId: user.id,
        currency: data.currency,
        timezone: data.timezone,
      })
      .onConflictDoUpdate({
        target: userPreference.userId,
        set: {
          currency: data.currency,
          timezone: data.timezone,
        },
      })

    return { success: true }
  })
