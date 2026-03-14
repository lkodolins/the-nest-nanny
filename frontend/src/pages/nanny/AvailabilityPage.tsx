import { useState, useEffect, useCallback } from 'react'
import { Clock, ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui'
import { useOwnNannyProfile, useNannyAvailability, useSetNannyAvailability } from '@/queries/useNannies'
import { apiClient } from '@/lib/api/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { NannyAvailability } from '@/types/nanny'

interface TimeOffEntry {
  id: number
  date: string
  reason: string
  created_at: string
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const dayToNumber: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }
const numberToDay: Record<number, string> = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 0: 'Sun' }

const timeSlots = [
  { label: 'Morning', time: '8:00 - 12:00', start: '08:00', end: '12:00' },
  { label: 'Afternoon', time: '12:00 - 17:00', start: '12:00', end: '17:00' },
  { label: 'Evening', time: '17:00 - 21:00', start: '17:00', end: '21:00' },
]

function slotMatchesTimeSlot(slot: NannyAvailability, ts: typeof timeSlots[number]): boolean {
  return slot.start_time <= ts.start && slot.end_time >= ts.end
}

function buildScheduleFromAvailability(availability: NannyAvailability[]): Record<string, string[]> {
  const schedule: Record<string, string[]> = {}
  days.forEach((d) => { schedule[d] = [] })

  availability.forEach((slot) => {
    const day = numberToDay[slot.day_of_week]
    if (!day) return
    timeSlots.forEach((ts) => {
      if (slotMatchesTimeSlot(slot, ts) && !schedule[day].includes(ts.label)) {
        schedule[day].push(ts.label)
      }
    })
  })

  return schedule
}

export function AvailabilityPage() {
  const { data: profile } = useOwnNannyProfile()
  const nannyId = profile?.id
  const { data: availability, isLoading, error } = useNannyAvailability(nannyId)
  const setAvailability = useSetNannyAvailability()

  const [schedule, setSchedule] = useState<Record<string, string[]>>(() => {
    const s: Record<string, string[]> = {}
    days.forEach((d) => { s[d] = [] })
    return s
  })
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [showTimeOffForm, setShowTimeOffForm] = useState(false)
  const [timeOffDate, setTimeOffDate] = useState('')
  const [timeOffReason, setTimeOffReason] = useState('')

  const queryClient = useQueryClient()
  const { data: timeOffEntries = [] } = useQuery<TimeOffEntry[]>({
    queryKey: ['nannies', 'time-off'],
    queryFn: () => apiClient.get('nannies/me/time-off/').then(r => r.data),
  })

  const addTimeOff = useMutation({
    mutationFn: (data: { date: string; reason: string }) =>
      apiClient.post('nannies/me/time-off/', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nannies', 'time-off'] })
      setShowTimeOffForm(false)
      setTimeOffDate('')
      setTimeOffReason('')
    },
  })

  const removeTimeOff = useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`nannies/me/time-off/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nannies', 'time-off'] })
    },
  })

  useEffect(() => {
    if (availability) {
      setSchedule(buildScheduleFromAvailability(availability))
    }
  }, [availability])

  const toggleSlot = useCallback((day: string, slotLabel: string) => {
    setSchedule((prev) => {
      const daySlots = [...(prev[day] || [])]
      const idx = daySlots.indexOf(slotLabel)
      if (idx >= 0) {
        daySlots.splice(idx, 1)
      } else {
        daySlots.push(slotLabel)
      }
      return { ...prev, [day]: daySlots }
    })
  }, [])

  const handleSave = () => {
    setSaveMessage(null)
    const slots: Omit<NannyAvailability, 'id'>[] = []

    days.forEach((day) => {
      const dayNum = dayToNumber[day]
      schedule[day].forEach((slotLabel) => {
        const ts = timeSlots.find((t) => t.label === slotLabel)
        if (!ts) return
        slots.push({
          day_of_week: dayNum,
          start_time: ts.start,
          end_time: ts.end,
          is_recurring: true,
          specific_date: null,
        })
      })
    })

    setAvailability.mutate(slots, {
      onSuccess: () => setSaveMessage('Schedule saved successfully!'),
      onError: () => setSaveMessage('Failed to save schedule. Please try again.'),
    })
  }

  // Calendar state
  const now = new Date()
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [calYear, setCalYear] = useState(now.getFullYear())
  const today = now.getDate()
  const isCurrentMonth = calMonth === now.getMonth() && calYear === now.getFullYear()

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDayOfWeek = (new Date(calYear, calMonth, 1).getDay() + 6) % 7 // 0=Mon
  const monthName = new Date(calYear, calMonth).toLocaleString('en', { month: 'long', year: 'numeric' })

  if (error) {
    return (
      <div>
        <p className="section-label mb-2">NANNIES</p>
        <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Availability</h1>
        <p className="mb-6 text-charcoal-muted">Set your weekly schedule and time off</p>
        <div className="rounded-2xl border border-error-500/30 bg-error-50/30 p-8 text-center">
          <p className="text-error-700">Failed to load availability. Please try again later.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div>
        <p className="section-label mb-2">NANNIES</p>
        <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Availability</h1>
        <p className="mb-6 text-charcoal-muted">Set your weekly schedule and time off</p>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
              <Skeleton className="mb-5" width={180} height={22} />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} height={48} />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
              <Skeleton className="mb-4" width={120} height={20} />
              <Skeleton height={200} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="section-label mb-2">NANNIES</p>
      <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Availability</h1>
      <p className="mb-6 text-charcoal-muted">Set your weekly schedule and time off</p>

      {saveMessage && (
        <div className={`mb-4 rounded-xl p-3 text-sm ${setAvailability.isError ? 'bg-error-50 text-error-700' : 'bg-success-50 text-success-700'}`}>
          {saveMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly schedule */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
            <h3 className="mb-5 font-serif text-lg text-charcoal">Weekly Schedule</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="pb-3 pr-3 text-left font-medium text-charcoal-muted">Time</th>
                    {days.map((d) => (
                      <th key={d} className="pb-3 text-center font-medium text-charcoal-muted">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={slot.label}>
                      <td className="py-2 pr-3">
                        <p className="font-medium text-charcoal">{slot.label}</p>
                        <p className="text-xs text-charcoal-muted">{slot.time}</p>
                      </td>
                      {days.map((d) => {
                        const available = schedule[d]?.includes(slot.label)
                        return (
                          <td key={d} className="p-1 text-center">
                            <button
                              onClick={() => toggleSlot(d, slot.label)}
                              className={cn(
                                'h-10 w-full rounded-lg transition-colors',
                                available
                                  ? 'bg-gold-400/15 text-gold-600 hover:bg-gold-400/25'
                                  : 'bg-cream-100 text-charcoal-muted hover:bg-cream-200'
                              )}
                            >
                              {available ? (
                                <Clock className="mx-auto h-4 w-4" />
                              ) : (
                                <span className="text-xs">--</span>
                              )}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-charcoal-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-gold-400/15" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-cream-100" /> Unavailable
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Calendar preview */}
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-base text-charcoal">{monthName}</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) }
                    else setCalMonth(calMonth - 1)
                  }}
                  className="rounded-lg p-1 hover:bg-cream-200"
                >
                  <ChevronLeft className="h-4 w-4 text-charcoal-muted" />
                </button>
                <button
                  onClick={() => {
                    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) }
                    else setCalMonth(calMonth + 1)
                  }}
                  className="rounded-lg p-1 hover:bg-cream-200"
                >
                  <ChevronRight className="h-4 w-4 text-charcoal-muted" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i} className="py-1 text-charcoal-muted">{d}</span>
              ))}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <span key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                const dayOfWeek = (new Date(calYear, calMonth, d).getDay() + 6) % 7
                return (
                  <button
                    key={d}
                    className={cn(
                      'rounded-lg py-1.5 transition-colors',
                      isCurrentMonth && d === today
                        ? 'bg-gold-400 font-medium text-white'
                        : dayOfWeek >= 5
                        ? 'text-charcoal-muted'
                        : 'text-charcoal hover:bg-cream-200'
                    )}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time off */}
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
            <h3 className="mb-4 font-serif text-base text-charcoal">Time Off</h3>
            {timeOffEntries.length === 0 && !showTimeOffForm && (
              <p className="text-sm text-charcoal-muted">No time off scheduled.</p>
            )}
            {timeOffEntries.length > 0 && (
              <div className="mb-3 space-y-2">
                {timeOffEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-lg bg-cream-100 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-charcoal">
                        {new Date(entry.date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      {entry.reason && <p className="text-xs text-charcoal-muted">{entry.reason}</p>}
                    </div>
                    <button
                      onClick={() => removeTimeOff.mutate(entry.id)}
                      className="rounded p-1 text-charcoal-muted hover:bg-cream-200 hover:text-error-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {showTimeOffForm ? (
              <div className="space-y-2">
                <input
                  type="date"
                  value={timeOffDate}
                  onChange={(e) => setTimeOffDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-cream-300 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={timeOffReason}
                  onChange={(e) => setTimeOffReason(e.target.value)}
                  placeholder="Reason (optional)"
                  className="w-full rounded-lg border border-cream-300 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => timeOffDate && addTimeOff.mutate({ date: timeOffDate, reason: timeOffReason })}
                    disabled={!timeOffDate || addTimeOff.isPending}
                    className="flex-1 rounded-lg bg-gold-400 py-2 text-xs font-medium text-white hover:bg-gold-500 disabled:opacity-50"
                  >
                    {addTimeOff.isPending ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    onClick={() => { setShowTimeOffForm(false); setTimeOffDate(''); setTimeOffReason('') }}
                    className="rounded-lg border border-cream-300 px-3 py-2 text-xs text-charcoal-muted hover:bg-cream-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowTimeOffForm(true)}
                className="mt-3 w-full rounded-xl border border-dashed border-cream-300 py-2 text-sm text-charcoal-muted hover:border-gold-400 hover:text-gold-400"
              >
                + Add time off
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={setAvailability.isPending}
          className="rounded-xl bg-gold-400 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-500 disabled:opacity-50"
        >
          {setAvailability.isPending ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
    </div>
  )
}

export default AvailabilityPage
