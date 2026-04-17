import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js'; // Ensure 'e' is present
import {
    checkoutSuccess,
    createCheckoutSession,
    placeCodOrder,
    getMyOrders,
    downloadMyOrderInvoice
} from '../controller/payment.controller.js';

const paymentRoute = express.Router();

paymentRoute.post('/createPayment', protectRoute, createCheckoutSession);
paymentRoute.post('/create-payment', protectRoute, createCheckoutSession);
paymentRoute.post('/create-success', protectRoute, checkoutSuccess);
paymentRoute.post('/verify', protectRoute, checkoutSuccess);
paymentRoute.post('/place-cod-order', protectRoute, placeCodOrder);
paymentRoute.post('/placeCodOrder', protectRoute, placeCodOrder);
paymentRoute.post('/cod', protectRoute, placeCodOrder);
paymentRoute.get('/orders', protectRoute, getMyOrders);
paymentRoute.get('/orders/:orderId/invoice', protectRoute, downloadMyOrderInvoice);

export default paymentRoute;