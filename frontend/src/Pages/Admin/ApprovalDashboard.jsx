import React from 'react'
import { useUserStore } from '@/store/userStore'
import { CheckCircle2, Clock3, Package, ShieldCheck, UserCheck } from 'lucide-react'
import { useApproveProductHook, useApproveSellerHook, usePendingProductsHook, usePendingSellersHook } from '@/hooks/admin.hook'

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

  const { data: sellersData, isLoading: sellersLoading } = usePendingSellersHook()
  const { data: productsData, isLoading: productsLoading } = usePendingProductsHook()
  const { mutate: approveSeller, isPending: approvingSeller } = useApproveSellerHook()
  const { mutate: approveProduct, isPending: approvingProduct } = useApproveProductHook()

  const sellers = sellersData?.sellers || []
  const products = productsData?.products || []

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

        <div className='mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'>
          <StatCard label='Pending Sellers' value={sellers.length} icon={UserCheck} tone='from-cyan-500 to-blue-500' />
          <StatCard label='Pending Products' value={products.length} icon={Package} tone='from-fuchsia-500 to-rose-500' />
          <StatCard label='Total Pending' value={sellers.length + products.length} icon={Clock3} tone='from-amber-500 to-orange-500' />
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
      </div>
    </div>
  )
}

export default ApprovalDashboard
