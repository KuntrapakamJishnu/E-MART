import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useGetUserCartItemHook } from '@/hooks/user.hook'
import { useClearCartHook, useRemoveCartItemHook, useUpdateQuantity } from '@/hooks/cart.hook'
import { useCreatePaymentHook, useCreateSuccessHook } from '@/hooks/payment.hook'
import { useAiRecommendationsHook } from '@/hooks/ai.hook'
import { useUserStore } from '@/store/userStore'
import { ArrowRight, BadgeCheck, CreditCard, ShieldCheck, Sparkles, Star, Truck, WandSparkles } from 'lucide-react'

const CartPage = () => {
	const navigate = useNavigate()
	const user = useUserStore((state) => state.user)
	const { data, isLoading } = useGetUserCartItemHook()
	const { mutate: removeItem } = useRemoveCartItemHook()
	const { mutate: updateQuantity } = useUpdateQuantity()
	const { mutate: clearCart, isPending: clearing } = useClearCartHook()
	const { mutateAsync: createPayment, isPending: creatingOrder } = useCreatePaymentHook()
	const { mutateAsync: verifyPayment, isPending: verifyingPayment } = useCreateSuccessHook()

	const cartItems = useMemo(() => data?.cartItems || [], [data])

	const recommendationQuery = useMemo(() => {
		if (!cartItems.length) return ''
		const hint = cartItems
			.slice(0, 3)
			.map((item) => `${item?.product?.category || ''} ${item?.product?.name || ''}`.trim())
			.filter(Boolean)
			.join(', ')
		return hint
	}, [cartItems])

	const { data: recommendationData, isFetching: loadingUpsells } = useAiRecommendationsHook(recommendationQuery, 4)

	const cartIds = useMemo(
		() => new Set(cartItems.map((item) => item?.product?._id).filter(Boolean)),
		[cartItems]
	)

	const upsellProducts = useMemo(() => {
		const aiProducts = recommendationData?.products || []
		return aiProducts.filter((item) => item?._id && !cartIds.has(item._id)).slice(0, 3)
	}, [recommendationData, cartIds])

	const totalAmount = cartItems.reduce((sum, item) => {
		const price = item?.product?.price || 0
		const quantity = item?.quantity || 0
		return sum + price * quantity
	}, 0)

	const loadRazorpayScript = () =>
		new Promise((resolve) => {
			if (window.Razorpay) {
				resolve(true)
				return
			}

			const script = document.createElement('script')
			script.src = 'https://checkout.razorpay.com/v1/checkout.js'
			script.async = true
			script.onload = () => resolve(true)
			script.onerror = () => resolve(false)
			document.body.appendChild(script)
		})

	const handleCheckout = async () => {
		if (cartItems.length === 0) {
			toast.error('Your cart is empty')
			return
		}

		const scriptLoaded = await loadRazorpayScript()
		if (!scriptLoaded) {
			toast.error('Razorpay checkout failed to load')
			return
		}

		try {
			const orderData = await createPayment(cartItems)

			const options = {
				key: orderData.key,
				amount: orderData.amount,
				currency: orderData.currency,
				name: 'VIT Campus space',
				description: 'Secure checkout for your VIT Campus space order',
				order_id: orderData.orderId,
				prefill: {
					name: user?.name || '',
					email: user?.email || '',
				},
				theme: {
					color: '#0f172a',
				},
				handler: async (response) => {
					await verifyPayment({
						razorpay_order_id: response.razorpay_order_id,
						razorpay_payment_id: response.razorpay_payment_id,
						razorpay_signature: response.razorpay_signature,
					})
					navigate('/purchase', { replace: true })
				},
				modal: {
					ondismiss: () => {
						toast.info('Checkout dismissed')
					},
				},
			}

			const paymentObject = new window.Razorpay(options)
			paymentObject.on('payment.failed', (response) => {
				toast.error(response?.error?.description || 'Payment failed')
			})
			paymentObject.open()
		} catch (error) {
			toast.error(error?.response?.data?.message || 'Unable to create checkout')
		}
	}

	if (isLoading) {
		return <div className='min-h-screen flex items-center justify-center'>Loading cart...</div>
	}

	return (
		<div className='min-h-screen bg-slate-950 text-white'>
			<div className='relative overflow-hidden border-b border-white/10'>
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.22),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.2),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,0.96))]' />
				<div className='absolute -left-20 top-10 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl animate-float-slow' />
				<div className='absolute right-0 top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl animate-float-medium' />
				<div className='absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl animate-glow-pulse' />
				<div className='relative mx-auto max-w-7xl px-6 py-14 lg:px-10'>
					<div className='flex flex-col gap-5 md:flex-row md:items-end md:justify-between'>
						<div className='space-y-3'>
							<div className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 backdrop-blur-xl'>
								<ShieldCheck className='h-4 w-4 text-emerald-400' />
								Premium payment experience
							</div>
							<h1 className='max-w-3xl text-4xl font-black tracking-[-0.06em] sm:text-5xl lg:text-6xl'>A high-motion checkout built for modern commerce.</h1>
							<p className='max-w-2xl text-sm leading-7 text-white/70 sm:text-base'>
								Review your items, move through a cinematic checkout, and open the secure payment modal when you are ready to complete the order.
							</p>
						</div>
						<div className='grid gap-3 text-sm text-white/75 md:min-w-[360px] md:grid-cols-2'>
							<div className='rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1'>
								<p className='text-xs uppercase tracking-[0.28em] text-white/45'>Items</p>
								<p className='mt-2 text-3xl font-black text-white'>{cartItems.length}</p>
								<p className='mt-2 text-xs text-white/55'>Selected for instant secure payment.</p>
							</div>
							<div className='rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1'>
								<p className='text-xs uppercase tracking-[0.28em] text-white/45'>Total</p>
								<p className='mt-2 text-3xl font-black text-white'>Rs. {totalAmount}</p>
								<p className='mt-2 text-xs text-white/55'>Free shipping and instant confirmation.</p>
							</div>
						</div>
					</div>
					<div className='mt-8 grid gap-3 sm:grid-cols-3'>
						<div className='glass-panel rounded-[24px] p-4 text-sm text-white/80'>
							<div className='flex items-center gap-2 text-white'><Star className='h-4 w-4 text-amber-300' /> Studio-grade UI</div>
							<p className='mt-2 text-white/60'>Glass panels, motion, and layered gradients.</p>
						</div>
						<div className='glass-panel rounded-[24px] p-4 text-sm text-white/80'>
							<div className='flex items-center gap-2 text-white'><WandSparkles className='h-4 w-4 text-cyan-300' /> Fast checkout</div>
							<p className='mt-2 text-white/60'>A frictionless payment flow with live verification.</p>
						</div>
						<div className='glass-panel rounded-[24px] p-4 text-sm text-white/80'>
							<div className='flex items-center gap-2 text-white'><Truck className='h-4 w-4 text-emerald-300' /> Delivery ready</div>
							<p className='mt-2 text-white/60'>Built for a polished e-commerce order handoff.</p>
						</div>
					</div>
				</div>
			</div>

			<div className='mx-auto max-w-7xl px-6 py-10 lg:px-10'>
				{cartItems.length === 0 ? (
					<div className='glass-panel rounded-[32px] p-10 text-center text-slate-950 shadow-[0_20px_80px_rgba(2,6,23,0.18)]'>
						<div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white animate-glow-pulse'>
							<Sparkles className='h-7 w-7' />
						</div>
						<h2 className='mt-5 text-2xl font-black'>Your cart is empty</h2>
						<p className='mt-3 text-slate-600'>Add premium picks from the product page to unlock a fast, animated checkout flow.</p>
					</div>
				) : (
					<div className='space-y-6'>
						{(loadingUpsells || upsellProducts.length > 0) && (
							<div className='glass-panel rounded-[28px] p-5 text-slate-950'>
								<div className='flex items-center justify-between gap-3'>
									<div>
										<p className='text-xs uppercase tracking-[0.28em] text-slate-400'>AI upsell</p>
										<h3 className='mt-1 text-xl font-black'>You may also like</h3>
									</div>
									<button
										type='button'
										onClick={() => navigate('/ai-assistant')}
										className='rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white'
									>
										Open AI Studio
									</button>
								</div>

								{loadingUpsells ? (
									<p className='mt-4 text-sm text-slate-500'>Loading smart picks for your cart...</p>
								) : (
									<div className='mt-4 grid gap-3 md:grid-cols-3'>
										{upsellProducts.map((item) => (
											<div key={item._id} className='rounded-2xl border border-slate-200 bg-white p-3'>
												<div className='flex items-center gap-3'>
													<div className='h-14 w-14 overflow-hidden rounded-xl bg-slate-100'>
														<img src={item.imageUrl} alt={item.name} className='h-full w-full object-cover' loading='lazy' decoding='async' />
													</div>
													<div className='min-w-0 flex-1'>
														<p className='truncate text-sm font-semibold text-slate-900'>{item.name}</p>
														<p className='text-xs text-slate-500'>{item.category} • Rs. {item.price}</p>
													</div>
												</div>
												<button
													type='button'
													onClick={() => navigate(`/product/${item._id}`)}
													className='mt-3 w-full rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white'
												>
													View Product
												</button>
											</div>
										))}
									</div>
								)}
							</div>
						)}

						<div className='grid gap-8 lg:grid-cols-[1.35fr_0.65fr]'>
						<div className='space-y-4'>
							<div className='glass-panel rounded-[28px] p-5 text-slate-950'>
								<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
									<div>
										<p className='text-xs uppercase tracking-[0.28em] text-slate-400'>Cart overview</p>
										<h2 className='mt-1 text-2xl font-black text-slate-950'>Selected items</h2>
									</div>
									<div className='inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white'>
										<BadgeCheck className='h-4 w-4 text-emerald-400' />
										Verified secure flow
									</div>
								</div>
							</div>
							{cartItems.map((item) => (
								<div key={item?.product?._id} className='group glass-panel rounded-[28px] p-5 text-slate-950 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_70px_rgba(15,23,42,0.18)]'>
									<div className='flex flex-col gap-5 md:flex-row md:items-center md:justify-between'>
										<div className='flex items-center gap-4'>
											<div className='flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-[1.03]'>
												<img
													src={item?.product?.imageUrl || 'https://via.placeholder.com/240x240?text=E-Mart'}
													alt={item?.product?.name || 'Product'}
													className='h-full w-full object-cover'
													loading='lazy'
													decoding='async'
												/>
											</div>
											<div>
												<p className='text-xs uppercase tracking-[0.28em] text-slate-400'>Selected item</p>
												<h2 className='mt-1 text-xl font-bold text-slate-950'>{item?.product?.name}</h2>
												<p className='mt-1 max-w-xl text-sm leading-6 text-slate-500 line-clamp-2'>{item?.product?.description}</p>
												<p className='mt-2 text-sm font-semibold text-slate-700'>Rs. {item?.product?.price || 0}</p>
											</div>
										</div>

										<div className='flex flex-wrap items-center gap-3'>
											<div className='flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm'>
												<button
													type='button'
													onClick={() => updateQuantity({ operation: 'decrease', productId: item?.product?._id })}
													className='flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-slate-700 transition-colors hover:bg-slate-100'
												>
													−
												</button>
												<span className='min-w-10 text-center text-sm font-bold text-slate-950'>{item?.quantity || 0}</span>
												<button
													type='button'
													onClick={() => updateQuantity({ operation: 'increase', productId: item?.product?._id })}
													className='flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-slate-700 transition-colors hover:bg-slate-100'
												>
													+
												</button>
											</div>

											<button
												type='button'
												onClick={() => removeItem({ productId: item?.product?._id })}
												className='rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100'
											>
												Remove
											</button>
										</div>
									</div>
								</div>
							))}
						</div>

						<div className='space-y-4'>
							<div className='glass-panel sticky top-28 rounded-[32px] p-6 text-slate-950'>
								<div className='flex items-center gap-3'>
											<div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white animate-glow-pulse'>
										<CreditCard className='h-5 w-5' />
									</div>
									<div>
										<p className='text-xs uppercase tracking-[0.28em] text-slate-400'>Checkout summary</p>
												<h3 className='text-xl font-black'>Ready to pay</h3>
									</div>
								</div>

										<div className='mt-6 space-y-3 rounded-[24px] bg-slate-50 p-4'>
									<div className='flex items-center justify-between text-sm text-slate-500'>
										<span>Subtotal</span>
										<span>Rs. {totalAmount}</span>
									</div>
									<div className='flex items-center justify-between text-sm text-slate-500'>
										<span>Shipping</span>
										<span>Free</span>
									</div>
									<div className='flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-black text-slate-950'>
										<span>Total</span>
										<span>Rs. {totalAmount}</span>
									</div>
								</div>

								<div className='mt-6 space-y-3'>
									<button
										type='button'
										onClick={handleCheckout}
										disabled={creatingOrder || verifyingPayment}
												className='inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[length:200%_200%] bg-gradient-to-r from-slate-950 via-fuchsia-600 to-cyan-500 px-5 text-sm font-semibold text-white transition-transform duration-300 animate-sweep hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70'
									>
												{creatingOrder || verifyingPayment ? 'Processing...' : 'Complete secure checkout'}
										<Sparkles className='h-4 w-4' />
									</button>
									<button
										type='button'
										onClick={() => clearCart()}
										disabled={clearing}
										className='inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60'
									>
										Clear Cart
									</button>
								</div>

										<div className='mt-6 grid gap-3 text-sm text-slate-500'>
											<div className='flex items-center gap-2'><BadgeCheck className='h-4 w-4 text-emerald-500' /> Payment confirmation and order verification</div>
											<div className='flex items-center gap-2'><ShieldCheck className='h-4 w-4 text-cyan-500' /> Secure callback and cart clearing</div>
											<div className='flex items-center gap-2'><ArrowRight className='h-4 w-4 text-fuchsia-500' /> Redirects to a polished success page</div>
								</div>
							</div>
						</div>
						</div>
					</div>
					)}
			</div>
		</div>
	)
}

export default CartPage
