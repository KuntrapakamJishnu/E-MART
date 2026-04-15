import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    orderStatus: {
        type: String,
        enum: ["Placed", "Processing", "Shipped", "Out for delivery", "Delivered", "Cancelled"],
        default: "Placed"
    },
    razorpayOrderId: {
        type: String,
        required: true
    }
}, {timestamps: true});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ razorpayOrderId: 1 }, { unique: true });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;