import express from "express";
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';
import { getAnalyticsController, getDailySalesController } from "../controller/analytics.controller.js";

const analyticRoute = express.Router()


analyticRoute.get('/getDate', protectRoute, adminRoute, getAnalyticsController)
analyticRoute.get('/dailySales', protectRoute, adminRoute, getDailySalesController)

export default analyticRoute