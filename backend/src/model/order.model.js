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
    paymentMethod: {
        type: String,
        enum: ["COD", "Razorpay"],
        default: "Razorpay"
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Paid"
    },
    orderStatus: {
        type: String,
        enum: ["Placed", "Processing", "Shipped", "Out for delivery", "Delivered", "Cancelled"],
        default: "Placed"
    },
    deliveryAddress: {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, trim: true, default: '' },
        email: { type: String, required: true, lowercase: true, trim: true },
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pincode: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true }
    },
    estimatedDeliveryDate: {
        type: Date,
        required: true
    },
    razorpayOrderId: {
        type: String,
        default: undefined
    },
    supportRequests: [
        {
            requestType: {
                type: String,
                enum: ['return', 'exchange'],
                required: true
            },
            reason: {
                type: String,
                required: true,
                trim: true,
                maxlength: 500
            },
            status: {
                type: String,
                enum: ['Requested', 'Approved', 'Rejected', 'Completed'],
                default: 'Requested'
            },
            requestedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {timestamps: true});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index(
    { razorpayOrderId: 1 },
    {
        unique: true,
        name: 'razorpayOrderId_1',
        partialFilterExpression: {
            razorpayOrderId: { $type: 'string' }
        }
    }
);
orderSchema.index({ orderStatus: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export const repairOrderIndexes = async () => {
    const collection = Order.collection

    try {
        const indexes = await collection.indexes()
        const legacyIndex = indexes.find((index) => index.name === 'razorpayOrderId_1')

        if (legacyIndex) {
            await collection.dropIndex('razorpayOrderId_1')
        }
    } catch (error) {
        if (error?.codeName !== 'IndexNotFound' && error?.code !== 27) {
            throw error
        }
    }

    await Order.syncIndexes()
}

export default Order;