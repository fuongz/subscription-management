import { useForm, useStore } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CreditCard,
  Building2,
  FileText,
  DollarSign,
  CalendarDays,
  CalendarClock,
  StickyNote,
} from 'lucide-react'
import type { CreateSubscriptionInput } from '@/server/subscriptions'

const CATEGORIES = [
  'Entertainment',
  'Music',
  'Productivity',
  'Cloud Storage',
  'Development',
  'Education',
  'Health & Fitness',
  'News',
  'Other',
]

interface SubscriptionFormProps {
  defaultValues?: Partial<CreateSubscriptionInput>
  onSubmit: (data: CreateSubscriptionInput) => void
  isLoading?: boolean
  submitLabel?: string
  isTemplate?: boolean
}

function computeNextBillingDate(startDate: string, billingCycle: string): string {
  if (!startDate) return ''
  const start = new Date(startDate + 'T00:00:00')
  if (isNaN(start.getTime())) return ''

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const next = new Date(start)
  while (next < today) {
    if (billingCycle === 'weekly') {
      next.setDate(next.getDate() + 7)
    } else if (billingCycle === 'monthly') {
      next.setMonth(next.getMonth() + 1)
    } else if (billingCycle === 'yearly') {
      next.setFullYear(next.getFullYear() + 1)
    }
  }

  return next.toISOString().split('T')[0]
}

function getFieldError(field: { state: { meta: { isTouched: boolean; errors: Array<string | { message: string }> } } }) {
  if (!field.state.meta.isTouched || field.state.meta.errors.length === 0) return undefined
  return field.state.meta.errors.map((e) => (typeof e === 'string' ? e : e.message)).join(', ')
}

export function SubscriptionForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = 'Save',
  isTemplate = false,
}: SubscriptionFormProps) {
  const form = useForm({
    defaultValues: {
      name: defaultValues?.name || '',
      provider: defaultValues?.provider || '',
      planName: defaultValues?.planName || '',
      price: defaultValues?.price?.toString() || '',
      currency: defaultValues?.currency || 'USD',
      billingCycle: (defaultValues?.billingCycle || 'monthly') as 'monthly' | 'yearly' | 'weekly',
      startDate: defaultValues?.startDate || '',
      status: (defaultValues?.status || 'active') as 'active' | 'paused' | 'cancelled',
      category: defaultValues?.category || '',
      notes: defaultValues?.notes || '',
    },
    onSubmit: async ({ value }) => {
      const nextBillingDate = computeNextBillingDate(value.startDate, value.billingCycle)
      onSubmit({
        name: value.name,
        provider: value.provider || undefined,
        planName: value.planName || undefined,
        price: parseFloat(value.price),
        currency: value.currency,
        billingCycle: value.billingCycle,
        startDate: value.startDate,
        nextBillingDate: nextBillingDate || value.startDate || undefined,
        status: value.status,
        category: value.category || undefined,
        notes: value.notes || undefined,
      })
    },
  })

  // Watch startDate and billingCycle for auto-calculated next billing date display
  const startDate = useStore(form.store, (s) => s.values.startDate)
  const billingCycle = useStore(form.store, (s) => s.values.billingCycle)
  const nextBillingDate = computeNextBillingDate(startDate, billingCycle)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Name */}
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => (!value ? 'Service name is required' : undefined),
          }}
          children={(field) => {
            const error = getFieldError(field)
            return (
              <Field data-invalid={error ? true : undefined} data-disabled={isTemplate || undefined}>
                <FieldLabel htmlFor={field.name}>Service Name *</FieldLabel>
                <InputGroup data-disabled={isTemplate || undefined}>
                  <InputGroupAddon align="inline-start">
                    <InputGroupText>
                      <CreditCard />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Netflix"
                    disabled={isTemplate}
                    aria-invalid={error ? true : undefined}
                  />
                </InputGroup>
                {error && <FieldError>{error}</FieldError>}
              </Field>
            )
          }}
        />

        {/* Provider */}
        <form.Field
          name="provider"
          children={(field) => (
            <Field data-disabled={isTemplate || undefined}>
              <FieldLabel htmlFor={field.name}>Provider</FieldLabel>
              <InputGroup data-disabled={isTemplate || undefined}>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>
                    <Building2 />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Netflix Inc."
                  disabled={isTemplate}
                />
              </InputGroup>
            </Field>
          )}
        />

        {/* Plan Name */}
        <form.Field
          name="planName"
          children={(field) => (
            <Field data-disabled={isTemplate || undefined}>
              <FieldLabel htmlFor={field.name}>Plan Name</FieldLabel>
              <InputGroup data-disabled={isTemplate || undefined}>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>
                    <FileText />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Premium"
                  disabled={isTemplate}
                />
              </InputGroup>
            </Field>
          )}
        />

        {/* Price */}
        <form.Field
          name="price"
          validators={{
            onChange: ({ value }) =>
              !value
                ? 'Price is required'
                : isNaN(parseFloat(value))
                  ? 'Must be a valid number'
                  : parseFloat(value) < 0
                    ? 'Price cannot be negative'
                    : undefined,
          }}
          children={(field) => {
            const error = getFieldError(field)
            return (
              <Field data-invalid={error ? true : undefined} data-disabled={isTemplate || undefined}>
                <FieldLabel htmlFor={field.name}>Price *</FieldLabel>
                <InputGroup data-disabled={isTemplate || undefined}>
                  <InputGroupAddon align="inline-start">
                    <InputGroupText>
                      <DollarSign />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    type="number"
                    step="0.01"
                    min="0"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="9.99"
                    disabled={isTemplate}
                    aria-invalid={error ? true : undefined}
                  />
                </InputGroup>
                {error && <FieldError>{error}</FieldError>}
              </Field>
            )
          }}
        />

        {/* Currency */}
        <form.Field
          name="currency"
          children={(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Currency</FieldLabel>
              <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="VND">VND</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        {/* Billing Cycle */}
        <form.Field
          name="billingCycle"
          children={(field) => (
            <Field data-disabled={isTemplate || undefined}>
              <FieldLabel htmlFor={field.name}>Billing Cycle</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as typeof field.state.value)}
                disabled={isTemplate}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        {/* Start Date */}
        <form.Field
          name="startDate"
          validators={{
            onChange: ({ value }) => (!value ? 'Start date is required' : undefined),
          }}
          children={(field) => {
            const error = getFieldError(field)
            return (
              <Field data-invalid={error ? true : undefined}>
                <FieldLabel htmlFor={field.name}>Start Date *</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <InputGroupText>
                      <CalendarDays />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={error ? true : undefined}
                  />
                </InputGroup>
                {error && <FieldError>{error}</FieldError>}
              </Field>
            )
          }}
        />

        {/* Next Billing Date (auto-calculated, read-only) */}
        <Field data-disabled="true">
          <FieldLabel htmlFor="nextBillingDate">Next Billing Date</FieldLabel>
          <InputGroup data-disabled="true">
            <InputGroupAddon align="inline-start">
              <InputGroupText>
                <CalendarClock />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="nextBillingDate"
              type="date"
              value={nextBillingDate}
              disabled
              className="bg-muted"
            />
          </InputGroup>
          {startDate && (
            <FieldDescription>
              Auto-calculated from start date & billing cycle
            </FieldDescription>
          )}
        </Field>

        {/* Status */}
        <form.Field
          name="status"
          children={(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Status</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as typeof field.state.value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        {/* Category */}
        <form.Field
          name="category"
          children={(field) => (
            <Field data-disabled={isTemplate || undefined}>
              <FieldLabel htmlFor={field.name}>Category</FieldLabel>
              <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)} disabled={isTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </div>

      {/* Notes */}
      <form.Field
        name="notes"
        children={(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupText>
                  <StickyNote />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Any notes about this subscription..."
              />
            </InputGroup>
          </Field>
        )}
      />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isLoading || isSubmitting}
            className="w-full"
          >
            {isLoading || isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        )}
      />
    </form>
  )
}
