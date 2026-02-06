import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createSubscription, type CreateSubscriptionInput } from '@/server/subscriptions'
import { SubscriptionForm } from '@/components/subscription-form'
import {
  subscriptionTemplates,
  type SubscriptionTemplate,
  type SubscriptionPlan,
} from '@/data/subscription-templates'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/currency-utils'
import { ArrowLeft, Pencil } from 'lucide-react'
import { getUserPreferences } from '@/server/user-preferences'

export const Route = createFileRoute('/_authed/subscriptions/new')({
  loader: async () => {
    const preferences = await getUserPreferences()
    return { preferences }
  },
  component: NewSubscriptionPage,
})

type Step = 'pick-service' | 'pick-plan' | 'form'

function NewSubscriptionPage() {
  const { preferences } = Route.useLoaderData()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<Step>('pick-service')
  const [selectedTemplate, setSelectedTemplate] = useState<SubscriptionTemplate | null>(null)
  const [defaults, setDefaults] = useState<Partial<CreateSubscriptionInput>>({})
  const [formKey, setFormKey] = useState(0)

  const handleSelectService = (template: SubscriptionTemplate) => {
    setSelectedTemplate(template)
    setStep('pick-plan')
  }

  const handleSelectCustom = () => {
    setSelectedTemplate(null)
    setDefaults({ currency: preferences.currency })
    setFormKey((k) => k + 1)
    setStep('form')
  }

  const handleSelectPlan = (template: SubscriptionTemplate, plan: SubscriptionPlan) => {
    setDefaults({
      name: template.name,
      provider: template.provider,
      planName: plan.name,
      price: plan.price,
      currency: preferences.currency,
      billingCycle: plan.billingCycle,
      category: template.category,
      status: 'active',
    })
    setFormKey((k) => k + 1)
    setStep('form')
  }

  const handleBack = () => {
    if (step === 'pick-plan') {
      setSelectedTemplate(null)
      setStep('pick-service')
    } else if (step === 'form') {
      if (selectedTemplate) {
        setStep('pick-plan')
      } else {
        setStep('pick-service')
      }
    }
  }

  const handleSubmit = async (data: CreateSubscriptionInput) => {
    setLoading(true)
    try {
      await createSubscription({ data })
      navigate({ to: '/subscriptions' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header with back button */}
      <div className="mb-6 flex items-center gap-3">
        {step !== 'pick-service' && (
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold">
            {step === 'pick-service' && 'Add Subscription'}
            {step === 'pick-plan' && selectedTemplate?.name}
            {step === 'form' && (selectedTemplate ? `${selectedTemplate.name}` : 'Custom Subscription')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === 'pick-service' && 'Choose a service or add a custom subscription.'}
            {step === 'pick-plan' && 'Select your plan.'}
            {step === 'form' && 'Fill in the details and save.'}
          </p>
        </div>
      </div>

      {/* Step 1: Pick a service */}
      {step === 'pick-service' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {subscriptionTemplates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-ring"
              onClick={() => handleSelectService(template)}
            >
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white text-lg font-bold"
                  style={{ backgroundColor: template.color }}
                >
                  {template.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-center">{template.name}</span>
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
              </CardContent>
            </Card>
          ))}

          {/* Custom option */}
          <Card
            className="cursor-pointer border-dashed transition-all hover:shadow-md hover:ring-1 hover:ring-ring"
            onClick={handleSelectCustom}
          >
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Pencil className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Custom</span>
              <Badge variant="outline" className="text-xs">
                Manual entry
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Pick a plan */}
      {step === 'pick-plan' && selectedTemplate && (
        <div className="space-y-3">
          {selectedTemplate.plans.map((plan, i) => (
            <Card
              key={i}
              className="cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-ring"
              onClick={() => handleSelectPlan(selectedTemplate, plan)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Billed {plan.billingCycle}
                  </p>
                </div>
                <span className="text-xl font-bold">
                  {formatCurrency(plan.price)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{plan.billingCycle === 'yearly' ? 'yr' : plan.billingCycle === 'weekly' ? 'wk' : 'mo'}
                  </span>
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Step 3: Form */}
      {step === 'form' && (
        <Card>
          <CardContent className="p-6">
            <SubscriptionForm
              key={formKey}
              defaultValues={defaults}
              isLoading={loading}
              submitLabel="Add Subscription"
              onSubmit={handleSubmit}
              isTemplate={!!selectedTemplate}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
