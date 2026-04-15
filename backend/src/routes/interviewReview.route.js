import express from "express"
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js"
import {
	createInterviewReview,
	deleteInterviewReview,
	getInterviewReviews,
	getInterviewReviewStats,
	toggleHelpfulVote,
	updateInterviewReview
} from "../controller/interviewReview.controller.js"

const interviewReviewRoute = express.Router()

interviewReviewRoute.post("/create", protectRoute, adminRoute, createInterviewReview)
interviewReviewRoute.get("/list", protectRoute, getInterviewReviews)
interviewReviewRoute.patch("/update/:id", protectRoute, adminRoute, updateInterviewReview)
interviewReviewRoute.delete("/delete/:id", protectRoute, adminRoute, deleteInterviewReview)
interviewReviewRoute.post("/helpful/:id", protectRoute, adminRoute, toggleHelpfulVote)
interviewReviewRoute.get("/stats", protectRoute, getInterviewReviewStats)

export default interviewReviewRoute
