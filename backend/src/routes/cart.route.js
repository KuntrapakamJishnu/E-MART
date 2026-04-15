import express from 'express'
import { addToCart, removeFromCart, removeAllCart, updateProductQuantity } from '../controller/cart.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'

const cartRoute = express.Router()

cartRoute.post('/addToCart', protectRoute, addToCart)
cartRoute.post('/removeFromCart', protectRoute, removeFromCart)
cartRoute.get('/removeAll', protectRoute, removeAllCart)
cartRoute.post('/updateQuantity/:id', protectRoute, updateProductQuantity)

export default cartRoute