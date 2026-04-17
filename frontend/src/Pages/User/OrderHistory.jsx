import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CheckCircle2, FileDown, MapPin, Package, RefreshCw, ShoppingBag, Truck, Undo2 } from 'lucide-react'
import { useCreateOrderSupportRequestHook, useDownloadOrderInvoiceHook, useGetMyOrdersHook } from '@/hooks/payment.hook'

const formatDate = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatAmount = (value) => `Rs. ${Number(value || 0).toFixed(2)}`

const statusSteps = ['Placed', 'Processing', 'Shipped', 'Out for delivery', 'Delivered']

const getTrackingSteps = (orderStatus) => {
  const currentIndex = statusSteps.indexOf(orderStatus)
  return statusSteps.map((step, index) => ({
    step,
    done: currentIndex >= index,
    current: currentIndex === index
  }))
}

const OrderHistory = () => {
  const navigate = useNavigate()
  const [trackingOrderId, setTrackingOrderId] = useState('')
  const { data, isLoading } = useGetMyOrdersHook()
  const { mutateAsync: downloadInvoice, isPending: downloadingInvoice } = useDownloadOrderInvoiceHook()
  const { mutateAsync: submitSupportRequest, isPending: supportRequestPending } = useCreateOrderSupportRequestHook()

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

  const toggleTrackOrder = (orderId) => {
    setTrackingOrderId((prev) => (prev === orderId ? '' : orderId))
  }

  const hasRequestedSupportType = (order, requestType) => {
    return (order?.supportRequests || []).some(
      (item) =>
        String(item?.requestType || '').toLowerCase() === String(requestType).toLowerCase() &&
        item?.status === 'Requested'
    )
  }

  const requestReturn = async (order) => {
    if (order.orderStatus !== 'Delivered') {
      toast.error('Return is available only after delivery')
      return
    }

    if (hasRequestedSupportType(order, 'return')) {
      toast.error('Return request is already pending for this order')
      return
    }

    const reason = window.prompt('Enter return reason (min 8 characters):', 'Product size/quality issue')
    if (!reason || reason.trim().length < 8) {
      toast.error('Please provide a valid reason with at least 8 characters')
      return
    }

    await submitSupportRequest({
      orderId: order._id,
      requestType: 'return',
      reason: reason.trim()
    })
  }

  const requestExchange = async (order) => {
    if (order.orderStatus !== 'Delivered') {
      toast.error('Exchange is available only after delivery')
      return
    }

    if (hasRequestedSupportType(order, 'exchange')) {
      toast.error('Exchange request is already pending for this order')
      return
    }

    const reason = window.prompt('Enter exchange reason (min 8 characters):', 'Need different size/color')
    if (!reason || reason.trim().length < 8) {
      toast.error('Please provide a valid reason with at least 8 characters')
      return
    }

    await submitSupportRequest({
      orderId: order._id,
      requestType: 'exchange',
      reason: reason.trim()
    })
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
                    <div className='mt-3 flex flex-wrap justify-end gap-2'>
                      <button
                        type='button'
                        onClick={() => handleDownloadInvoice(order._id)}
                        disabled={downloadingInvoice}
                        className='inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20 disabled:opacity-70'
                      >
                        <FileDown className='h-3.5 w-3.5' />
                        Download Invoice
                      </button>
                      <button
                        type='button'
                        onClick={() => toggleTrackOrder(order._id)}
                        className='inline-flex items-center gap-2 rounded-xl border border-emerald-300/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/20'
                      >
                        <MapPin className='h-3.5 w-3.5' />
                        {trackingOrderId === order._id ? 'Hide Tracking' : 'Track Order'}
                      </button>
                      <button
                        type='button'
                        onClick={() => requestReturn(order)}
                        disabled={supportRequestPending || hasRequestedSupportType(order, 'return')}
                        className='inline-flex items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-500/20'
                      >
                        <Undo2 className='h-3.5 w-3.5' />
                        {hasRequestedSupportType(order, 'return') ? 'Return Requested' : 'Return'}
                      </button>
                      <button
                        type='button'
                        onClick={() => requestExchange(order)}
                        disabled={supportRequestPending || hasRequestedSupportType(order, 'exchange')}
                        className='inline-flex items-center gap-2 rounded-xl border border-fuchsia-300/40 bg-fuchsia-500/10 px-3 py-2 text-xs font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/20'
                      >
                        <RefreshCw className='h-3.5 w-3.5' />
                        {hasRequestedSupportType(order, 'exchange') ? 'Exchange Requested' : 'Exchange'}
                      </button>
                    </div>
                  </div>
                </div>

                {(order.supportRequests || []).length > 0 ? (
                  <div className='mt-4 rounded-2xl border border-white/10 bg-slate-900/45 p-4'>
                    <p className='mb-2 text-xs uppercase tracking-[0.2em] text-white/50'>Support Requests</p>
                    <div className='flex flex-wrap gap-2'>
                      {order.supportRequests.map((supportItem, index) => (
                        <span
                          key={`${order._id}-support-${index}`}
                          className='rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80'
                        >
                          {String(supportItem.requestType || '').toUpperCase()} • {supportItem.status}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {trackingOrderId === order._id ? (
                  <div className='mt-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4'>
                    <p className='mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/55'>Tracking Progress</p>
                    <div className='space-y-2'>
                      {getTrackingSteps(order.orderStatus).map((stepInfo) => (
                        <div key={`${order._id}-${stepInfo.step}`} className='flex items-center gap-2'>
                          <CheckCircle2 className={`h-4 w-4 ${stepInfo.done ? 'text-emerald-300' : 'text-slate-500'}`} />
                          <span className={`text-sm ${stepInfo.current ? 'font-semibold text-white' : 'text-white/70'}`}>
                            {stepInfo.step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

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
