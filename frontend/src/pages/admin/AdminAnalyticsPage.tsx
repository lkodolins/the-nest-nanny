import { Users, DollarSign, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAdminAnalytics, useAdminNotifications } from '@/queries/useAdmin'
import { Spinner } from '@/components/ui/Spinner'

// Fallback static data used when the API returns partial / no data
const fallbackActivity = [
  { action: 'New family registered', user: 'Jane Smith', time: '5 min ago' },
  { action: 'Nanny verification approved', user: 'Anna K.', time: '12 min ago' },
  { action: 'New booking created', user: 'Johnson Family', time: '25 min ago' },
  { action: 'Payment processed', user: 'Smith Family', time: '1 hour ago' },
  { action: 'Dispute opened', user: 'Williams Family', time: '2 hours ago' },
  { action: 'New nanny registered', user: 'Laura B.', time: '3 hours ago' },
]

export function AdminAnalyticsPage() {
  const { data: analytics, isLoading: loadingAnalytics, isError: errorAnalytics } = useAdminAnalytics()
  const { data: notifications } = useAdminNotifications()

  const stats = [
    {
      label: 'Total Users',
      value: analytics ? analytics.total_users.toLocaleString() : '--',
      change: '+12%',
      up: true,
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: 'Active Bookings',
      value: analytics ? analytics.active_bookings.toLocaleString() : '--',
      change: '+8%',
      up: true,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: 'Monthly Revenue',
      value: analytics
        ? `\u20AC${analytics.monthly_revenue.toLocaleString()}`
        : '--',
      change: '+15%',
      up: true,
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      label: 'Churn Rate',
      value: analytics?.churn_rate != null ? `${analytics.churn_rate}%` : '-- %',
      change: '-0.5%',
      up: false,
      icon: <TrendingUp className="h-5 w-5" />,
    },
  ]

  const recentActivity = notifications && notifications.length > 0
    ? notifications.map((n) => ({ action: n.action, user: n.user, time: n.time }))
    : fallbackActivity

  if (loadingAnalytics) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (errorAnalytics) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-serif text-xl text-charcoal">Failed to load analytics</p>
        <p className="mt-2 text-sm text-charcoal-muted">
          Please check your connection and try again.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="section-label mb-2">ADMIN</p>
      <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Analytics</h1>
      <p className="mb-6 text-charcoal-muted">Platform overview and key metrics</p>

      {/* Stats grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-lg bg-gold-400/10 p-2 text-gold-400">{s.icon}</span>
              <span className={cn(
                'flex items-center gap-0.5 text-xs font-medium',
                s.up ? 'text-success-700' : 'text-error-700'
              )}>
                {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {s.change}
              </span>
            </div>
            <p className="font-serif text-2xl text-charcoal">{s.value}</p>
            <p className="mt-0.5 text-sm text-charcoal-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart placeholder */}
        <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
          <h3 className="mb-4 font-serif text-lg text-charcoal">User Growth</h3>
          <div className="flex h-56 items-end justify-around gap-2">
            {(analytics?.user_growth ?? [
              { month: 'Oct', count: 45 },
              { month: 'Nov', count: 55 },
              { month: 'Dec', count: 60 },
              { month: 'Jan', count: 68 },
              { month: 'Feb', count: 78 },
              { month: 'Mar', count: 90 },
            ]).map((item) => {
              return (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-gold-400/20 transition-all"
                    style={{ height: `${item.count}%` }}
                  />
                  <span className="text-xs text-charcoal-muted">{item.month}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Revenue chart placeholder */}
        <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
          <h3 className="mb-4 font-serif text-lg text-charcoal">Revenue</h3>
          <div className="flex h-56 items-end justify-around gap-2">
            {(analytics?.revenue_growth ?? [
              { month: 'Oct', amount: 35 },
              { month: 'Nov', amount: 48 },
              { month: 'Dec', amount: 72 },
              { month: 'Jan', amount: 58 },
              { month: 'Feb', amount: 65 },
              { month: 'Mar', amount: 85 },
            ]).map((item) => {
              return (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-success-500/20 transition-all"
                    style={{ height: `${item.amount}%` }}
                  />
                  <span className="text-xs text-charcoal-muted">{item.month}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-cream-300 bg-white shadow-card lg:col-span-2">
          <div className="border-b border-cream-200 p-5">
            <h3 className="font-serif text-lg text-charcoal">Recent Activity</h3>
          </div>
          <div className="divide-y divide-cream-200">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <div className="h-2 w-2 rounded-full bg-gold-400" />
                <div className="flex-1">
                  <p className="text-sm text-charcoal">
                    <span className="font-medium">{a.action}</span>
                    {' -- '}
                    <span className="text-charcoal-muted">{a.user}</span>
                  </p>
                </div>
                <span className="text-xs text-charcoal-muted">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalyticsPage
