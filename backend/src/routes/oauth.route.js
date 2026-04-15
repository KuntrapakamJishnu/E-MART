import express from 'express'
import { googleAuthCallback, getOAuthUrls } from '../controller/oauth.controller.js'

const router = express.Router()

// Get OAuth URLs for frontend
router.get('/urls', getOAuthUrls)

// Google OAuth callback
router.get('/google/callback', googleAuthCallback)
router.post('/google/callback', googleAuthCallback)

export default router
