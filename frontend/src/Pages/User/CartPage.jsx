import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useGetUserCartItemHook } from '@/hooks/user.hook'
import { useCreatePaymentHook, useCreateSuccessHook, usePlaceCodOrderHook } from '@/hooks/payment.hook'
import { useUserStore } from '@/store/userStore'
import { CheckCircle2, ChevronRight, CreditCard, MapPin, Package, ShieldCheck, Sparkles } from 'lucide-react'

const CartPage = () => {
	const navigate = useNavigate()
	const user = useUserStore((state) => state.user)
	const { data, isLoading } = useGetUserCartItemHook()
	const { mutateAsync: createPayment, isPending: creatingOrder } = useCreatePaymentHook()
	const { mutateAsync: verifyPayment, isPending: verifyingPayment } = useCreateSuccessHook()
	const { mutateAsync: placeCodOrder, isPending: placingCodOrder } = usePlaceCodOrderHook()
	const [paymentMethod, setPaymentMethod] = useState('cod')
	const [deliveryInfo, setDeliveryInfo] = useState({
		firstName: user?.name?.split(' ')?.[0] || '',
		lastName: user?.name?.split(' ')?.slice(1).join(' ') || '',
		email: user?.email || '',
		street: '',
		city: '',
		state: '',
		pincode: '',
		country: 'India',
		phone: '',
	})

	const cartItems = useMemo(() => data?.cartItems || [], [data])
	const validCartItems = useMemo(
		() =>
			cartItems.filter(
				(item) =>
					Boolean(item?.product?._id) &&
					Number(item?.product?.price || 0) > 0 &&
					Number(item?.quantity || 0) > 0
			),
		[cartItems]
	)

	const totalAmount = useMemo(
		() =>
			validCartItems.reduce((sum, item) => {
				const price = item?.product?.price || 0
				const quantity = item?.quantity || 0
				return sum + price * quantity
			}, 0),
		[validCartItems]
	)

	const sanitizeDeliveryInfo = (input) => {
		const trim = (value) => String(value || '').trim()
		return {
			firstName: trim(input.firstName),
			lastName: trim(input.lastName),
			email: trim(input.email).toLowerCase(),
			street: trim(input.street),
			city: trim(input.city),
			state: trim(input.state),
			pincode: trim(input.pincode),
			country: trim(input.country),
			phone: trim(input.phone),
		}
	}

	const validateDeliveryInfo = (input) => {
		const requiredFields = ['firstName', 'email', 'street', 'city', 'state', 'pincode', 'country', 'phone']
		const missingField = requiredFields.find((field) => !input[field])
		if (missingField) {
			return `Please fill ${missingField}`
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(input.email)) {
			return 'Please enter a valid email address'
		}

		const nameRegex = /^[A-Za-z][A-Za-z\s.'-]{1,48}$/
		if (!nameRegex.test(input.firstName)) {
			return 'First name should be 2-49 characters with letters only'
		}

		if (input.lastName && !nameRegex.test(input.lastName)) {
			return 'Last name should be 2-49 characters with letters only'
		}

		if (input.street.length < 6 || input.street.length > 120) {
			return 'Street address must be between 6 and 120 characters'
		}

		const locationRegex = /^[A-Za-z][A-Za-z\s.-]{1,58}$/
		if (!locationRegex.test(input.city)) {
			return 'City should be 2-59 characters with letters only'
		}

		if (!locationRegex.test(input.state)) {
			return 'State should be 2-59 characters with letters only'
		}

		if (!locationRegex.test(input.country)) {
			return 'Country should be 2-59 characters with letters only'
		}

		if (!/^\d{6}$/.test(input.pincode)) {
			return 'Pincode must be exactly 6 digits'
		}

		if (!/^\d{10}$/.test(input.phone)) {
			return 'Phone number must be exactly 10 digits'
		}

		return null
	}

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
		if (validCartItems.length === 0) {
			toast.error('Your cart is empty')
			return
		}

		const normalizedDelivery = sanitizeDeliveryInfo(deliveryInfo)
		const deliveryError = validateDeliveryInfo(normalizedDelivery)
		if (deliveryError) {
			toast.error(deliveryError)
			return
		}

		const scriptLoaded = await loadRazorpayScript()
		if (!scriptLoaded) {
			toast.error('Razorpay checkout failed to load')
			return
		}

		try {
			const orderData = await createPayment({
				products: validCartItems,
				deliveryInfo: normalizedDelivery,
			})

			const options = {
				key: orderData.key,
				amount: orderData.amount,
				currency: orderData.currency,
				name: 'CampusKartAI',
				description: 'Secure checkout',
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
						deliveryInfo: normalizedDelivery,
					})
					toast.success('Payment successful and order placed')
					navigate('/purchase', { replace: true })
				},
			}

			const paymentObject = new window.Razorpay(options)
			paymentObject.on('payment.failed', (response) => {
				toast.error(response?.error?.description || 'Payment failed')
			})
			paymentObject.open()
		} catch (error) {
			toast.error(error?.response?.data?.message || error?.message || 'Unable to create checkout')
		}
	}

	const handleDeliveryInput = (event) => {
		const { name, value } = event.target
		if (name === 'pincode' || name === 'phone') {
			const numericValue = value.replace(/\D/g, '')
			const maxLength = name === 'pincode' ? 6 : 10
			setDeliveryInfo((prev) => ({ ...prev, [name]: numericValue.slice(0, maxLength) }))
			return
		}

		setDeliveryInfo((prev) => ({ ...prev, [name]: value }))
	}

	const handlePlaceOrder = async () => {
		if (cartItems.length > 0 && validCartItems.length === 0) {
			toast.error('Cart has unavailable products. Please refresh cart and try again.')
			return
		}

		const normalizedDelivery = sanitizeDeliveryInfo(deliveryInfo)
		const deliveryError = validateDeliveryInfo(normalizedDelivery)

		if (deliveryError) {
			toast.error(deliveryError)
			return
		}

		try {
			if (paymentMethod === 'cod') {
				await placeCodOrder({
					products: validCartItems,
					deliveryInfo: normalizedDelivery,
				})
				window.alert('Order placed successfully with COD. A confirmation email with invoice PDF has been sent.')
				navigate('/purchase', { replace: true })
				return
			}

			await handleCheckout()
		} catch (error) {
			toast.error(error?.response?.data?.message || error?.message || 'Unable to place order')
		}
	}

	const deliveryCompletion = useMemo(() => {
		const requiredFields = ['firstName', 'email', 'street', 'city', 'state', 'pincode', 'country', 'phone']
		const filled = requiredFields.filter((field) => Boolean(deliveryInfo[field]?.trim())).length
		return Math.round((filled / requiredFields.length) * 100)
	}, [deliveryInfo])

	if (isLoading) {
		return <div className='min-h-screen flex items-center justify-center text-white bg-slate-950'>Loading cart...</div>
	}

	if (validCartItems.length === 0) {
		return (
			<div className='min-h-screen bg-slate-950 text-white flex items-center justify-center px-4'>
				<div className='rounded-2xl border border-white/15 bg-white/5 p-8 text-center backdrop-blur-xl'>
					<h2 className='text-2xl font-bold'>No valid items in cart</h2>
					<p className='mt-2 text-sm text-white/60'>Some items may be unavailable. Add products again to continue checkout.</p>
					<button
						type='button'
						onClick={() => navigate('/product')}
						className='mt-5 rounded-xl border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white hover:bg-white/15'
					>
						Browse Products
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-slate-950 text-white'>
			<div className='mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8'>
				<div className='mb-6 flex flex-col gap-4 rounded-[26px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between'>
					<div>
						<div className='inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200'>
							<Sparkles className='h-3.5 w-3.5' />
							Simple checkout
						</div>
						<h1 className='mt-3 text-2xl font-black tracking-[-0.05em] sm:text-3xl'>Cart Checkout</h1>
						<p className='mt-2 text-sm text-white/60'>Fill the form, choose payment, and place your order in a clean, focused flow.</p>
					</div>
					<div className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3'>
						<div className='flex items-center justify-between gap-4 text-sm'>
							<span className='text-white/60'>Items</span>
							<span className='font-semibold'>{validCartItems.length}</span>
						</div>
						<div className='mt-2 flex items-center justify-between gap-4 text-sm'>
							<span className='text-white/60'>Total</span>
							<span key={totalAmount} className='animate-[pulse_0.45s_ease-in-out_1] font-semibold text-cyan-100'>
								Rs. {totalAmount}
							</span>
						</div>
					</div>
				</div>

				<div className='grid gap-6 lg:grid-cols-[1.08fr_0.92fr]'>
					<div className='rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_24px_90px_rgba(2,6,23,0.28)]'>
						<div className='flex items-center gap-3'>
							<div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-200'>
								<MapPin className='h-5 w-5' />
							</div>
							<div>
								<h2 className='text-2xl font-black tracking-tight'>Delivery Information</h2>
								<p className='text-sm text-white/55'>Just the essentials.</p>
							</div>
						</div>

						<div className='mt-5'>
							<div className='mb-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/45'>
								<span>Progress</span>
								<span>{deliveryCompletion}%</span>
							</div>
							<div className='h-2 overflow-hidden rounded-full bg-slate-800'>
								<div className='h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 transition-all duration-500' style={{ width: `${deliveryCompletion}%` }} />
							</div>
						</div>

						<div className='mt-5 grid gap-3 sm:grid-cols-2'>
							<input name='firstName' value={deliveryInfo.firstName} onChange={handleDeliveryInput} placeholder='First name' className='h-11 rounded-xl border border-white/10 bg-slate-900/75 px-3 text-sm text-white placeholder:text-white/45 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20' />
							<input name='lastName' value={deliveryInfo.lastName} onChange={handleDeliveryInput} placeholder='Last name' className='h-11 rounded-xl border border-white/10 bg-slate-900/75 px-3 text-sm text-white placeholder:text-white/45 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20' />
						</div>
						<input name='email' value={deliveryInfo.email} onChange={handleDeliveryInput} placeholder='Email address' className='mt-3 h-11 w-full rounded-xl border border-white/10 bg-slate-900/75 px-3 text-sm text-white placeholder:text-white/45 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20' />
						<input name='street' value={deliveryInfo.street} onChange={handleDeliveryInput} placeholder='Street address' className='mt-3 h-11 w-full rounded-xl border border-white/10 bg-slate-900/75 px-3 text-sm text-white placeholder:text-white/45 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20' />
						<div className='mt-3 grid gap-3 sm:grid-cols-2'>
							<input name='city' value={deliveryInfo.city} onChange={handleDeliveryInput} placeholder='City' className='h-11 rounded-xl border border-white/10 bg-slate-900/75 px-3 text-sm text-white placeholder:text-white/45 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20' />
							<input name='state' value={deliveryInfo.state} onChange={handleDeliveryInput} placeholder='State' className='h-11 rounded-xl border border-white/10 bg-slate-900/75 px-3 text-sm text-white placeholder:text-white/45 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20' />
						</div>
						<div className='mt-3 grid gap-3 sm:grid-cols-2'>
							<input name='pincode' inputMode='numeric' pattern='[0-9]{6}' maxLength={6} value={deliveryInfo.pincode} onChange={handleDeliveryInput} placeholder='Pincode' className='h-11 rounded-xl border border-white/10 bg-slate-900/75 px-3 text-sm text-white placeholder:text-white/45 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20' />
							<input name='country' value={deliveryInfo.country} onChange={handleDeliveryInput} placeholder='Country' className='h-11 rounded-xl border border-white/10 bg-slate-900/75 px-3 text-sm text-white placeholder:text-white/45 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20' />
						</div>
						<input name='phone' inputMode='numeric' pattern='[0-9]{10}' maxLength={10} value={deliveryInfo.phone} onChange={handleDeliveryInput} placeholder='Phone number' className='mt-3 h-11 w-full rounded-xl border border-white/10 bg-slate-900/75 px-3 text-sm text-white placeholder:text-white/45 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20' />
					</div>

					<div className='rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_24px_90px_rgba(2,6,23,0.28)] lg:sticky lg:top-28'>
						<div className='flex items-center gap-3'>
							<div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-200'>
								<CreditCard className='h-5 w-5' />
							</div>
							<div>
								<h2 className='text-2xl font-black tracking-tight'>Cart Totals</h2>
								<p className='text-sm text-white/55'>Simple and clear.</p>
							</div>
						</div>

						<div className='mt-5 rounded-2xl border border-white/10 bg-slate-900/60 p-4'>
							<div className='space-y-3'>
								<div className='flex items-center justify-between text-sm text-white/70'>
									<span>Subtotal</span>
									<span>Rs. {totalAmount}</span>
								</div>
								<div className='flex items-center justify-between text-sm text-white/70'>
									<span>Delivery Fee</span>
									<span>Rs. 0</span>
								</div>
								<div className='flex items-center justify-between border-t border-white/10 pt-3 text-lg font-black'>
									<span>Total</span>
									<span>Rs. {totalAmount}</span>
								</div>
							</div>
						</div>

						<div className='mt-5 rounded-2xl border border-white/10 bg-slate-900/50 p-4'>
							<div className='flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/45'>
								<Package className='h-3.5 w-3.5' />
								Items in cart
							</div>
							<div className='mt-3 space-y-3'>
								{validCartItems.slice(0, 3).map((item) => (
									<div key={item?.product?._id} className='flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2'>
										<div className='min-w-0'>
											<p className='truncate text-sm font-medium text-white'>{item?.product?.name}</p>
											<p className='text-xs text-white/50'>Qty {item?.quantity || 0}</p>
										</div>
										<p className='text-sm font-semibold text-white/80'>Rs. {(item?.product?.price || 0) * (item?.quantity || 0)}</p>
									</div>
								))}
							</div>
						</div>

						<h3 className='mt-5 text-xl font-bold tracking-tight'>Payment Method</h3>
						<div className='mt-3 space-y-3'>
							<button
								type='button'
								onClick={() => setPaymentMethod('cod')}
								className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-base font-medium transition-all duration-300 ${paymentMethod === 'cod' ? 'border-orange-300 bg-orange-500/10 text-orange-200 shadow-[0_10px_25px_rgba(249,115,22,0.12)]' : 'border-white/10 bg-white/5 text-white/80 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10'}`}
							>
								<span>COD (Cash on delivery)</span>
								<span className={`h-3 w-3 rounded-full ${paymentMethod === 'cod' ? 'bg-orange-300' : 'bg-white/35'}`} />
							</button>

							<button
								type='button'
								onClick={() => setPaymentMethod('razorpay')}
								className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-base font-medium transition-all duration-300 ${paymentMethod === 'razorpay' ? 'border-cyan-300 bg-cyan-500/10 text-cyan-200 shadow-[0_10px_25px_rgba(34,211,238,0.12)]' : 'border-white/10 bg-white/5 text-white/80 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10'}`}
							>
								<span>Razorpay (UPI / Card)</span>
								<span className={`h-3 w-3 rounded-full ${paymentMethod === 'razorpay' ? 'bg-cyan-300' : 'bg-white/35'}`} />
							</button>
						</div>

						<button
							type='button'
							onClick={handlePlaceOrder}
							disabled={creatingOrder || verifyingPayment || placingCodOrder}
							className='mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(249,115,22,0.22)] transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70'
						>
							{creatingOrder || verifyingPayment || placingCodOrder ? 'Processing...' : 'Place Order'}
							<ChevronRight className='h-4 w-4' />
						</button>

						<div className='mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/45'>
							<ShieldCheck className='h-3.5 w-3.5 text-cyan-300' />
							Secure and simple checkout
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default CartPage
