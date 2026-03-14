import { CheckCircle, XCircle, Clock, Eye, Shield, FileText } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAdminVerificationQueue, useAdminUpdateVerification } from '@/queries/useAdmin'
import { Spinner } from '@/components/ui/Spinner'

const statusStyles: Record<string, string> = {
  pending: 'bg-warning-50 text-warning-700',
  approved: 'bg-success-50 text-success-700',
  rejected: 'bg-error-50 text-error-700',
}

const priorityStyles: Record<string, string> = {
  high: 'bg-error-50 text-error-700',
  medium: 'bg-warning-50 text-warning-700',
  low: 'bg-cream-200 text-charcoal-muted',
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function AdminVerificationQueuePage() {
  const { data: verifications, isLoading, isError } = useAdminVerificationQueue()
  const updateMutation = useAdminUpdateVerification()

  const items = verifications ?? []
  const pendingCount = items.filter((v) => v.status === 'pending').length

  function handleApprove(id: string | number) {
    updateMutation.mutate({ id, data: { status: 'approved' } })
  }

  function handleReject(id: string | number) {
    updateMutation.mutate({ id, data: { status: 'rejected' } })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-serif text-xl text-charcoal">Failed to load verification queue</p>
        <p className="mt-2 text-sm text-charcoal-muted">
          Please check your connection and try again.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="section-label mb-2">ADMIN</p>
      <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Verification Queue</h1>
      <p className="mb-6 text-charcoal-muted">Review and process nanny verification requests</p>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Pending', value: pendingCount.toString(), icon: <Clock className="h-5 w-5" />, color: 'text-warning-700' },
          {
            label: 'Approved Today',
            value: items.filter((v) => v.status === 'approved').length.toString(),
            icon: <CheckCircle className="h-5 w-5" />,
            color: 'text-success-700',
          },
          {
            label: 'Rejected Today',
            value: items.filter((v) => v.status === 'rejected').length.toString(),
            icon: <XCircle className="h-5 w-5" />,
            color: 'text-error-700',
          },
          { label: 'Avg. Review Time', value: '1.2d', icon: <Shield className="h-5 w-5" />, color: 'text-gold-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-charcoal-muted">{s.label}</p>
              <span className={cn('rounded-lg bg-cream-200 p-1.5', s.color)}>{s.icon}</span>
            </div>
            <p className="font-serif text-2xl text-charcoal">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="rounded-2xl border border-cream-300 bg-white p-12 text-center shadow-card">
          <p className="font-serif text-lg text-charcoal">No verification requests</p>
          <p className="mt-2 text-sm text-charcoal-muted">
            The queue is empty. New requests will appear here.
          </p>
        </div>
      )}

      {/* Queue */}
      <div className="space-y-3">
        {items.map((v) => {
          const initials = getInitials(v.nanny_name)
          const priority = v.priority ?? 'low'
          const submitted = new Date(v.submitted_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })
          const isMutating = updateMutation.isPending && updateMutation.variables?.id === v.id

          return (
            <div key={v.id} className="rounded-2xl border border-cream-300 bg-white p-5 shadow-card">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-400/10 font-serif text-sm text-gold-600">
                  {initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-charcoal">{v.nanny_name}</p>
                    <span className={cn('pill-badge text-[10px] font-medium uppercase', priorityStyles[priority])}>
                      {priority}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-charcoal-muted">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> {v.verification_type}
                    </span>
                    <span>Submitted {submitted}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('pill-badge text-xs font-medium capitalize', statusStyles[v.status])}>
                    {v.status}
                  </span>
                  {v.status === 'pending' && (
                    <>
                      {v.document_url && (
                        <a
                          href={v.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-2 text-charcoal-muted hover:bg-cream-200"
                          title="Review document"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      )}
                      {!v.document_url && (
                        <button className="rounded-lg p-2 text-charcoal-muted hover:bg-cream-200" title="Review">
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleApprove(v.id)}
                        disabled={isMutating}
                        className="rounded-lg p-2 text-success-700 hover:bg-success-50 disabled:opacity-50"
                        title="Approve"
                      >
                        {isMutating ? <Spinner size="sm" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleReject(v.id)}
                        disabled={isMutating}
                        className="rounded-lg p-2 text-error-700 hover:bg-error-50 disabled:opacity-50"
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminVerificationQueuePage
