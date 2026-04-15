import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        min: 0,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, {timestamps: true});

productSchema.index({name: "text", description: "text", category: "text"});
productSchema.index({category: 1});
productSchema.index({price: 1});
productSchema.index({isFeatured: 1, createdAt: -1});
productSchema.index({createdAt: -1});
const Product = mongoose.model("Product", productSchema);

export default Product;