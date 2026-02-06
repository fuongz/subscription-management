import { createFileRoute } from '@tanstack/react-router'
import { getSubscriptions } from '@/server/subscriptions'
import { DashboardStats } from '@/components/dashboard-stats'

export const Route = createFileRoute('/_authed/dashboard')({
  loader: () => getSubscriptions(),
  component: DashboardPage,
})

function DashboardPage() {
  const subscriptions = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <DashboardStats subscriptions={subscriptions} />
    </div>
  )
}
