import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js'; // Ensure 'e' is present
import {
    checkoutSuccess,
    createCheckoutSession
} from '../controller/payment.controller.js';

const paymentRoute = express.Router();

paymentRoute.post('/createPayment', protectRoute, createCheckoutSession);
paymentRoute.post('/create-success', protectRoute, checkoutSuccess);

export default paymentRoute;