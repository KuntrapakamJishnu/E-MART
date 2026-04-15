import express from "express"
import { approvedSellerOrAdminRoute, protectRoute } from "../middleware/auth.middleware.js"
import {
	createInterviewReview,
	deleteInterviewReview,
	getInterviewReviews,
	getInterviewReviewStats,
	toggleHelpfulVote,
	updateInterviewReview
} from "../controller/interviewReview.controller.js"

const interviewReviewRoute = express.Router()

interviewReviewRoute.post("/create", protectRoute, approvedSellerOrAdminRoute, createInterviewReview)
interviewReviewRoute.get("/list", protectRoute, getInterviewReviews)
interviewReviewRoute.patch("/update/:id", protectRoute, approvedSellerOrAdminRoute, updateInterviewReview)
interviewReviewRoute.delete("/delete/:id", protectRoute, approvedSellerOrAdminRoute, deleteInterviewReview)
interviewReviewRoute.post("/helpful/:id", protectRoute, toggleHelpfulVote)
interviewReviewRoute.get("/stats", protectRoute, getInterviewReviewStats)

export default interviewReviewRoute
