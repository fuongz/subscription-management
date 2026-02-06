import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { User, Globe, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
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
import { authClient } from '@/lib/auth-client'
import {
  getUserPreferences,
  updateUserPreferences,
} from '@/server/user-preferences'

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Ho_Chi_Minh',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland',
]

function getFieldError(field: {
  state: { meta: { isTouched: boolean; errors: Array<string | { message: string }> } }
}) {
  if (!field.state.meta.isTouched || field.state.meta.errors.length === 0) return undefined
  return field.state.meta.errors.map((e) => (typeof e === 'string' ? e : e.message)).join(', ')
}

export const Route = createFileRoute('/_authed/settings')({
  loader: async () => {
    const preferences = await getUserPreferences()
    return { preferences }
  },
  component: SettingsPage,
})

function SettingsPage() {
  const { preferences } = Route.useLoaderData()
  const { data: session } = authClient.useSession()
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const form = useForm({
    defaultValues: {
      name: session?.user?.name || '',
      currency: preferences.currency,
      timezone: preferences.timezone,
    },
    onSubmit: async ({ value }) => {
      setStatus('saving')
      try {
        if (value.name !== session?.user?.name) {
          await authClient.updateUser({ name: value.name })
        }

        await updateUserPreferences({
          data: {
            currency: value.currency as 'USD' | 'EUR' | 'GBP' | 'VND' | 'JPY',
            timezone: value.timezone,
          },
        })

        setStatus('saved')
        setTimeout(() => setStatus('idle'), 3000)
      } catch {
        setStatus('error')
      }
    },
  })

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile & Preferences</CardTitle>
          <CardDescription>Update your name and default settings for subscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            {status === 'saved' && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                Settings saved successfully.
              </div>
            )}
            {status === 'error' && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                Failed to save settings. Please try again.
              </div>
            )}

            {/* Name */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => (!value ? 'Name is required' : undefined),
              }}
              children={(field) => {
                const error = getFieldError(field)
                return (
                  <Field data-invalid={error ? true : undefined}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <InputGroupText>
                          <User />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Your name"
                        aria-invalid={error ? true : undefined}
                      />
                    </InputGroup>
                    {error && <FieldError>{error}</FieldError>}
                  </Field>
                )
              }}
            />

            {/* Default Currency */}
            <form.Field
              name="currency"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Default Currency</FieldLabel>
                  <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                    <SelectTrigger>
                      <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD — US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR — Euro</SelectItem>
                      <SelectItem value="GBP">GBP — British Pound</SelectItem>
                      <SelectItem value="VND">VND — Vietnamese Dong</SelectItem>
                      <SelectItem value="JPY">JPY — Japanese Yen</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            {/* Timezone */}
            <form.Field
              name="timezone"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Timezone</FieldLabel>
                  <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                    <SelectTrigger>
                      <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            {/* Submit */}
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit || isSubmitting || status === 'saving'}
                >
                  {status === 'saving' ? 'Saving...' : 'Save Settings'}
                </Button>
              )}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
