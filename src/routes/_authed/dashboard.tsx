import { createFileRoute } from '@tanstack/react-router'
import { getSubscriptions } from '@/server/subscriptions'
import { getUserPreferences } from '@/server/user-preferences'
import { DashboardStats } from '@/components/dashboard-stats'
import type { SupportedCurrency } from '@/lib/currency-utils'

export const Route = createFileRoute('/_authed/dashboard')({
  loader: async () => {
    const [subscriptions, preferences] = await Promise.all([
      getSubscriptions(),
      getUserPreferences(),
    ])
    return { subscriptions, preferences }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { subscriptions, preferences } = Route.useLoaderData()
  const currency = (preferences.currency || 'VND') as SupportedCurrency

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <DashboardStats subscriptions={subscriptions} currency={currency} />
    </div>
  )
}
