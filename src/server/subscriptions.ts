import { createServerFn } from '@tanstack/react-start'
import { getDb } from './db'
import { subscription } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getAuth } from '@/lib/auth'
import { getRequest } from '@tanstack/react-start/server'
import { env } from 'cloudflare:workers'
import { z } from 'zod'

function generateId() {
  return crypto.randomUUID()
}

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

const idSchema = z.string().uuid()

const billingCycleSchema = z.enum(['monthly', 'yearly', 'weekly'])
const statusSchema = z.enum(['active', 'paused', 'cancelled'])

const createSubscriptionSchema = z.object({
  name: z.string().min(1).max(200),
  provider: z.string().max(200).optional(),
  planName: z.string().max(200).optional(),
  price: z.number().min(0).max(1_000_000),
  currency: z.string().min(1).max(10),
  billingCycle: billingCycleSchema,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  nextBillingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  status: statusSchema,
  category: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
})

const updateSubscriptionSchema = createSubscriptionSchema.extend({
  id: idSchema,
})

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>

// ─── Server functions ───────────────────────────────────────────

export const getSubscriptions = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  if (!request) throw new Error('No request context')

  const user = await getAuthenticatedUser(request)
  const db = getDb(getD1())

  const result = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, user.id))
    .orderBy(desc(subscription.createdAt))

  return result
})

export const getSubscription = createServerFn({ method: 'GET' })
  .inputValidator((input: string) => {
    return idSchema.parse(input)
  })
  .handler(async ({ data: id }) => {
    const request = getRequest()
    if (!request) throw new Error('No request context')

    const user = await getAuthenticatedUser(request)
    const db = getDb(getD1())

    const result = await db
      .select()
      .from(subscription)
      .where(and(eq(subscription.id, id), eq(subscription.userId, user.id)))

    return result[0] || null
  })

export const createSubscription = createServerFn({ method: 'POST' })
  .inputValidator((input: CreateSubscriptionInput) => {
    return createSubscriptionSchema.parse(input)
  })
  .handler(async ({ data }) => {
    const request = getRequest()
    if (!request) throw new Error('No request context')

    const user = await getAuthenticatedUser(request)
    const db = getDb(getD1())

    const now = new Date().toISOString()
    const id = generateId()

    await db.insert(subscription).values({
      id,
      userId: user.id,
      name: data.name,
      provider: data.provider || null,
      planName: data.planName || null,
      price: data.price,
      currency: data.currency,
      billingCycle: data.billingCycle,
      startDate: data.startDate,
      nextBillingDate: data.nextBillingDate || null,
      status: data.status,
      category: data.category || null,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    })

    return { id }
  })

export const updateSubscription = createServerFn({ method: 'POST' })
  .inputValidator((input: UpdateSubscriptionInput) => {
    return updateSubscriptionSchema.parse(input)
  })
  .handler(async ({ data }) => {
    const request = getRequest()
    if (!request) throw new Error('No request context')

    const user = await getAuthenticatedUser(request)
    const db = getDb(getD1())

    await db
      .update(subscription)
      .set({
        name: data.name,
        provider: data.provider || null,
        planName: data.planName || null,
        price: data.price,
        currency: data.currency,
        billingCycle: data.billingCycle,
        startDate: data.startDate,
        nextBillingDate: data.nextBillingDate || null,
        status: data.status,
        category: data.category || null,
        notes: data.notes || null,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(subscription.id, data.id), eq(subscription.userId, user.id)))

    return { success: true }
  })

export const deleteSubscription = createServerFn({ method: 'POST' })
  .inputValidator((input: string) => {
    return idSchema.parse(input)
  })
  .handler(async ({ data: id }) => {
    const request = getRequest()
    if (!request) throw new Error('No request context')

    const user = await getAuthenticatedUser(request)
    const db = getDb(getD1())

    await db
      .delete(subscription)
      .where(and(eq(subscription.id, id), eq(subscription.userId, user.id)))

    return { success: true }
  })
