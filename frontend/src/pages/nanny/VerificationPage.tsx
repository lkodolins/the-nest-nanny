import { type ReactNode, useState } from 'react'
import { Shield, Upload, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui'
import { useVerificationStatus, useSubmitReference } from '@/queries/useVerification'
import { verificationService } from '@/services/verificationService'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/config/queryKeys'
import type { VerificationRecord } from '@/types/verification'

type VerificationStatus = VerificationRecord['status']

const stepIcons: Record<string, ReactNode> = {
  'identity': <Shield className="h-5 w-5" />,
  'background_check': <FileText className="h-5 w-5" />,
  'certifications': <Upload className="h-5 w-5" />,
  'references': <FileText className="h-5 w-5" />,
}

function mapStatus(status: VerificationStatus): 'completed' | 'pending' | 'incomplete' {
  switch (status) {
    case 'approved': return 'completed'
    case 'in_progress':
    case 'pending': return 'pending'
    default: return 'incomplete'
  }
}

const statusConfig = {
  completed: { label: 'Completed', icon: <CheckCircle className="h-4 w-4" />, color: 'text-success-700 bg-success-50' },
  pending: { label: 'Under Review', icon: <Clock className="h-4 w-4" />, color: 'text-warning-700 bg-warning-50' },
  incomplete: { label: 'Not Started', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-charcoal-muted bg-cream-200' },
}

export function VerificationPage() {
  const { data: records, isLoading, error } = useVerificationStatus()
  const queryClient = useQueryClient()

  const steps = records ?? []
  const completedCount = steps.filter((s) => mapStatus(s.status) === 'completed').length
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0

  const overallStatus: VerificationStatus = steps.length > 0 && steps.every((s) => s.status === 'approved')
    ? 'approved'
    : 'in_progress'

  const submitReference = useSubmitReference()
  const [showRefForm, setShowRefForm] = useState(false)
  const [refForm, setRefForm] = useState({ referee_name: '', referee_email: '', referee_phone: '', relationship: '', years_known: 1 })
  const [startingStep, setStartingStep] = useState<string | null>(null)
  const [stepMessage, setStepMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null)

  const handleStartVerification = async (stepType: string) => {
    if (stepType === 'references') {
      setShowRefForm(true)
      return
    }
    if (stepType === 'certifications') {
      window.location.href = '/nanny/profile'
      return
    }

    setStartingStep(stepType)
    setStepMessage(null)
    try {
      const data = await verificationService.startVerificationStep(stepType)
      queryClient.invalidateQueries({ queryKey: queryKeys.verification.status() })
      if (data.verification_url) {
        setStepMessage({ type: 'success', text: 'Verification started! A new tab has been opened.' })
        window.open(data.verification_url, '_blank')
      }
    } catch (err: unknown) {
      const detail = (err as Record<string, unknown>)?.detail
      const alreadyStarted = (err as Record<string, unknown>)?.already_started
      if (alreadyStarted) {
        setStepMessage({ type: 'info', text: typeof detail === 'string' ? detail : 'This step has already been started.' })
      } else {
        setStepMessage({ type: 'error', text: typeof detail === 'string' ? detail : 'Failed to start verification. Please try again.' })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.verification.status() })
    } finally {
      setStartingStep(null)
    }
  }

  const handleSubmitReference = () => {
    submitReference.mutate(refForm, {
      onSuccess: () => {
        setShowRefForm(false)
        setRefForm({ referee_name: '', referee_email: '', referee_phone: '', relationship: '', years_known: 1 })
        setStepMessage({ type: 'success', text: 'Reference submitted successfully!' })
      },
    })
  }

  if (error) {
    return (
      <div>
        <p className="section-label mb-2">NANNIES</p>
        <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Verification</h1>
        <p className="mb-6 text-charcoal-muted">Complete your verification to earn the trusted badge</p>
        <div className="rounded-2xl border border-error-500/30 bg-error-50/30 p-8 text-center">
          <p className="text-error-700">Failed to load verification status. Please try again later.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div>
        <p className="section-label mb-2">NANNIES</p>
        <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Verification</h1>
        <p className="mb-6 text-charcoal-muted">Complete your verification to earn the trusted badge</p>
        <div className="mb-6 rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
          <Skeleton className="mb-3" width={200} height={22} />
          <Skeleton className="mb-2" height={12} />
          <Skeleton width={300} height={14} />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
              <div className="flex items-start gap-4">
                <Skeleton width={44} height={44} />
                <div className="flex-1">
                  <Skeleton className="mb-2" width={180} height={18} />
                  <Skeleton width={250} height={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Empty state - no verification records yet
  if (steps.length === 0) {
    return (
      <div>
        <p className="section-label mb-2">NANNIES</p>
        <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Verification</h1>
        <p className="mb-6 text-charcoal-muted">Complete your verification to earn the trusted badge</p>
        <div className="rounded-2xl border border-cream-300 bg-white p-12 shadow-card text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/10">
            <Shield className="h-7 w-7 text-gold-400" />
          </div>
          <h3 className="mb-2 font-serif text-lg text-charcoal">No verification started</h3>
          <p className="mb-6 text-sm text-charcoal-muted">
            Start your verification process to earn a trusted badge and appear higher in search results.
          </p>
          <button
            onClick={() => handleStartVerification('identity')}
            disabled={startingStep === 'identity'}
            className="rounded-xl bg-gold-400 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-500 disabled:opacity-50"
          >
            {startingStep === 'identity' ? 'Starting...' : 'Start Verification'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="section-label mb-2">NANNIES</p>
      <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Verification</h1>
      <p className="mb-6 text-charcoal-muted">Complete your verification to earn the trusted badge</p>

      {/* Status message */}
      {stepMessage && (
        <div className={cn(
          'mb-4 rounded-xl p-3 text-sm',
          stepMessage.type === 'success' && 'bg-success-50 text-success-700',
          stepMessage.type === 'info' && 'bg-warning-50 text-warning-700',
          stepMessage.type === 'error' && 'bg-error-50 text-error-700',
        )}>
          {stepMessage.text}
        </div>
      )}

      {/* Progress card */}
      <div className="mb-6 rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-lg text-charcoal">Verification Progress</h3>
          <span className="text-sm font-medium text-gold-400">
            {completedCount}/{steps.length} complete
          </span>
        </div>
        <div className="mb-2 h-3 rounded-full bg-cream-200">
          <div
            className="h-3 rounded-full bg-gold-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-charcoal-muted">
          {overallStatus === 'approved'
            ? 'All verification steps are complete. You have the verified badge!'
            : 'Complete all steps to get your verified badge and appear higher in search results.'}
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step) => {
          const uiStatus = mapStatus(step.status)
          const config = statusConfig[uiStatus]
          return (
            <div
              key={step.id}
              className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  uiStatus === 'completed' ? 'bg-success-50 text-success-700' : 'bg-gold-400/10 text-gold-400'
                )}>
                  {stepIcons[step.step] || <FileText className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-charcoal">{step.step_display || step.step}</h3>
                    <span className={cn('pill-badge flex items-center gap-1 text-xs font-medium', config.color)}>
                      {config.icon}
                      {config.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-charcoal-muted">
                    {step.notes || `Complete your ${(step.step_display || step.step).toLowerCase()} verification`}
                  </p>
                  {uiStatus === 'incomplete' && (
                    <button
                      onClick={() => handleStartVerification(step.step)}
                      disabled={startingStep === step.step || submitReference.isPending}
                      className="mt-3 rounded-lg bg-gold-400/10 px-4 py-2 text-xs font-medium text-gold-600 transition-colors hover:bg-gold-400/20 disabled:opacity-50"
                    >
                      {startingStep === step.step ? 'Starting...' : step.step === 'references' ? 'Submit Reference' : step.step === 'certifications' ? 'Upload Certifications' : 'Start Verification'}
                    </button>
                  )}
                  {uiStatus === 'pending' && step.updated_at && (
                    <p className="mt-2 text-xs text-warning-700">
                      Submitted on {new Date(step.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. Usually takes 1-2 business days.
                    </p>
                  )}
                  {step.status === 'rejected' && step.rejection_reason && (
                    <p className="mt-2 text-xs text-error-700">
                      Rejected: {step.rejection_reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Reference submission form */}
      {showRefForm && (
        <div className="mt-6 rounded-2xl border border-gold-400/30 bg-white p-6 shadow-card">
          <h3 className="mb-4 font-serif text-lg text-charcoal">Submit a Reference</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal-muted">Referee Name *</label>
              <input value={refForm.referee_name} onChange={(e) => setRefForm({ ...refForm, referee_name: e.target.value })} className="w-full rounded-lg border border-cream-300 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal-muted">Referee Email *</label>
              <input type="email" value={refForm.referee_email} onChange={(e) => setRefForm({ ...refForm, referee_email: e.target.value })} className="w-full rounded-lg border border-cream-300 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal-muted">Phone</label>
              <input value={refForm.referee_phone} onChange={(e) => setRefForm({ ...refForm, referee_phone: e.target.value })} className="w-full rounded-lg border border-cream-300 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal-muted">Relationship *</label>
              <input value={refForm.relationship} onChange={(e) => setRefForm({ ...refForm, relationship: e.target.value })} placeholder="e.g. Former employer" className="w-full rounded-lg border border-cream-300 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal-muted">Years Known</label>
              <input type="number" min={0} value={refForm.years_known} onChange={(e) => setRefForm({ ...refForm, years_known: Number(e.target.value) })} className="w-full rounded-lg border border-cream-300 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={handleSubmitReference} disabled={!refForm.referee_name || !refForm.referee_email || !refForm.relationship || submitReference.isPending} className="rounded-xl bg-gold-400 px-5 py-2 text-sm font-medium text-white hover:bg-gold-500 disabled:opacity-50">
              {submitReference.isPending ? 'Submitting...' : 'Submit Reference'}
            </button>
            <button onClick={() => setShowRefForm(false)} className="rounded-xl border border-cream-300 px-5 py-2 text-sm text-charcoal-muted hover:bg-cream-100">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerificationPage
