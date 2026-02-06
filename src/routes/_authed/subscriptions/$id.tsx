import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  getSubscription,
  updateSubscription,
  deleteSubscription,
} from '@/server/subscriptions'
import { SubscriptionForm } from '@/components/subscription-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'

export const Route = createFileRoute('/_authed/subscriptions/$id')({
  loader: ({ params }) => getSubscription({ data: params.id }),
  component: EditSubscriptionPage,
})

function EditSubscriptionPage() {
  const sub = Route.useLoaderData()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { id } = Route.useParams()

  if (!sub) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Subscription not found.
      </div>
    )
  }

  // If the subscription has both provider and planName, it was created from a template
  const isTemplate = !!(sub.provider && sub.planName)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteSubscription({ data: id })
      navigate({ to: '/subscriptions' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Edit Subscription</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Subscription</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{sub.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <SubscriptionForm
            defaultValues={{
              name: sub.name,
              provider: sub.provider || undefined,
              planName: sub.planName || undefined,
              price: sub.price,
              currency: sub.currency,
              billingCycle: sub.billingCycle,
              startDate: sub.startDate,
              nextBillingDate: sub.nextBillingDate || undefined,
              status: sub.status,
              category: sub.category || undefined,
              notes: sub.notes || undefined,
            }}
            isTemplate={isTemplate}
            isLoading={loading}
            submitLabel="Update Subscription"
            onSubmit={async (data) => {
              setLoading(true)
              try {
                await updateSubscription({ data: { ...data, id } })
                navigate({ to: '/subscriptions' })
              } finally {
                setLoading(false)
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
