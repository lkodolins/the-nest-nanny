import { useState } from 'react'
import { Search, MoreHorizontal, Shield } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAdminUsers } from '@/queries/useAdmin'
import { Spinner } from '@/components/ui/Spinner'

const statusStyles: Record<string, string> = {
  active: 'bg-success-50 text-success-700',
  suspended: 'bg-error-50 text-error-700',
  pending: 'bg-warning-50 text-warning-700',
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
}

export function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const filters = {
    ...(search ? { search } : {}),
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    page,
  }

  const { data, isLoading, isError } = useAdminUsers(filters)

  const users = data?.results ?? []
  const total = data?.count ?? 0
  const totalPages = total > 0 ? Math.ceil(total / (users.length || 1)) : 1

  return (
    <div>
      <p className="section-label mb-2">ADMIN</p>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-heading-lg text-charcoal">Users</h1>
          <p className="mt-1 text-charcoal-muted">Manage platform users</p>
        </div>
        <button className="rounded-xl bg-gold-400 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-500">
          + Add User
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-xl border border-cream-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-gold-400 focus:outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-gold-400 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="family">Families</option>
          <option value="nanny">Nannies</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-gold-400 focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-2xl border border-cream-300 bg-white p-12 text-center shadow-card">
          <p className="font-serif text-lg text-charcoal">Unable to load users</p>
          <p className="mt-2 text-sm text-charcoal-muted">
            The admin users endpoint may not be available yet. Please try again later.
          </p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && users.length === 0 && (
        <div className="rounded-2xl border border-cream-300 bg-white p-12 text-center shadow-card">
          <p className="font-serif text-lg text-charcoal">No users found</p>
          <p className="mt-2 text-sm text-charcoal-muted">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && users.length > 0 && (
        <>
          <div className="rounded-2xl border border-cream-300 bg-white shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50">
                  <th className="px-5 py-3 text-left font-medium text-charcoal-muted">User</th>
                  <th className="px-5 py-3 text-left font-medium text-charcoal-muted">Role</th>
                  <th className="px-5 py-3 text-left font-medium text-charcoal-muted">Status</th>
                  <th className="px-5 py-3 text-left font-medium text-charcoal-muted">Joined</th>
                  <th className="px-5 py-3 text-right font-medium text-charcoal-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {users.map((u) => {
                  const initials = getInitials(u.first_name, u.last_name)
                  const status = u.is_active ? 'active' : 'suspended'
                  const joined = new Date(u.date_joined).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })
                  return (
                    <tr key={u.id} className="hover:bg-cream-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400/10 font-serif text-xs text-gold-600">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-charcoal">
                                {u.first_name} {u.last_name}
                              </p>
                              {u.is_verified && (
                                <Shield className="h-3.5 w-3.5 text-success-500" />
                              )}
                            </div>
                            <p className="text-xs text-charcoal-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="pill-badge pill-cream capitalize text-xs">{u.role}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn('pill-badge text-xs font-medium capitalize', statusStyles[status])}>
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-charcoal-muted">{joined}</td>
                      <td className="px-5 py-3 text-right">
                        <button className="rounded-lg p-1.5 text-charcoal-muted hover:bg-cream-200 hover:text-charcoal">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-charcoal-muted">
              Showing {(page - 1) * (users.length || 10) + 1}-{Math.min(page * (users.length || 10), total)} of {total.toLocaleString()} users
            </p>
            <div className="flex gap-1">
              {page > 1 && (
                <button
                  onClick={() => setPage(page - 1)}
                  className="h-8 min-w-[2rem] rounded-lg px-2 text-sm text-charcoal-muted hover:bg-cream-200"
                >
                  Prev
                </button>
              )}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'h-8 min-w-[2rem] rounded-lg px-2 text-sm',
                    p === page
                      ? 'bg-gold-400 font-medium text-white'
                      : 'text-charcoal-muted hover:bg-cream-200'
                  )}
                >
                  {p}
                </button>
              ))}
              {totalPages > 5 && (
                <>
                  <span className="h-8 min-w-[2rem] rounded-lg px-2 text-sm text-charcoal-muted flex items-center justify-center">...</span>
                  <button
                    onClick={() => setPage(totalPages)}
                    className={cn(
                      'h-8 min-w-[2rem] rounded-lg px-2 text-sm',
                      page === totalPages
                        ? 'bg-gold-400 font-medium text-white'
                        : 'text-charcoal-muted hover:bg-cream-200'
                    )}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              {page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="h-8 min-w-[2rem] rounded-lg px-2 text-sm text-charcoal-muted hover:bg-cream-200"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminUsersPage
