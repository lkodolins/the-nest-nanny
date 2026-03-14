import { useState, useCallback } from 'react'
import { Bell, Lock, Globe, Eye, Trash2 } from 'lucide-react'

const STORAGE_KEY = 'nest-nanny-settings'

interface NannySettings {
  notifications: {
    newBookingRequests: boolean
    messages: boolean
    bookingReminders: boolean
    reviewNotifications: boolean
    marketingEmails: boolean
  }
  privacy: {
    showInSearch: boolean
    showLastName: boolean
    showPhone: boolean
  }
  language: string
  timezone: string
}

const defaultSettings: NannySettings = {
  notifications: {
    newBookingRequests: true,
    messages: true,
    bookingReminders: true,
    reviewNotifications: false,
    marketingEmails: false,
  },
  privacy: {
    showInSearch: true,
    showLastName: false,
    showPhone: false,
  },
  language: 'English',
  timezone: 'Europe/Riga (GMT+2)',
}

function loadSettings(): NannySettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) }
  } catch {
    // ignore
  }
  return defaultSettings
}

function saveSettings(settings: NannySettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

export function NannySettingsPage() {
  const [settings, setSettings] = useState<NannySettings>(loadSettings)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const updateSettings = useCallback((updater: (prev: NannySettings) => NannySettings) => {
    setSettings((prev) => {
      const next = updater(prev)
      saveSettings(next)
      return next
    })
    setSaveMessage('Settings saved')
    setTimeout(() => setSaveMessage(null), 2000)
  }, [])

  const toggleNotification = (key: keyof NannySettings['notifications']) => {
    updateSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }))
  }

  const togglePrivacy = (key: keyof NannySettings['privacy']) => {
    updateSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: !prev.privacy[key] },
    }))
  }

  const notificationItems = [
    { key: 'newBookingRequests' as const, label: 'New booking requests', description: 'Get notified when a family requests a booking' },
    { key: 'messages' as const, label: 'Messages', description: 'Get notified when you receive a new message' },
    { key: 'bookingReminders' as const, label: 'Booking reminders', description: 'Receive reminders before upcoming sessions' },
    { key: 'reviewNotifications' as const, label: 'Review notifications', description: 'Get notified when a family leaves a review' },
    { key: 'marketingEmails' as const, label: 'Marketing emails', description: 'Tips, updates, and promotional content' },
  ]

  const privacyItems = [
    { key: 'showInSearch' as const, label: 'Show profile in search results' },
    { key: 'showLastName' as const, label: 'Show last name to families' },
    { key: 'showPhone' as const, label: 'Show phone number on profile' },
  ]

  return (
    <div>
      <p className="section-label mb-2">NANNIES</p>
      <h1 className="mb-1 font-serif text-heading-lg text-charcoal">Settings</h1>
      <p className="mb-6 text-charcoal-muted">Manage your account preferences</p>

      {saveMessage && (
        <div className="mb-4 rounded-xl bg-success-50 p-3 text-sm text-success-700">
          {saveMessage}
        </div>
      )}

      <div className="space-y-6">
        {/* Notifications */}
        <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
              <Bell className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg text-charcoal">Notifications</h3>
          </div>
          <div className="space-y-4">
            {notificationItems.map((n) => (
              <div key={n.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal">{n.label}</p>
                  <p className="text-xs text-charcoal-muted">{n.description}</p>
                </div>
                <button
                  onClick={() => toggleNotification(n.key)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings.notifications[n.key] ? 'bg-gold-400' : 'bg-cream-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-card transition-transform ${
                      settings.notifications[n.key] ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg text-charcoal">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal">Password</p>
                <p className="text-xs text-charcoal-muted">Last changed 30 days ago</p>
              </div>
              <button className="rounded-lg bg-gold-400/10 px-4 py-2 text-xs font-medium text-gold-600 hover:bg-gold-400/20">
                Change Password
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal">Two-factor authentication</p>
                <p className="text-xs text-charcoal-muted">Add an extra layer of security</p>
              </div>
              <button className="rounded-lg bg-gold-400/10 px-4 py-2 text-xs font-medium text-gold-600 hover:bg-gold-400/20">
                Enable
              </button>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
              <Eye className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg text-charcoal">Privacy</h3>
          </div>
          <div className="space-y-4">
            {privacyItems.map((p) => (
              <div key={p.key} className="flex items-center justify-between">
                <p className="text-sm text-charcoal">{p.label}</p>
                <button
                  onClick={() => togglePrivacy(p.key)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings.privacy[p.key] ? 'bg-gold-400' : 'bg-cream-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-card transition-transform ${
                      settings.privacy[p.key] ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10 text-gold-400">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg text-charcoal">Language & Region</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Language</label>
              <select
                value={settings.language}
                onChange={(e) => updateSettings((prev) => ({ ...prev, language: e.target.value }))}
                className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm focus:border-gold-400 focus:outline-none"
              >
                <option>English</option>
                <option>Latvian</option>
                <option>Russian</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => updateSettings((prev) => ({ ...prev, timezone: e.target.value }))}
                className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm focus:border-gold-400 focus:outline-none"
              >
                <option>Europe/Riga (GMT+2)</option>
                <option>Europe/Tallinn (GMT+2)</option>
                <option>Europe/Vilnius (GMT+2)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-error-500/30 bg-error-50/30 p-6">
          <div className="mb-3 flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-error-700" />
            <h3 className="font-serif text-lg text-error-700">Danger Zone</h3>
          </div>
          <p className="mb-4 text-sm text-charcoal-muted">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button className="rounded-xl border border-error-500 px-5 py-2 text-sm font-medium text-error-700 transition-colors hover:bg-error-500 hover:text-white">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}

export default NannySettingsPage
