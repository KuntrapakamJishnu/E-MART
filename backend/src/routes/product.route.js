import express from 'express'
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js'
import { createProduct, deleteProduct, getFeatureProduct, getProductController, getSingleProduct, toggleFeatureProducts, updateProduct } from '../controller/product.controller.js'
import { upload } from '../middleware/upload.image.js'


const productRoute = express.Router()


productRoute.post('/createProduct', protectRoute, adminRoute, upload.single('image'),createProduct)
productRoute.post('/updateProduct/:id', protectRoute, adminRoute, upload.single('image'), updateProduct)
productRoute.get('/getAllProduct', protectRoute, getProductController)
productRoute.post('/toggleProduct/:id', protectRoute, adminRoute, toggleFeatureProducts)
productRoute.post('/deleteProduct/:id', protectRoute, adminRoute, deleteProduct)
productRoute.get('/getSingleProduct/:id', protectRoute, getSingleProduct)
productRoute.get('/getFeaturedProduct', protectRoute, getFeatureProduct)
export default productRoute