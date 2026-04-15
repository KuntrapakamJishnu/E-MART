import {ENV} from "../config/env.js";
import { razorpay } from "../config/razorpay.js";
import  Order  from "../model/order.model.js";
import  User  from "../model/user.model.js";
import crypto from "crypto";

/**
 * STEP 1: Create an Order
 * This is called when the user clicks the "Checkout" button.
 */
export const createCheckoutSession = async (req, res) => {
    try {
        const { products } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // 1. Calculate total amount in Paise (Razorpay expects smallest unit)
        // For USD, 100 cents = 1 unit. For INR, 100 paise = 1 unit.
        let totalAmount = 0;
        products.forEach((p) => {
            totalAmount += Math.round(p.product.price * 100) * p.quantity;
        });

        // 2. Setup Razorpay Order options
        const options = {
            amount: totalAmount,
            currency: "INR", // Change to "INR" if using Indian account
            receipt: `order_rcpt_${Date.now()}`,
            notes: {
                userId: req.id.toString(), // Ensure this matches your auth middleware
                products: JSON.stringify(
                    products.map((p) => ({
                        id: p.product._id,
                        quantity: p.quantity,
                        price: p.product.price,
                    }))
                ),
            },
        };

        const order = await razorpay.orders.create(options);

        // 3. Return the order details to frontend to trigger the popup
        return res.status(201).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: ENV.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error("Razorpay Order Creation Error:", error);
        res.status(500).json({ message: "Server error during order creation" });
    }
};

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
        } = req.body;

        // Validate required fields
        if (!razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                message: "razorpay_payment_id and razorpay_signature are required",
            });
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                message: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required",
            });
        }

        const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSign = crypto
            .createHmac("sha256", ENV.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        // 2. Avoid duplicate processing
        const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (existingOrder) {
            return res.status(200).json({ message: "Order already exists" });
        }

        // 3. Fetch order details from Razorpay
        const orderDetails = await razorpay.orders.fetch(razorpay_order_id);
        const products = JSON.parse(orderDetails.notes.products);

        // 4. Save the order
        const newOrder = new Order({
            user: orderDetails.notes.userId,
            products: products.map((p) => ({
                product: p.id,
                quantity: p.quantity,
                price: p.price,
            })),
            totalAmount: orderDetails.amount / 100,
            orderStatus: "Placed",
            razorpayOrderId: razorpay_order_id,
        });

        await newOrder.save();

        // 5. Clear user cart (Ensure field name is cartItems or cartItem)
        await User.findByIdAndUpdate(orderDetails.notes.userId, {
            $set: { cartItems: [] }, 
        });

        return res.status(201).json({
            success: true,
            message: "Payment verified and order created",
            orderId: newOrder._id,
        });
    } catch (error) {
        console.error("Razorpay Verification Error:", error);
        res.status(500).json({ message: "Server error during verification" });
    }
};