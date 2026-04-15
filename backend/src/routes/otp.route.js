import express from 'express'
import { sendOtp, verifyOtp, resendOtp } from '../controller/otp.controller.js'

const router = express.Router()

// Send OTP to email
router.post('/send', sendOtp)

// Verify OTP and register user
router.post('/verify', verifyOtp)

// Resend OTP
router.post('/resend', resendOtp)

export default router
