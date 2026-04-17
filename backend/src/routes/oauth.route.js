import express from 'express'
import { googleAuthCallback, getGoogleAuthUrl, getOAuthUrls } from '../controller/oauth.controller.js'

const router = express.Router()

// Get OAuth URLs for frontend
router.get('/urls', getOAuthUrls)

// Direct Google OAuth entrypoint
router.get('/google', (req, res) => {
	return res.redirect(getGoogleAuthUrl())
})

// Google OAuth callback
router.get('/google/callback', googleAuthCallback)
router.post('/google/callback', googleAuthCallback)

export default router
