import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { ENV } from '../config/env.js'
import { razorpay } from '../config/razorpay.js'
import Order from '../model/order.model.js'
import User from '../model/user.model.js'
import Product from '../model/product.model.js'
import { sendOrderConfirmationEmail } from '../config/smtp.js'

const DELIVERY_DAYS = 5

const buildEstimatedDeliveryDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + DELIVERY_DAYS)
    return date
}

const toCurrency = (amount = 0) => `Rs. ${Number(amount || 0).toFixed(2)}`

const formatDateLabel = (value) => {
    if (!value) {
        return 'N/A'
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return 'N/A'
    }

    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

const formatAddressLines = (deliveryAddress = {}) => {
    const fullName = `${deliveryAddress.firstName || ''} ${deliveryAddress.lastName || ''}`.trim()
    return [
        fullName,
        deliveryAddress.street,
        [deliveryAddress.city, deliveryAddress.state, deliveryAddress.pincode].filter(Boolean).join(', '),
        deliveryAddress.country,
        deliveryAddress.phone,
        deliveryAddress.email
    ].filter(Boolean)
}

const buildProductsQrPayload = ({ orderId, products = [] }) => {
    const productSummary = products
        .map((item) => `${item?.name || 'Product'} x${Number(item?.quantity || 0)}`)
        .join(' | ')

    const payload = `CampusKart|Order:${orderId}|Products:${productSummary}`
    return payload.length > 800 ? payload.slice(0, 800) : payload
}

const generateProductsQrBuffer = async ({ orderId, products }) => {
    try {
        const payload = buildProductsQrPayload({ orderId, products })
        const dataUrl = await QRCode.toDataURL(payload, {
            errorCorrectionLevel: 'M',
            width: 180,
            margin: 1,
            color: {
                dark: '#0f172a',
                light: '#ffffff'
            }
        })

        const base64Content = dataUrl.split(',')[1]
        return base64Content ? Buffer.from(base64Content, 'base64') : null
    } catch {
        return null
    }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const logoPathCandidates = [
    path.resolve(__dirname, '../../../frontend/src/assets/CompanyLogo.png'),
    path.resolve(process.cwd(), 'frontend/src/assets/CompanyLogo.png')
]

const loadLogoImage = () => {
    for (const candidatePath of logoPathCandidates) {
        try {
            if (fs.existsSync(candidatePath)) {
                return fs.readFileSync(candidatePath)
            }
        } catch {
            continue
        }
    }

    return null
}

const logoBuffer = loadLogoImage()

const isMongoObjectId = (value = '') => /^[a-fA-F0-9]{24}$/.test(String(value))

const getGatewayErrorMessage = (error, fallback) => {
    const message =
        error?.error?.description ||
        error?.error?.reason ||
        error?.response?.data?.error?.description ||
        error?.response?.data?.message ||
        error?.message

    return message || fallback
}

const normalizeDeliveryInfo = (deliveryInfo = {}) => ({
    firstName: String(deliveryInfo.firstName || '').trim(),
    lastName: String(deliveryInfo.lastName || '').trim(),
    email: String(deliveryInfo.email || '').trim().toLowerCase(),
    street: String(deliveryInfo.street || '').trim(),
    city: String(deliveryInfo.city || '').trim(),
    state: String(deliveryInfo.state || '').trim(),
    pincode: String(deliveryInfo.pincode || '').trim(),
    country: String(deliveryInfo.country || '').trim(),
    phone: String(deliveryInfo.phone || '').trim()
})

const validateDeliveryInfo = (deliveryInfo) => {
    const requiredFields = ['firstName', 'email', 'street', 'city', 'state', 'pincode', 'country', 'phone']
    const missingField = requiredFields.find((field) => !deliveryInfo[field])
    if (missingField) {
        return `Delivery field '${missingField}' is required`
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(deliveryInfo.email)) {
        return 'Please provide a valid email address'
    }

    const nameRegex = /^[A-Za-z][A-Za-z\s.'-]{1,48}$/
    if (!nameRegex.test(deliveryInfo.firstName)) {
        return 'First name should be 2-49 characters with letters only'
    }

    if (deliveryInfo.lastName && !nameRegex.test(deliveryInfo.lastName)) {
        return 'Last name should be 2-49 characters with letters only'
    }

    if (deliveryInfo.street.length < 6 || deliveryInfo.street.length > 120) {
        return 'Street address must be between 6 and 120 characters'
    }

    const locationRegex = /^[A-Za-z][A-Za-z\s.-]{1,58}$/
    if (!locationRegex.test(deliveryInfo.city)) {
        return 'City should be 2-59 characters with letters only'
    }

    if (!locationRegex.test(deliveryInfo.state)) {
        return 'State should be 2-59 characters with letters only'
    }

    if (!locationRegex.test(deliveryInfo.country)) {
        return 'Country should be 2-59 characters with letters only'
    }

    if (!/^\d{6}$/.test(deliveryInfo.pincode)) {
        return 'Pincode must be exactly 6 digits'
    }

    if (!/^\d{10}$/.test(deliveryInfo.phone)) {
        return 'Phone number must be exactly 10 digits'
    }

    return null
}

const extractItems = (products = []) => {
    if (!Array.isArray(products) || products.length === 0) {
        return []
    }

    return products
        .map((item) => {
            const productId = item?.product?._id || item?.product || item?.id
            const quantity = Number(item?.quantity || 0)
            return {
                productId: String(productId || ''),
                quantity
            }
        })
        .filter((item) => item.productId && Number.isInteger(item.quantity) && item.quantity > 0 && isMongoObjectId(item.productId))
}

const resolveOrderProducts = async (items = []) => {
    const productIds = items.map((item) => item.productId)
    const products = await Product.find({ _id: { $in: productIds } }).select('_id name price')
    const productMap = new Map(products.map((product) => [String(product._id), product]))

    const missingProductIds = items
        .filter((item) => !productMap.has(item.productId))
        .map((item) => item.productId)

    const orderProducts = items.map((item) => {
        const product = productMap.get(item.productId)
        if (!product) {
            return null
        }

        return {
            product: product._id,
            quantity: item.quantity,
            price: Number(product.price || 0),
            name: product.name || 'Product'
        }
    }).filter(Boolean)

    const totalAmount = orderProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    return { orderProducts, totalAmount, missingProductIds }
}

const generateOrderPdfBuffer = async ({ orderId, customerName, shippingAddress = {}, products, totalAmount, orderedAt, estimatedDeliveryDate, paymentMethod, paymentStatus }) => {
    const safeProducts = Array.isArray(products) ? products : []
    const productsQrBuffer = await generateProductsQrBuffer({ orderId, products: safeProducts })
    const doc = new PDFDocument({ margin: 40, size: 'A4' })
    const chunks = []

    return new Promise((resolve, reject) => {
        doc.on('data', (chunk) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', (error) => reject(error))

        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
        const contentLeft = 40
        const contentRight = 40 + pageWidth
        const accentColor = '#1d4ed8'
        const paymentTone = paymentStatus === 'Paid' ? '#16a34a' : '#f59e0b'

        if (logoBuffer) {
            doc.save()
            doc.opacity(0.06)
            doc.image(logoBuffer, 145, 245, { width: 250 })
            doc.restore()
        }

        doc.save()
        doc.roundedRect(contentLeft, 40, pageWidth, 92, 18).fillAndStroke('#0f172a', '#0f172a')
        doc.roundedRect(contentLeft + 2, 42, pageWidth - 4, 88, 16).fillAndStroke(accentColor, accentColor)
        doc.restore()

        doc.save()
        doc.roundedRect(54, 56, 64, 64, 18).fillAndStroke('white', 'white')
        if (logoBuffer) {
            doc.image(logoBuffer, 60, 62, { fit: [52, 52], align: 'center', valign: 'center' })
        } else {
            doc.fillColor(accentColor).font('Helvetica-Bold').fontSize(24).text('C', 72, 74)
        }
        doc.restore()

        doc.fillColor('white').fontSize(20).font('Helvetica-Bold').text('CampusKart', 136, 56)
        doc.fontSize(11).font('Helvetica').text('Order Invoice', 136, 82)
        doc.fontSize(10).text(`Order ID: ${orderId}`, 136, 104)

        doc.roundedRect(410, 56, 120, 50, 14).fillAndStroke('rgba(255,255,255,0.16)', 'rgba(255,255,255,0.22)')
        doc.fillColor('white').font('Helvetica-Bold').fontSize(9).text('Payment', 424, 68)
        doc.fillColor('white').font('Helvetica').fontSize(10).text(paymentMethod || 'N/A', 424, 82)
        doc.fillColor(paymentTone).font('Helvetica-Bold').fontSize(9).text(paymentStatus || 'N/A', 424, 96)

        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(16).text(`Hi ${customerName || 'Customer'},`, contentLeft, 156)
        doc.font('Helvetica').fontSize(10).fillColor('#475569').text('Your order has been confirmed. A summary and invoice are shown below.', contentLeft, 178, { width: pageWidth })

        const summaryTop = 208
        const summaryCardWidth = (pageWidth - 12) / 2
        const summaryCardHeight = 62
        const summaryCardGap = 12
        const drawCard = (x, y, title, value, valueColor = '#0f172a') => {
            doc.roundedRect(x, y, summaryCardWidth, summaryCardHeight, 14).fillAndStroke('#f8fafc', '#dbeafe')
            doc.fillColor('#64748b').font('Helvetica').fontSize(9).text(title, x + 12, y + 12)
            doc.fillColor(valueColor).font('Helvetica-Bold').fontSize(12).text(value, x + 12, y + 30, { width: summaryCardWidth - 24 })
        }

        drawCard(contentLeft, summaryTop, 'Payment Method', paymentMethod || 'N/A', accentColor)
        drawCard(contentLeft + summaryCardWidth + summaryCardGap, summaryTop, 'Payment Status', paymentStatus || 'N/A', paymentTone)
        drawCard(contentLeft, summaryTop + summaryCardHeight + 10, 'Order Date', formatDateLabel(orderedAt))
        drawCard(contentLeft + summaryCardWidth + summaryCardGap, summaryTop + summaryCardHeight + 10, 'Delivery Date', formatDateLabel(estimatedDeliveryDate))

        const shippingTop = 346
        const shippingHeight = 112
        const shippingWidth = 320
        doc.roundedRect(contentLeft, shippingTop, shippingWidth, shippingHeight, 16).fillAndStroke('#ffffff', '#dbeafe')
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(11).text('Shipping Address', contentLeft + 14, shippingTop + 14)
        doc.fillColor('#475569').font('Helvetica').fontSize(9)
        formatAddressLines(shippingAddress).forEach((line, index) => {
            doc.text(line, contentLeft + 14, shippingTop + 34 + (index * 14), { width: shippingWidth - 28 })
        })

        const qrSize = 112
        const qrX = contentRight - qrSize
        const qrY = shippingTop
        doc.roundedRect(qrX, qrY, qrSize, shippingHeight, 16).fillAndStroke('#f8fafc', '#dbeafe')
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(11).text('Products QR', qrX + 14, qrY + 14)
        doc.fillColor('#64748b').font('Helvetica').fontSize(8).text('Scan for order items', qrX + 14, qrY + 28)

        if (productsQrBuffer) {
            doc.image(productsQrBuffer, qrX + 18, qrY + 42, { fit: [76, 76], align: 'center', valign: 'center' })
        } else {
            doc.roundedRect(qrX + 22, qrY + 46, 68, 68, 8).fillAndStroke('#e2e8f0', '#cbd5e1')
            doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(8).text('QR unavailable', qrX + 28, qrY + 78)
        }
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8).text(String(orderId).slice(-10), qrX + 14, qrY + 94, { width: qrSize - 28, align: 'center' })

        doc.roundedRect(contentLeft, 474, pageWidth, 26, 8).fillAndStroke(accentColor, accentColor)
        doc.fillColor('white').font('Helvetica-Bold').fontSize(10).text('Items Ordered', contentLeft + 14, 482)
        doc.fillColor('white').font('Helvetica').fontSize(8).text(`${safeProducts.length} products`, contentRight - 92, 482, { width: 78, align: 'right' })

        let y = 510
        safeProducts.forEach((item, index) => {
            const rowHeight = 28
            const quantity = Number(item?.quantity || 0)
            const price = Number(item?.price || 0)
            const lineTotal = quantity * price
            doc.roundedRect(contentLeft, y, pageWidth, rowHeight, 8).fillAndStroke(index % 2 === 0 ? '#ffffff' : '#f8fafc', '#e2e8f0')
            doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9).text(`${index + 1}. ${item?.name || 'Product'}`, contentLeft + 14, y + 9, { width: 220 })
            doc.fillColor('#475569').font('Helvetica').fontSize(9).text(`Qty: ${quantity}`, 286, y + 9, { width: 70, align: 'right' })
            doc.fillColor('#475569').font('Helvetica').fontSize(9).text(`Price: ${toCurrency(price)}`, 362, y + 9, { width: 92, align: 'right' })
            doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9).text(toCurrency(lineTotal), 470, y + 9, { width: 86, align: 'right' })
            y += rowHeight + 6
        })

        doc.roundedRect(contentLeft, y + 8, pageWidth, 44, 12).fillAndStroke('#0f172a', '#0f172a')
        doc.fillColor('white').font('Helvetica-Bold').fontSize(10).text('Thank you for shopping with CampusKart', contentLeft + 14, y + 22)
        doc.fillColor('#94a3b8').font('Helvetica').fontSize(8).text('This invoice was generated automatically and is valid without signature.', contentLeft + 14, y + 36)

        const footerY = y + 68
        doc.roundedRect(contentLeft, footerY, pageWidth, 30, 10).fillAndStroke(accentColor, accentColor)
        doc.fillColor('white').font('Helvetica-Bold').fontSize(9).text('CampusKart • Campus commerce, made simpler', contentLeft + 14, footerY + 10)
        doc.fillColor('white').font('Helvetica').fontSize(8).text('Support your campus shopping journey with premium checkout and delivery updates.', contentLeft + 14, footerY + 18)
        doc.end()
    })
}

const postOrderActions = async ({ orderDoc, user, orderProducts }) => {
    const emailProducts = orderProducts.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
    }))

    const customerName = `${orderDoc?.deliveryAddress?.firstName || ''} ${orderDoc?.deliveryAddress?.lastName || ''}`.trim() || user?.name || 'Customer'

    const pdfBuffer = await generateOrderPdfBuffer({
        orderId: String(orderDoc._id),
        customerName,
        shippingAddress: orderDoc.deliveryAddress || {},
        products: emailProducts,
        totalAmount: orderDoc.totalAmount,
        orderedAt: orderDoc.createdAt,
        estimatedDeliveryDate: orderDoc.estimatedDeliveryDate,
        paymentMethod: orderDoc.paymentMethod,
        paymentStatus: orderDoc.paymentStatus
    })

    await sendOrderConfirmationEmail({
        to: orderDoc?.deliveryAddress?.email || user?.email,
        customerName,
        orderId: String(orderDoc._id),
        paymentMethod: orderDoc.paymentMethod,
        paymentStatus: orderDoc.paymentStatus,
        orderedAt: orderDoc.createdAt,
        estimatedDeliveryDate: orderDoc.estimatedDeliveryDate,
        products: emailProducts,
        totalAmount: orderDoc.totalAmount,
        pdfBuffer
    })
}

/**
 * STEP 1: Create an Order
 * This is called when the user clicks the "Checkout" button.
 */
export const createCheckoutSession = async (req, res) => {
    try {
        const { products, deliveryInfo } = req.body
        const normalizedDelivery = normalizeDeliveryInfo(deliveryInfo)
        const deliveryError = validateDeliveryInfo(normalizedDelivery)
        if (deliveryError) {
            return res.status(400).json({ message: deliveryError })
        }

        if (!ENV.RAZORPAY_KEY_ID || !ENV.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ message: 'Razorpay is not configured on server' })
        }

        const items = extractItems(products)
        if (items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' })
        }

        const { orderProducts, totalAmount, missingProductIds } = await resolveOrderProducts(items)

        if (missingProductIds.length > 0) {
            await User.findByIdAndUpdate(req.id, {
                $pull: {
                    cartItems: {
                        product: { $in: missingProductIds }
                    }
                }
            })
        }

        if (orderProducts.length === 0) {
            return res.status(400).json({ message: 'Cart contains unavailable products. Please refresh and try again.' })
        }

        const totalAmountInPaise = Math.round(totalAmount * 100)

        if (totalAmountInPaise <= 0) {
            return res.status(400).json({ message: 'Invalid total amount' })
        }

        const options = {
            amount: totalAmountInPaise,
            currency: 'INR',
            receipt: `order_rcpt_${Date.now()}`,
            notes: {
                userId: req.id.toString(),
                products: JSON.stringify(orderProducts.map((item) => ({
                    id: item.product,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name
                })))
            }
        }

        const order = await razorpay.orders.create(options)

        return res.status(201).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: ENV.RAZORPAY_KEY_ID
        })
    } catch (error) {
        console.error('Checkout session creation error:', error.message)
        return res.status(500).json({
            message: getGatewayErrorMessage(error, 'Failed to create checkout session'),
            error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message
        })
    }
}

/**
 * STEP 2: Verify Payment
 * This is called after the user successfully pays in the Razorpay Modal.
 */
export const checkoutSuccess = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            deliveryInfo
        } = req.body

        const normalizedDelivery = normalizeDeliveryInfo(deliveryInfo)
        const deliveryError = validateDeliveryInfo(normalizedDelivery)
        if (deliveryError) {
            return res.status(400).json({ message: deliveryError })
        }

        if (!razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                message: "razorpay_payment_id and razorpay_signature are required",
            })
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                message: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required",
            })
        }

        const sign = `${razorpay_order_id}|${razorpay_payment_id}`
        const expectedSign = crypto
            .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest('hex')

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ message: 'Invalid payment signature' })
        }

        const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id })
        if (existingOrder) {
            return res.status(200).json({ message: 'Order already exists', orderId: existingOrder._id })
        }

        const orderDetails = await razorpay.orders.fetch(razorpay_order_id)
        const notesProducts = JSON.parse(orderDetails?.notes?.products || '[]')
        const orderProducts = notesProducts
            .map((item) => {
                const productId = String(item.id || '')
                const quantity = Number(item.quantity || 0)
                const price = Number(item.price || 0)

                if (!productId || !isMongoObjectId(productId) || !Number.isInteger(quantity) || quantity <= 0 || price < 0) {
                    return null
                }

                return {
                    product: productId,
                    quantity,
                    price,
                    name: String(item.name || 'Product')
                }
            })
            .filter(Boolean)

        if (orderProducts.length === 0) {
            return res.status(400).json({ message: 'Unable to restore products for this payment order' })
        }

        const totalAmount = orderProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const estimatedDeliveryDate = buildEstimatedDeliveryDate()
        const user = await User.findById(orderDetails.notes.userId)

        const newOrder = await Order.create({
            user: orderDetails.notes.userId,
            products: orderProducts.map((item) => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount,
            paymentMethod: 'Razorpay',
            paymentStatus: 'Paid',
            orderStatus: 'Placed',
            deliveryAddress: normalizedDelivery,
            estimatedDeliveryDate,
            razorpayOrderId: razorpay_order_id
        })

        await User.findByIdAndUpdate(orderDetails.notes.userId, {
            $set: { cartItems: [] }
        })

        let warning = null
        try {
            await postOrderActions({ orderDoc: newOrder, user, orderProducts })
        } catch (postOrderError) {
            warning = 'Order placed, but confirmation email generation failed'
            console.error('Post-order actions failed (Razorpay):', postOrderError.message)
        }

        return res.status(201).json({
            success: true,
            message: "Payment verified and order created",
            orderId: newOrder._id,
            estimatedDeliveryDate,
            warning
        })
    } catch (error) {
        console.error('Payment verification error:', error.message)
        return res.status(500).json({ 
            message: "Failed to verify payment",
            error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message
        })
    }
}

export const placeCodOrder = async (req, res) => {
    try {
        const { products, deliveryInfo } = req.body
        const normalizedDelivery = normalizeDeliveryInfo(deliveryInfo)
        const deliveryError = validateDeliveryInfo(normalizedDelivery)

        if (deliveryError) {
            return res.status(400).json({ message: deliveryError })
        }

        const items = extractItems(products)
        if (items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' })
        }

        const { orderProducts, totalAmount, missingProductIds } = await resolveOrderProducts(items)

        if (missingProductIds.length > 0) {
            await User.findByIdAndUpdate(req.id, {
                $pull: {
                    cartItems: {
                        product: { $in: missingProductIds }
                    }
                }
            })
        }

        if (orderProducts.length === 0) {
            return res.status(400).json({ message: 'Cart contains unavailable products. Please refresh and try again.' })
        }

        const estimatedDeliveryDate = buildEstimatedDeliveryDate()
        const user = await User.findById(req.id)

        const order = await Order.create({
            user: req.id,
            products: orderProducts.map((item) => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount,
            paymentMethod: 'COD',
            paymentStatus: 'Pending',
            orderStatus: 'Placed',
            deliveryAddress: normalizedDelivery,
            estimatedDeliveryDate
        })

        await User.findByIdAndUpdate(req.id, {
            $set: { cartItems: [] }
        })

        let warning = null
        try {
            await postOrderActions({ orderDoc: order, user, orderProducts })
        } catch (postOrderError) {
            warning = 'Order placed, but confirmation email generation failed'
            console.error('Post-order actions failed (COD):', postOrderError.message)
        }

        return res.status(201).json({
            success: true,
            message: 'Order placed successfully with Cash on Delivery',
            orderId: order._id,
            estimatedDeliveryDate,
            totalAmount,
            warning
        })
    } catch (error) {
        console.error('COD order creation error:', error.message)
        return res.status(500).json({
            message: 'Failed to place COD order',
            error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message
        })
    }
}

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.id })
            .populate('products.product', 'name imageUrl category')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            count: orders.length,
            orders
        })
    } catch (error) {
        console.error('Get orders error:', error.message)
        return res.status(500).json({
            message: 'Failed to fetch order history',
            error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message
        })
    }
}

export const downloadMyOrderInvoice = async (req, res) => {
    try {
        const orderId = req.params.orderId
        const order = await Order.findOne({ _id: orderId, user: req.id }).populate('products.product', 'name')

        if (!order) {
            return res.status(404).json({ message: 'Order not found' })
        }

        const customerName = `${order?.deliveryAddress?.firstName || ''} ${order?.deliveryAddress?.lastName || ''}`.trim() || req.user?.name || 'Customer'
        const products = order.products.map((item) => ({
            name: item?.product?.name || 'Product',
            quantity: item.quantity,
            price: item.price
        }))

        const pdfBuffer = await generateOrderPdfBuffer({
            orderId: String(order._id),
            customerName,
            shippingAddress: order.deliveryAddress || {},
            products,
            totalAmount: order.totalAmount,
            orderedAt: order.createdAt,
            estimatedDeliveryDate: order.estimatedDeliveryDate,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus
        })

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${order._id}.pdf"`)
        return res.status(200).send(pdfBuffer)
    } catch (error) {
        console.error('Download invoice error:', error.message)
        return res.status(500).json({
            message: 'Failed to download invoice',
            error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message
        })
    }
}