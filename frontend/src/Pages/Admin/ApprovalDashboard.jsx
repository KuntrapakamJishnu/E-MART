import React, { useMemo, useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { CheckCircle2, Clock3, Package, Search, ShieldCheck, Trash2, UserCheck, Users, X } from 'lucide-react'
import {
  useAdminUsersHook,
  useApproveProductHook,
  useApproveSellerHook,
  useDeleteUserByAdminHook,
  useOrderSupportRequestsHook,
  usePendingProductsHook,
  usePendingSellersHook,
  useRecentLoginsHook,
  useUpdateOrderSupportRequestStatusHook
} from '@/hooks/admin.hook'

const StatCard = ({ label, value, icon: Icon, tone }) => {
  return (
    <div className='rounded-[24px] border border-white/15 bg-white/10 p-5 text-white shadow-[0_20px_45px_rgba(15,23,42,0.28)] backdrop-blur-xl'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.24em] text-white/60'>{label}</p>
          <p className='mt-3 text-3xl font-black'>{value}</p>
        </div>
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r ${tone} text-white`}>
          <Icon className='h-5 w-5' />
        </div>
      </div>
    </div>
  )
}

const ApprovalDashboard = () => {
  const user = useUserStore((state) => state.user)
  const role = user?.role || (user?.owner ? 'admin' : 'student')
  const [activeUserTab, setActiveUserTab] = useState('recent')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null)

  const { data: sellersData, isLoading: sellersLoading } = usePendingSellersHook()
  const { data: productsData, isLoading: productsLoading } = usePendingProductsHook()
  const { data: recentLoginsData, isLoading: recentLoginsLoading } = useRecentLoginsHook()
  const { data: supportRequestsData, isLoading: supportRequestsLoading } = useOrderSupportRequestsHook()
  const { data: allUsersData, isLoading: allUsersLoading } = useAdminUsersHook({
    page,
    limit: 10,
    search: searchTerm
  })
  const { mutate: approveSeller, isPending: approvingSeller } = useApproveSellerHook()
  const { mutate: approveProduct, isPending: approvingProduct } = useApproveProductHook()
  const { mutate: deleteUser, isPending: deletingUser } = useDeleteUserByAdminHook()
  const { mutate: updateSupportRequestStatus, isPending: updatingSupportRequest } = useUpdateOrderSupportRequestStatusHook()

  const sellers = sellersData?.sellers || []
  const products = productsData?.products || []
  const recentUsers = recentLoginsData?.users || []
  const supportRequests = supportRequestsData?.requests || []
  const pendingSupportRequests = supportRequests.filter((item) => item.status === 'Requested')
  const allUsers = allUsersData?.users || []
  const totalUsers = allUsersData?.totalUsers || 0
  const totalPages = allUsersData?.totalPages || 1

  const usersToRender = useMemo(() => {
    return activeUserTab === 'recent' ? recentUsers : allUsers
  }, [activeUserTab, recentUsers, allUsers])

  const usersLoading = activeUserTab === 'recent' ? recentLoginsLoading : allUsersLoading

  const handleDeleteUser = () => {
    if (!pendingDeleteUser?._id) return

    deleteUser(pendingDeleteUser._id, {
      onSuccess: () => {
        setPendingDeleteUser(null)
      }
    })
  }

  if (role !== 'admin') {
    return (
      <div className='min-h-screen px-6 py-8'>
        <div className='mx-auto max-w-4xl rounded-[30px] border border-white/15 bg-white/10 p-8 text-white backdrop-blur-2xl'>
          <p className='inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-300'>
            <ShieldCheck className='h-4 w-4' />
            Access Restricted
          </p>
          <h1 className='mt-3 text-3xl font-black tracking-[-0.04em]'>Admin approval access only</h1>
          <p className='mt-3 text-sm text-white/75'>Only admins can approve seller profiles and products.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen'>
      <div className='mx-auto max-w-[1450px] px-6 py-8 lg:px-8'>
        <div className='mb-8 rounded-[30px] border border-white/15 bg-white/10 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.35)] backdrop-blur-2xl'>
          <p className='inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300'>
            <Clock3 className='h-4 w-4' />
            Approval Center
          </p>
          <h1 className='mt-3 text-3xl font-black tracking-[-0.04em] text-white lg:text-4xl'>Seller and Product Approvals</h1>
          <p className='mt-2 text-sm text-white/70'>Review seller onboarding requests and approve products before they go live.</p>
        </div>

        <div className='mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4'>
          <StatCard label='Pending Sellers' value={sellers.length} icon={UserCheck} tone='from-cyan-500 to-blue-500' />
          <StatCard label='Pending Products' value={products.length} icon={Package} tone='from-fuchsia-500 to-rose-500' />
          <StatCard label='Recent Logins' value={recentUsers.length} icon={Users} tone='from-emerald-500 to-teal-500' />
          <StatCard label='Total Pending' value={sellers.length + products.length + pendingSupportRequests.length} icon={Clock3} tone='from-amber-500 to-orange-500' />
        </div>

        <div className='grid gap-6 xl:grid-cols-2'>
          <section className='rounded-[30px] border border-white/15 bg-white/95 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.22)]'>
            <h2 className='text-xl font-black tracking-[-0.03em] text-slate-900'>Pending Seller Profiles</h2>
            <p className='mt-1 text-sm text-slate-500'>Approve sellers before they can log in and manage products.</p>

            <div className='mt-4 space-y-3'>
              {sellersLoading ? (
                <p className='text-sm text-slate-500'>Loading sellers...</p>
              ) : sellers.length === 0 ? (
                <p className='rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600'>No pending seller profiles.</p>
              ) : (
                sellers.map((seller) => (
                  <article key={seller._id} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                    <p className='text-base font-bold text-slate-900'>{seller.name}</p>
                    <p className='mt-1 text-sm text-slate-600'>{seller.email}</p>
                    <p className='mt-1 text-xs text-slate-400'>Requested: {new Date(seller.createdAt).toLocaleString()}</p>
                    <button
                      onClick={() => approveSeller(seller._id)}
                      disabled={approvingSeller}
                      className='mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60'
                    >
                      <CheckCircle2 className='h-4 w-4' />
                      Approve Seller
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className='rounded-[30px] border border-white/15 bg-white/95 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.22)]'>
            <h2 className='text-xl font-black tracking-[-0.03em] text-slate-900'>Pending Product Listings</h2>
            <p className='mt-1 text-sm text-slate-500'>Approve products before sellers can publish them for buyers.</p>

            <div className='mt-4 space-y-3'>
              {productsLoading ? (
                <p className='text-sm text-slate-500'>Loading products...</p>
              ) : products.length === 0 ? (
                <p className='rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600'>No pending products.</p>
              ) : (
                products.map((product) => (
                  <article key={product._id} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                    <div className='flex gap-3'>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className='h-16 w-16 rounded-xl border border-slate-200 object-cover'
                        loading='lazy'
                      />
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-base font-bold text-slate-900'>{product.name}</p>
                        <p className='mt-1 text-sm text-slate-600'>{product.category} • Rs. {product.price}</p>
                        <p className='mt-1 text-xs text-slate-400'>Seller: {product?.owner?.name || 'Unknown'} ({product?.owner?.email || 'N/A'})</p>
                      </div>
                    </div>
                    <button
                      onClick={() => approveProduct(product._id)}
                      disabled={approvingProduct}
                      className='mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60'
                    >
                      <CheckCircle2 className='h-4 w-4' />
                      Approve Product
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

        <section className='mt-6 rounded-[30px] border border-white/15 bg-white/95 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.22)]'>
          <h2 className='text-xl font-black tracking-[-0.03em] text-slate-900'>Return and Exchange Requests</h2>
          <p className='mt-1 text-sm text-slate-500'>Review customer support requests and approve or reject them.</p>

          <div className='mt-4 space-y-3'>
            {supportRequestsLoading ? (
              <p className='text-sm text-slate-500'>Loading support requests...</p>
            ) : supportRequests.length === 0 ? (
              <p className='rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600'>No return/exchange requests found.</p>
            ) : (
              supportRequests.map((requestItem) => (
                <article key={String(requestItem.requestId)} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <p className='text-base font-bold text-slate-900'>
                        {String(requestItem.requestType || '').toUpperCase()} request • {requestItem.user?.name || 'Unknown'}
                      </p>
                      <p className='mt-1 text-sm text-slate-600'>{requestItem.user?.email || 'N/A'}</p>
                      <p className='mt-1 text-xs text-slate-500'>Order: {requestItem.orderId} • Order Status: {requestItem.orderStatus}</p>
                      <p className='mt-1 text-xs text-slate-500'>Requested: {new Date(requestItem.requestedAt || requestItem.createdAt).toLocaleString()}</p>
                      <p className='mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700'>{requestItem.reason}</p>
                    </div>

                    <div className='flex flex-col items-start gap-2 sm:items-end'>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        requestItem.status === 'Requested'
                          ? 'bg-amber-100 text-amber-700'
                          : requestItem.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : requestItem.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-200 text-slate-700'
                      }`}
                      >
                        {requestItem.status}
                      </span>

                      {requestItem.status === 'Requested' ? (
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => updateSupportRequestStatus({ orderId: requestItem.orderId, requestId: requestItem.requestId, status: 'Approved' })}
                            disabled={updatingSupportRequest}
                            className='inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60'
                          >
                            <CheckCircle2 className='h-4 w-4' />
                            Approve
                          </button>
                          <button
                            onClick={() => updateSupportRequestStatus({ orderId: requestItem.orderId, requestId: requestItem.requestId, status: 'Rejected' })}
                            disabled={updatingSupportRequest}
                            className='inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60'
                          >
                            <X className='h-4 w-4' />
                            Reject
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className='mt-6 rounded-[30px] border border-white/15 bg-white/95 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.22)]'>
          <h2 className='text-xl font-black tracking-[-0.03em] text-slate-900'>Newly Logged-In Users</h2>
          <p className='mt-1 text-sm text-slate-500'>Track recently logged-in users or browse all users with search and pagination.</p>

          <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='inline-flex rounded-xl border border-slate-200 bg-white p-1'>
              <button
                onClick={() => setActiveUserTab('recent')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeUserTab === 'recent' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Recent Logins
              </button>
              <button
                onClick={() => setActiveUserTab('all')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeUserTab === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                All Users
              </button>
            </div>

            {activeUserTab === 'all' && (
              <div className='relative w-full sm:w-[320px]'>
                <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                <input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                  placeholder='Search by name or email'
                  className='h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200'
                />
              </div>
            )}
          </div>

          <div className='mt-4 space-y-3'>
            {usersLoading ? (
              <p className='text-sm text-slate-500'>Loading users...</p>
            ) : usersToRender.length === 0 ? (
              <p className='rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600'>
                {activeUserTab === 'recent' ? 'No recent logins found.' : 'No users found for this search.'}
              </p>
            ) : (
              usersToRender.map((account) => (
                <article key={account._id} className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                      <p className='text-base font-bold text-slate-900'>{account.name}</p>
                      <p className='mt-1 text-sm text-slate-600'>{account.email}</p>
                      <p className='mt-1 text-xs text-slate-500'>Role: {account.role} • Approved: {account.isApproved ? 'Yes' : 'No'}</p>
                      <p className='mt-1 text-xs text-slate-400'>Last Login: {account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleString() : 'Never'}</p>
                    </div>
                    <button
                      onClick={() => setPendingDeleteUser(account)}
                      disabled={deletingUser}
                      className='inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60'
                    >
                      <Trash2 className='h-4 w-4' />
                      Remove User
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          {activeUserTab === 'all' && totalPages > 1 && (
            <div className='mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-sm text-slate-600'>
                Page {page} of {totalPages} • {totalUsers} users
              </p>
              <div className='inline-flex items-center gap-2'>
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className='rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50'
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className='rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50'
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {pendingDeleteUser && (
        <div className='fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 px-4'>
          <div className='w-full max-w-md rounded-3xl border border-white/15 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.35)]'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.26em] text-rose-500'>Confirm Removal</p>
                <h3 className='mt-2 text-xl font-black tracking-[-0.03em] text-slate-900'>Remove this user?</h3>
                <p className='mt-2 text-sm text-slate-600'>
                  This will permanently delete <span className='font-semibold text-slate-900'>{pendingDeleteUser.name}</span> ({pendingDeleteUser.email}).
                </p>
              </div>
              <button
                onClick={() => setPendingDeleteUser(null)}
                className='rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-100'
                aria-label='Close'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            <div className='mt-6 flex items-center justify-end gap-3'>
              <button
                onClick={() => setPendingDeleteUser(null)}
                disabled={deletingUser}
                className='rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deletingUser}
                className='inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60'
              >
                <Trash2 className='h-4 w-4' />
                {deletingUser ? 'Removing...' : 'Yes, Remove User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApprovalDashboard
