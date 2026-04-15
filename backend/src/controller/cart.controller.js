import User from "../model/user.model.js";

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingItem = user.cartItems.find((item) => item.product.toString() === productId);

        if (existingItem) {
            return res.status(400).json({
                message: "Product is already in the cart"
            });
        }

        user.cartItems.push({ quantity: 1, product: productId });
        await user.save();

        return res.status(201).json({
            message: "Product added to your cart successfully"
        });
        
    } catch (error) {
        console.error(`error from addToCart:`, error);
        return res.status(500).json({ message: "Unable to add product to cart" });
    }
}

export const removeFromCart = async(req, res)=>{
    try {
        const {productId} = req.body;
        const userId = req.id;

        if(!productId){
            return res.status(401).json({
                message:"Product id is not available"
            })
        }


        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not available"
            });
        }

        await user.updateOne({
            $pull: { cartItems: { product: productId } }
        });
        

        return res.status(201).json({
            message:"Product removed from cart"
        })

    } catch (error) {
        console.error(`error from removeFromCart:`, error);
        return res.status(500).json({ message: "Unable to remove product from cart" });
    }
}


export const removeAllCart = async(req,res)=>{
    try {
        

        const userId = req.id;

        const user = await User.findById(userId)

        if(!user){
            return res.status(401).json({
                message:"User not found"
            })
        }


        user.cartItems = [];

        await user.save();

        return res.status(201).json({
            message:"Cart cleared successfully"
        })
    } catch (error) {
        console.error(`error from removeAllCart:`, error);
        return res.status(500).json({ message: "Unable to clear cart" });
    }
}



export const updateProductQuantity = async(req,res)=>{
    try {
        const productId = req.params.id;

        const {operation}  = req.body;

        const userId = req.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const item = user.cartItems.find((item) => item.product.toString() === productId);

        if (!item) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (operation === 'increase') {
            item.quantity += 1;
        } else if (operation === 'decrease') {
            item.quantity -= 1;

            // remove item if quantity is zero or less
            if (item.quantity <= 0) {
                user.cartItems = user.cartItems.filter((p) => p.product.toString() !== productId);
            }
        } else {
            return res.status(400).json({
                message: "Invalid operation"
            });
        }

        await user.save();

        return res.status(200).json({
            message: `Product quantity ${operation}d successfully`,
            cartItems: user.cartItems
        });
    } catch (error) {
        console.error(`error from updateProductQuantity:`, error);
        return res.status(500).json({ message: "Unable to update cart quantity" });
    }
}