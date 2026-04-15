import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { chatWithAI, generateProductDescription, getSmartRecommendations } from "../controller/ai.controller.js"

const aiRoute = express.Router()

aiRoute.post("/chat", protectRoute, chatWithAI)
aiRoute.get("/recommendations", protectRoute, getSmartRecommendations)
aiRoute.post("/generate-description", protectRoute, generateProductDescription)

export default aiRoute
