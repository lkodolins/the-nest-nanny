import { useState, useEffect, useRef } from 'react'
import { User, Mail, Phone, MapPin, Camera, Baby, Trash2, Plus } from 'lucide-react'
import { useAuth } from '@/lib/auth/useAuth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { familyService } from '@/services/familyService'
import { Skeleton } from '@/components/ui/Skeleton'
import { useSubscription } from '@/queries/usePayments'
import type { FamilyProfile } from '@/types/user'

interface Child {
  name: string
  age: number
  special_needs?: string
}

export function FamilyProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: familyProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['families', 'profile'],
    queryFn: () => familyService.getProfile(),
  })

  const { data: subscription } = useSubscription()

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<FamilyProfile>) => familyService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families', 'profile'] })
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.patch('auth/profile/', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
    },
  })

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [children, setChildren] = useState<Child[]>([])
  const [bio, setBio] = useState('')
  const [showAddChild, setShowAddChild] = useState(false)
  const [newChild, setNewChild] = useState<Child>({ name: '', age: 0, special_needs: '' })
  const [saveMsg, setSaveMsg] = useState<'success' | 'error' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)
      const { data } = await apiClient.patch('auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
    },
  })

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name)
      setLastName(user.last_name)
      setEmail(user.email)
      setPhone(user.phone ?? '')
    }
  }, [user])

  useEffect(() => {
    if (familyProfile) {
      setAddress(familyProfile.address ?? '')
      setChildren((familyProfile.children ?? []).map((c: { name?: string; age: number; special_needs?: string }) => ({ ...c, name: c.name ?? '' })))
      setBio(familyProfile.bio ?? '')
    }
  }, [familyProfile])

  const handleSubmit = async () => {
    setSaveMsg(null)
    try {
      // Save user fields (first_name, last_name, phone) to auth profile
      await updateUserMutation.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        phone,
      })
      // Save family-specific fields to family profile
      await updateProfileMutation.mutateAsync({
        address,
        children,
        bio: bio || null,
      } as Partial<FamilyProfile>)
      setSaveMsg('success')
    } catch {
      setSaveMsg('error')
    }
  }

  const handleAddChild = () => {
    if (!newChild.name.trim()) return
    const child: Child = {
      name: newChild.name.trim(),
      age: newChild.age,
    }
    if (newChild.special_needs?.trim()) {
      child.special_needs = newChild.special_needs.trim()
    }
    setChildren([...children, child])
    setNewChild({ name: '', age: 0, special_needs: '' })
    setShowAddChild(false)
  }

  const handleRemoveChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index))
  }

  const isSaving = updateProfileMutation.isPending || updateUserMutation.isPending
  const initials = user ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}` : '?'

  const ageLabel = (age: number) => {
    if (age === 0) return 'Under 1 year'
    return `${age} year${age !== 1 ? 's' : ''} old`
  }

  return (
    <div>
      <p className="section-label mb-2">FAMILIES</p>
      <h1 className="mb-1 font-serif text-heading-lg text-charcoal">My Profile</h1>
      <p className="mb-6 text-charcoal-muted">Manage your family profile information</p>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card text-center">
            {profileLoading ? (
              <>
                <Skeleton width={96} height={96} rounded className="mx-auto mb-4" />
                <Skeleton width={120} height={20} className="mx-auto mb-1" />
                <Skeleton width={80} height={14} className="mx-auto mb-4" />
              </>
            ) : (
              <>
                <div className="relative mx-auto mb-4 h-24 w-24">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gold-400/10 font-serif text-3xl text-gold-600">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={initials} className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadAvatarMutation.mutate(file)
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadAvatarMutation.isPending}
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-white shadow-card hover:bg-gold-500 disabled:opacity-50"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-serif text-lg text-charcoal">
                  {user?.first_name} {user?.last_name}
                </h3>
                <p className="text-sm text-charcoal-muted">Family account</p>
                <div className="mt-4 flex justify-center gap-2">
                  {user?.is_email_verified && (
                    <span className="pill-badge pill-gold">Verified</span>
                  )}
                  {subscription && subscription.status === 'active' && (
                    <span className="pill-badge pill-cream capitalize">{subscription.plan.replace('family_', '')}</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Profile form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal info */}
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
            <h3 className="mb-5 font-serif text-lg text-charcoal">Personal Information</h3>
            {profileLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={i === 4 ? 'sm:col-span-2' : ''}>
                    <Skeleton width="30%" height={14} className="mb-2" />
                    <Skeleton width="100%" height={40} />
                  </div>
                ))}
              </div>
            ) : (
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
                      disabled
                      className="w-full rounded-xl border border-cream-300 bg-cream-100 py-2.5 pl-10 pr-4 text-sm text-charcoal-muted"
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
                  <label className="mb-1.5 block text-sm font-medium text-charcoal">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-cream-300 bg-cream-50 py-2.5 pl-10 pr-4 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Children */}
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-serif text-lg text-charcoal">Children</h3>
              <button
                onClick={() => setShowAddChild(true)}
                className="flex items-center gap-1 text-sm text-gold-400 hover:text-gold-500"
              >
                <Plus className="h-3.5 w-3.5" />
                Add child
              </button>
            </div>

            {/* Add child form */}
            {showAddChild && (
              <div className="mb-4 rounded-xl border border-gold-400/30 bg-gold-400/5 p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-charcoal-muted">Name *</label>
                    <input
                      type="text"
                      value={newChild.name}
                      onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                      placeholder="Child's name"
                      className="w-full rounded-lg border border-cream-300 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-charcoal-muted">Age</label>
                    <select
                      value={newChild.age}
                      onChange={(e) => setNewChild({ ...newChild, age: Number(e.target.value) })}
                      className="w-full rounded-lg border border-cream-300 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none"
                    >
                      <option value={0}>Under 1 year</option>
                      {Array.from({ length: 17 }, (_, i) => i + 1).map(a => (
                        <option key={a} value={a}>{a} year{a !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-charcoal-muted">Special needs</label>
                    <input
                      type="text"
                      value={newChild.special_needs ?? ''}
                      onChange={(e) => setNewChild({ ...newChild, special_needs: e.target.value })}
                      placeholder="Optional"
                      className="w-full rounded-lg border border-cream-300 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleAddChild}
                    disabled={!newChild.name.trim()}
                    className="rounded-lg bg-gold-400 px-4 py-1.5 text-xs font-medium text-white hover:bg-gold-500 disabled:opacity-50"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setShowAddChild(false); setNewChild({ name: '', age: 0, special_needs: '' }) }}
                    className="rounded-lg border border-cream-300 px-4 py-1.5 text-xs text-charcoal-muted hover:bg-cream-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {profileLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-cream-200 p-4">
                    <Skeleton width={40} height={40} rounded />
                    <div className="space-y-1">
                      <Skeleton width={80} height={14} />
                      <Skeleton width={60} height={12} />
                    </div>
                  </div>
                ))}
              </div>
            ) : children.length === 0 && !showAddChild ? (
              <p className="text-sm text-charcoal-muted">No children added yet. Click "+ Add child" to get started.</p>
            ) : (
              <div className="space-y-3">
                {children.map((child, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-xl border border-cream-200 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-200">
                      <Baby className="h-5 w-5 text-charcoal-muted" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal">{child.name || `Child ${index + 1}`}</p>
                      <p className="text-xs text-charcoal-muted">
                        {ageLabel(child.age)}
                        {child.special_needs && ` · ${child.special_needs}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveChild(index)}
                      className="rounded-lg p-1.5 text-charcoal-muted hover:bg-cream-100 hover:text-error-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-card">
            <h3 className="mb-3 font-serif text-lg text-charcoal">About Your Family</h3>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell nannies a bit about your family, your routines, and what you're looking for..."
              rows={3}
              className="w-full rounded-xl border border-cream-300 bg-cream-50 p-3 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            {saveMsg === 'success' && (
              <span className="text-sm text-success-700">Profile saved successfully!</span>
            )}
            {saveMsg === 'error' && (
              <span className="text-sm text-error-700">Failed to save. Please try again.</span>
            )}
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="rounded-xl bg-gold-400 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-500 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FamilyProfilePage
