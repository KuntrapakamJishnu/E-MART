import express from 'express'
import {
	approveSeller,
	getAllUsersForAdmin,
	getCartItem,
	getOrderSupportRequestsForAdmin,
	getPendingSellers,
	getRecentLogins,
	getUser,
	login,
	logout,
	register,
	removeUserByAdmin,
	updateOrderSupportRequestStatusByAdmin,
	updateProfile
} from '../controller/user.controller.js'
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.image.js'


const userRoute = express.Router()


userRoute.post('/register', register)
userRoute.post('/login', login)
userRoute.get('/getUser', protectRoute, getUser)
userRoute.post('/updateProfile', protectRoute, upload.single('profilePhoto'), updateProfile)
userRoute.get('/getCartItem', protectRoute, getCartItem)
userRoute.post('/logout', logout)
userRoute.get('/admin/pending-sellers', protectRoute, adminRoute, getPendingSellers)
userRoute.post('/admin/approve-seller/:id', protectRoute, adminRoute, approveSeller)
userRoute.get('/admin/recent-logins', protectRoute, adminRoute, getRecentLogins)
userRoute.get('/admin/users', protectRoute, adminRoute, getAllUsersForAdmin)
userRoute.delete('/admin/users/:id', protectRoute, adminRoute, removeUserByAdmin)
userRoute.get('/admin/order-support-requests', protectRoute, adminRoute, getOrderSupportRequestsForAdmin)
userRoute.patch('/admin/order-support-requests/:orderId/:requestId', protectRoute, adminRoute, updateOrderSupportRequestStatusByAdmin)

export default userRoute