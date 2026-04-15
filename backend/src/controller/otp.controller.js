import User from '../model/user.model.js'
import { sendOtpEmail, sendWelcomeEmail } from '../config/smtp.js'

// Generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP to email
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        message: 'Email is required'
      })
    }

    // Check if user already exists and is already verified
    const existingUser = await User.findOne({ email })
    if (existingUser?.isVerified) {
      return res.status(400).json({
        message: 'Email already registered'
      })
    }

    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP temporarily (ideally in Redis for production)
    // For now, we'll create a pending verification record
    await User.findOneAndUpdate(
      { email },
      {
        otpCode: otp,
        otpExpiry: otpExpiry,
        isVerified: false
      },
      { upsert: true, new: true }
    )

    // Send OTP email
    const emailResult = await sendOtpEmail(email, otp)

    if (emailResult.success) {
      return res.status(200).json({
        message: 'OTP sent to your email',
        email: email
      })
    } else {
      return res.status(500).json({
        message: 'Failed to send OTP email'
      })
    }
  } catch (error) {
    console.error('Send OTP Error:', error)
    return res.status(500).json({
      message: 'Failed to send OTP',
      error: error.message
    })
  }
}

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, name, password } = req.body

    if (!email || !otp || !name || !password) {
      return res.status(400).json({
        message: 'Email, OTP, name, and password are required'
      })
    }

    // Find user with OTP
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        message: 'Email not found'
      })
    }

    // Check if OTP exists and is not expired
    if (!user.otpCode || !user.otpExpiry) {
      return res.status(400).json({
        message: 'OTP not found. Please request a new OTP'
      })
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        message: 'OTP has expired'
      })
    }

    // Verify OTP
    if (user.otpCode !== otp) {
      return res.status(400).json({
        message: 'Invalid OTP'
      })
    }

    // OTP verified, update user
    const bcryptModule = await import('bcryptjs')
    const bcrypt = bcryptModule.default
    const hashedPassword = await bcrypt.hash(password, 10)

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        name,
        password: hashedPassword,
        isVerified: true,
        otpCode: null,
        otpExpiry: null
      },
      { new: true }
    )

    // Send welcome email
    await sendWelcomeEmail(email, name)

    return res.status(201).json({
      message: 'Account verified successfully. Please login with your email and password.',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePhoto: updatedUser.profilePhoto || null,
        cartItem: updatedUser.cartItems?.length || 0
      }
    })
  } catch (error) {
    console.error('Verify OTP Error:', error)
    return res.status(500).json({
      message: 'Failed to verify OTP',
      error: error.message
    })
  }
}

// Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        message: 'Email is required'
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        message: 'Email not found'
      })
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: 'Email already verified'
      })
    }

    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await User.findByIdAndUpdate(user._id, {
      otpCode: otp,
      otpExpiry: otpExpiry
    })

    const emailResult = await sendOtpEmail(email, otp)

    if (emailResult.success) {
      return res.status(200).json({
        message: 'New OTP sent to your email'
      })
    } else {
      return res.status(500).json({
        message: 'Failed to send OTP email'
      })
    }
  } catch (error) {
    console.error('Resend OTP Error:', error)
    return res.status(500).json({
      message: 'Failed to resend OTP'
    })
  }
}
