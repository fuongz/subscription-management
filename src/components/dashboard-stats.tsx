import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, convertCurrency, type SupportedCurrency } from '@/lib/currency-utils'
import { daysUntil, formatDate } from '@/lib/date-utils'
import type { subscription } from '@/db/schema'
import { DollarSign, CreditCard, TrendingUp, CalendarClock } from 'lucide-react'
import { getIconSlugByName } from '@/data/subscription-templates'
import { BrandIcon } from '@/components/brand-icon'

type Subscription = typeof subscription.$inferSelect

const CATEGORY_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#14b8a6', // teal
]

interface CategoryData {
  name: string
  count: number
  amount: number
  color: string
}

function DonutChart({ categories, totalCount }: { categories: CategoryData[]; totalCount: number }) {
  const size = 140
  const strokeWidth = 18
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  const totalAmount = categories.reduce((sum, c) => sum + c.amount, 0)

  let cumulativeOffset = 0
  const segments = categories.map((cat) => {
    const proportion = totalAmount > 0 ? cat.amount / totalAmount : 0
    const dashLength = proportion * circumference
    const gap = circumference - dashLength
    const offset = -cumulativeOffset
    cumulativeOffset += dashLength
    return { ...cat, dashLength, gap, offset }
  })

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Segments */}
        {segments.map((seg) => (
          <circle
            key={seg.name}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.dashLength} ${seg.gap}`}
            strokeDashoffset={seg.offset}
            strokeLinecap="round"
            className="transition-all duration-500"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
        ))}
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{totalCount}</span>
        <span className="text-[10px] text-muted-foreground">Total Subs</span>
      </div>
    </div>
  )
}

export function DashboardStats({ subscriptions, currency }: { subscriptions: Subscription[]; currency: SupportedCurrency }) {
  const active = subscriptions.filter((s) => s.status === 'active')

  // Convert all amounts to user's currency for totals
  const monthlyTotal = active.reduce((sum, s) => {
    const converted = convertCurrency(s.price, s.currency as SupportedCurrency, currency)
    if (s.billingCycle === 'monthly') return sum + converted
    if (s.billingCycle === 'yearly') return sum + converted / 12
    if (s.billingCycle === 'weekly') return sum + converted * 4.33
    return sum
  }, 0)

  const yearlyTotal = monthlyTotal * 12

  const upcoming = active
    .filter((s) => s.nextBillingDate && daysUntil(s.nextBillingDate) >= 0 && daysUntil(s.nextBillingDate) <= 30)
    .sort((a, b) => {
      if (!a.nextBillingDate || !b.nextBillingDate) return 0
      return new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()
    })

  // Build category data with amounts
  const categoryMap = active.reduce(
    (acc, s) => {
      const cat = s.category || 'Uncategorized'
      const converted = convertCurrency(s.price, s.currency as SupportedCurrency, currency)
      const monthlyAmount =
        s.billingCycle === 'yearly' ? converted / 12 :
        s.billingCycle === 'weekly' ? converted * 4.33 :
        converted
      if (!acc[cat]) acc[cat] = { count: 0, amount: 0 }
      acc[cat].count += 1
      acc[cat].amount += monthlyAmount
      return acc
    },
    {} as Record<string, { count: number; amount: number }>,
  )

  const categoryData: CategoryData[] = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .map(([name, data], i) => ({
      name,
      count: data.count,
      amount: data.amount,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyTotal, currency)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Yearly Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(yearlyTotal, currency)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Subs</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{active.length}</div>
            <p className="text-xs text-muted-foreground">
              {subscriptions.length - active.length} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcoming.length}</div>
            <p className="text-xs text-muted-foreground">in the next 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Renewals</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming renewals</p>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 5).map((s) => {
                  const iconSlug = getIconSlugByName(s.name)
                  const days = daysUntil(s.nextBillingDate!)
                  const isUrgent = days <= 3
                  return (
                    <div key={s.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {iconSlug ? (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                            <BrandIcon slug={iconSlug} size={16} />
                          </div>
                        ) : (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                            {s.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(s.nextBillingDate!)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-sm font-medium">
                          {formatCurrency(s.price, s.currency as SupportedCurrency)}
                        </span>
                        <span className={`text-xs ${isUrgent ? 'font-medium text-destructive' : 'text-muted-foreground'}`}>
                          {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d left`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories yet</p>
            ) : (
              <div className="flex items-center gap-6">
                <DonutChart categories={categoryData} totalCount={active.length} />
                <div className="flex-1 space-y-3">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-sm truncate">{cat.name}</span>
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap">
                        {formatCurrency(cat.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
