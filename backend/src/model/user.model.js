import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String
    },
    owner: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['student', 'seller', 'admin'],
        default: 'student'
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    profilePhoto: {
        type: String
    },
    profilePicture: {
        type: String
    },
    cartItems: [
        {
            quantity: {
                type: Number,
                default: 1
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        }
    ],
    // OTP Authentication Fields
    otpCode: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // OAuth Fields
    oauthProvider: {
        type: String,
        enum: ['google', 'github', null],
        default: null
    },
    oauthId: {
        type: String,
        default: null
    }
}, {timestamps: true});

// Create index for OAuth provider and ID
userSchema.index({ oauthProvider: 1, oauthId: 1 }, { sparse: true });
userSchema.index({ role: 1, isApproved: 1 });
 
const User = mongoose.model("User", userSchema);

export default User;