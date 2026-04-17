import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FileDown, Package, ShoppingBag, Truck } from 'lucide-react'
import { useDownloadOrderInvoiceHook, useGetMyOrdersHook } from '@/hooks/payment.hook'

const formatDate = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatAmount = (value) => `Rs. ${Number(value || 0).toFixed(2)}`

const OrderHistory = () => {
  const navigate = useNavigate()
  const { data, isLoading } = useGetMyOrdersHook()
  const { mutateAsync: downloadInvoice, isPending: downloadingInvoice } = useDownloadOrderInvoiceHook()

  const orders = data?.orders || []

  const handleDownloadInvoice = async (orderId) => {
    try {
      const blob = await downloadInvoice(orderId)
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${orderId}.pdf`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
      toast.success('Invoice downloaded')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to download invoice')
    }
  }

  if (isLoading) {
    return <div className='min-h-screen flex items-center justify-center bg-slate-950 text-white'>Loading order history...</div>
  }

  return (
    <div className='min-h-screen bg-slate-950 text-white'>
      <div className='mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8'>
        <div className='mb-6 flex flex-col gap-4 rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <div className='inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200'>
              <ShoppingBag className='h-3.5 w-3.5' />
              Order history
            </div>
            <h1 className='mt-3 text-2xl font-black tracking-[-0.05em] sm:text-3xl'>Your Orders</h1>
            <p className='mt-2 text-sm text-white/60'>Track your placed orders and download invoice PDFs anytime.</p>
          </div>
          <button
            type='button'
            onClick={() => navigate('/product')}
            className='rounded-xl border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white hover:bg-white/15'
          >
            Continue Shopping
          </button>
        </div>

        {orders.length === 0 ? (
          <div className='rounded-[26px] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl'>
            <Package className='mx-auto h-10 w-10 text-cyan-200' />
            <h2 className='mt-4 text-xl font-bold'>No orders yet</h2>
            <p className='mt-2 text-sm text-white/60'>Place your first order to see details and invoices here.</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {orders.map((order) => (
              <div key={order._id} className='rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                  <div>
                    <p className='text-xs uppercase tracking-[0.24em] text-white/45'>Order ID</p>
                    <p className='mt-1 text-sm font-semibold text-cyan-100'>{order._id}</p>
                    <div className='mt-3 flex flex-wrap items-center gap-3 text-xs text-white/60'>
                      <span className='rounded-full border border-white/15 bg-white/5 px-3 py-1'>Placed: {formatDate(order.createdAt)}</span>
                      <span className='rounded-full border border-white/15 bg-white/5 px-3 py-1'>Delivery: {formatDate(order.estimatedDeliveryDate)}</span>
                      <span className='rounded-full border border-white/15 bg-white/5 px-3 py-1'>{order.paymentMethod} / {order.paymentStatus}</span>
                      <span className='rounded-full border border-white/15 bg-white/5 px-3 py-1'>{order.orderStatus}</span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-xs uppercase tracking-[0.24em] text-white/45'>Total</p>
                    <p className='mt-1 text-xl font-black text-emerald-200'>{formatAmount(order.totalAmount)}</p>
                    <button
                      type='button'
                      onClick={() => handleDownloadInvoice(order._id)}
                      disabled={downloadingInvoice}
                      className='mt-3 inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20 disabled:opacity-70'
                    >
                      <FileDown className='h-3.5 w-3.5' />
                      Download Invoice
                    </button>
                  </div>
                </div>

                <div className='mt-4 rounded-2xl border border-white/10 bg-slate-900/45 p-4'>
                  <div className='mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45'>
                    <Truck className='h-3.5 w-3.5' />
                    Items
                  </div>
                  <div className='space-y-2'>
                    {(order.products || []).map((item, idx) => {
                      const productName = item?.product?.name || 'Product'
                      const lineAmount = Number(item.quantity || 0) * Number(item.price || 0)
                      return (
                        <div key={`${order._id}-${idx}`} className='flex items-center justify-between rounded-xl bg-white/5 px-3 py-2'>
                          <div className='min-w-0'>
                            <p className='truncate text-sm font-medium text-white'>{productName}</p>
                            <p className='text-xs text-white/50'>Qty {item.quantity}</p>
                          </div>
                          <p className='text-sm font-semibold text-white/80'>{formatAmount(lineAmount)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderHistory
