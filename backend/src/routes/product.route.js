import express from 'express'
import { adminRoute, approvedSellerOrAdminRoute, protectRoute } from '../middleware/auth.middleware.js'
import { approveProduct, createProduct, deleteProduct, getFeatureProduct, getPendingProducts, getProductController, getSingleProduct, toggleFeatureProducts, updateProduct } from '../controller/product.controller.js'
import { upload } from '../middleware/upload.image.js'


const productRoute = express.Router()


productRoute.post('/createProduct', protectRoute, approvedSellerOrAdminRoute, upload.single('image'),createProduct)
productRoute.post('/updateProduct/:id', protectRoute, approvedSellerOrAdminRoute, upload.single('image'), updateProduct)
productRoute.get('/getAllProduct', protectRoute, getProductController)
productRoute.post('/toggleProduct/:id', protectRoute, adminRoute, toggleFeatureProducts)
productRoute.post('/deleteProduct/:id', protectRoute, approvedSellerOrAdminRoute, deleteProduct)
productRoute.get('/getSingleProduct/:id', protectRoute, getSingleProduct)
productRoute.get('/getFeaturedProduct', protectRoute, getFeatureProduct)
productRoute.get('/admin/pending', protectRoute, adminRoute, getPendingProducts)
productRoute.post('/admin/approve/:id', protectRoute, adminRoute, approveProduct)
export default productRoute