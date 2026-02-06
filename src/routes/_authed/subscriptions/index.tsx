import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { getSubscriptions } from '@/server/subscriptions'
import { SubscriptionCard } from '@/components/subscription-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/_authed/subscriptions/')({
  loader: () => getSubscriptions(),
  component: SubscriptionsPage,
})

function SubscriptionsPage() {
  const subscriptions = Route.useLoaderData()
  const [filter, setFilter] = useState('all')

  const filtered =
    filter === 'all' ? subscriptions : subscriptions.filter((s) => s.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <Link to="/subscriptions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Subscription
          </Button>
        </Link>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({subscriptions.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active ({subscriptions.filter((s) => s.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="paused">
            Paused ({subscriptions.filter((s) => s.status === 'paused').length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({subscriptions.filter((s) => s.status === 'cancelled').length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value={filter}>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No subscriptions found.</p>
              <Link to="/subscriptions/new" className="mt-2 inline-block text-primary underline">
                Add your first subscription
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((sub) => (
                <SubscriptionCard key={sub.id} sub={sub} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
