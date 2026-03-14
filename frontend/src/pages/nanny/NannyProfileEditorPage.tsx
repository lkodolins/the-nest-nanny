import { useState, useEffect, useRef } from 'react'
import { User, Mail, Phone, MapPin, Camera } from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { useAuth } from '@/lib/auth/useAuth'
import { useOwnNannyProfile, useUpdateNannyProfile } from '@/queries/useNannies'
import { uploadNannyPhoto } from '@/services/nannyService'
import { useQueryClient } from '@tanstack/react-query'

export function NannyProfileEditorPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: profile, isLoading, error } = useOwnNannyProfile()
  const updateProfile = useUpdateNannyProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('')
  const [hourlyRate, setHourlyRate] = useState(0)
  const [bio, setBio] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setFirstName(profile.user.first_name)
      setLastName(profile.user.last_name)
      setEmail(profile.user.email)
      setPhone(profile.user.phone || '')
      setLocation(`${profile.city}, ${profile.country}`)
      setExperience(String(profile.years_experience))
      setHourlyRate(parseFloat(profile.hourly_rate) || 0)
      setBio(profile.bio)
      setLanguages(profile.languages.map((l) => l.name))
    }
  }, [profile])

  const getInitials = () => {
    if (profile) {
      return `${profile.user.first_name.charAt(0)}${profile.user.last_name.charAt(0)}`
    }
    if (user) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
    }
    return '??'
  }

  const getExperienceLabel = (years: number) => {
    if (years <= 2) return '1-2 years'
    if (years <= 5) return '3-5 years'
    if (years <= 7) return '5-7 years'
    if (years <= 10) return '8-10 years'
    return '10+ years'
  }

  const handleSave = () => {
    setSaveMessage(null)
    updateProfile.mutate(
      {
        bio,
        hourly_rate: hourlyRate,
        years_experience: Number(experience),
      } as Record<string, unknown>,
      {
        onSuccess: () => setSaveMessage('Profile saved successfully!'),
        onError: () => setSaveMessage('Failed to save profile. Please try again.'),
      },
    )
  }

  // Compute profile completion percentage
  const computeCompletion = () => {
    if (!profile) return 0
    let score = 0
    let total = 6
    if (profile.user.first_name && profile.user.last_name) score++
    if (profile.user.email) score++
    if (profile.city) score++
    if (parseFloat(profile.hourly_rate) > 0) score++
    if (profile.bio && profile.bio.length > 10) score++
    if (profile.languages.length > 0) score++
    return Math.round((score / total) * 100)
  }

  if (error) {
    return (
      <div>
        <p className="section-label mb-2">NANNIES</p>
        <h1 className="mb-1 font-serif text-heading-lg text-charcoal">My Profile</h1>
        <p className="mb-6 text-charcoal-muted">Edit your public profile seen by families</p>
        <div className="rounded-2xl border border-error-500/30 bg-error-50/30 p-8 text-center">
          <p className="text-error-700">Failed to load profile. Please try again later.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div>
        <p className="section-label mb-2">NANNIES</p>
        <h1 className="mb-1 font-serif text-heading-lg text-charcoal">My Profile</h1>
        <p className="mb-6 text-charcoal-muted">Edit your public profile seen by families</p>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card text-center">
              <Skeleton className="mx-auto mb-4" width={96} height={96} rounded />
              <Skeleton className="mx-auto mb-2" width={120} height={20} />
              <Skeleton className="mx-auto" width={100} height={16} />
            </div>
            <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
              <Skeleton className="mb-3" width={140} height={16} />
              <Skeleton className="mb-2" height={8} />
              <Skeleton width={200} height={12} />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
              <Skeleton className="mb-5" width={180} height={22} />
              <div className="grid gap-4 sm:grid-cols-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={i === 4 ? 'sm:col-span-2' : ''}>
                    <Skeleton className="mb-1.5" width={80} height={14} />
                    <Skeleton height={42} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const completion = computeCompletion()

  return (
    <div>
      <p className="section-label mb-2">NANNIES</p>
      <h1 className="mb-1 font-serif text-heading-lg text-charcoal">My Profile</h1>
      <p className="mb-6 text-charcoal-muted">Edit your public profile seen by families</p>

      {saveMessage && (
        <div className={`mb-4 rounded-xl p-3 text-sm ${updateProfile.isError ? 'bg-error-50 text-error-700' : 'bg-success-50 text-success-700'}`}>
          {saveMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card text-center">
            <div className="relative mx-auto mb-4 h-24 w-24">
              {profile?.photos?.find((p) => p.is_primary)?.image ? (
                <img
                  src={profile.photos.find((p) => p.is_primary)!.image}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gold-400/10 font-serif text-3xl text-gold-600">
                  {getInitials()}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploading(true)
                  try {
                    await uploadNannyPhoto(file, true)
                    queryClient.invalidateQueries({ queryKey: ['nannies'] })
                  } catch {
                    // silently fail
                  } finally {
                    setUploading(false)
                  }
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-white shadow-card hover:bg-gold-500 disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <h3 className="font-serif text-lg text-charcoal">
              {firstName} {lastName.charAt(0)}.
            </h3>
            <p className="text-sm text-charcoal-muted">{profile?.headline || 'Professional Nanny'}</p>
            <div className="mt-4 flex justify-center gap-2">
              {profile?.is_verified && <span className="pill-badge pill-gold">Verified</span>}
            </div>
          </div>

          {/* Profile completion */}
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
            <h3 className="mb-3 text-sm font-medium text-charcoal">Profile Completion</h3>
            <div className="mb-2 h-2 rounded-full bg-cream-200">
              <div className="h-2 rounded-full bg-gold-400" style={{ width: `${completion}%` }} />
            </div>
            <p className="text-xs text-charcoal-muted">
              {completion}% complete{completion < 100 ? ' -- add more details to reach 100%' : ''}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
            <h3 className="mb-5 font-serif text-lg text-charcoal">Basic Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-charcoal">First name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-cream-300 bg-cream-50 py-2.5 pl-10 pr-4 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-charcoal">Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 bg-cream-50 py-2.5 px-4 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-charcoal">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-cream-300 bg-cream-50 py-2.5 pl-10 pr-4 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-charcoal">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-cream-300 bg-cream-50 py-2.5 pl-10 pr-4 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-charcoal">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-cream-300 bg-cream-50 py-2.5 pl-10 pr-4 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional info */}
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
            <h3 className="mb-5 font-serif text-lg text-charcoal">Professional Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-charcoal">Experience</label>
                <select
                  value={profile ? getExperienceLabel(profile.years_experience) : experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm focus:border-gold-400 focus:outline-none"
                >
                  <option>1-2 years</option>
                  <option>3-5 years</option>
                  <option>5-7 years</option>
                  <option>8-10 years</option>
                  <option>10+ years</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-charcoal">Hourly rate (&euro;)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full rounded-xl border border-cream-300 bg-cream-50 py-2.5 px-4 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-charcoal">About me</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 bg-cream-50 py-2.5 px-4 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                />
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
            <h3 className="mb-4 font-serif text-lg text-charcoal">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {languages.length > 0 ? (
                languages.map((lang) => (
                  <span key={lang} className="pill-badge pill-gold">{lang}</span>
                ))
              ) : (
                <p className="text-sm text-charcoal-muted">No languages added yet.</p>
              )}
              <button className="pill-badge border border-dashed border-cream-300 text-charcoal-muted hover:border-gold-400 hover:text-gold-400">
                + Add language
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => profile && window.open(`/nannies/${profile.id}`, '_blank')}
              disabled={!profile}
              className="rounded-xl border border-cream-300 px-6 py-2.5 text-sm font-medium text-charcoal hover:bg-cream-100 disabled:opacity-50"
            >
              Preview Profile
            </button>
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="rounded-xl bg-gold-400 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-500 disabled:opacity-50"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NannyProfileEditorPage
