import express from "express"
import { chatWithAI, generateProductDescription, getSmartRecommendations } from "../controller/ai.controller.js"

const aiRoute = express.Router()

aiRoute.post("/chat", chatWithAI)
aiRoute.get("/recommendations", getSmartRecommendations)
aiRoute.post("/generate-description", generateProductDescription)

export default aiRoute
