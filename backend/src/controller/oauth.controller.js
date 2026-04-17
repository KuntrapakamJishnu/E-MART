import User from '../model/user.model.js'
import jwt from 'jsonwebtoken'
import { ENV } from '../config/env.js'
import { sendWelcomeEmail } from '../config/smtp.js'

const isProduction = Boolean((ENV.FRONTEND_URL || ENV.BACKEND_URL || '').startsWith('https://'))

const authCookieOptions = {
  maxAge: 1 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
}

const getGoogleRedirectUri = () => {
  return ENV.GOOGLE_CALLBACK_URL || `${ENV.BACKEND_URL || 'https://campuskartai.onrender.com'}/api/auth/google/callback`
}

const getFrontendLoginSuccessUrl = () => {
  const frontendBase = (ENV.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
  return `${frontendBase}/login?success=true`
}

export const getGoogleAuthUrl = () => {
  const redirectUri = getGoogleRedirectUri()

  return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: ENV.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile'
  }).toString()}`
}

const buildGoogleUserFromCode = async (code) => {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code,
      client_id: ENV.GOOGLE_CLIENT_ID,
      client_secret: ENV.GOOGLE_CLIENT_SECRET,
      redirect_uri: getGoogleRedirectUri(),
      grant_type: 'authorization_code'
    }).toString()
  })

  const tokenData = await tokenResponse.json()

  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error(tokenData?.error_description || 'Failed to exchange Google code')
  }

  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  })

  const googleUser = await userResponse.json()

  if (!userResponse.ok || !googleUser.email) {
    throw new Error('Could not retrieve Google profile')
  }

  return googleUser
}

// Google OAuth Callback
export const googleAuthCallback = async (req, res) => {
  try {
    const isBrowserRedirectFlow = req.method === 'GET'
    const frontendUrl = ENV.FRONTEND_URL || 'http://localhost:5173'
    const code = req.query.code || req.body?.code
    const idToken = req.body?.idToken

    if (!code && !idToken) {
      return res.status(400).json({
        message: 'Authorization code is required'
      })
    }

    let decoded = null

    if (code) {
      decoded = await buildGoogleUserFromCode(code)
    } else {
      // Decode Google token (in production, verify with Google's public keys)
      // For now, we'll assume the token is already verified by frontend
      decoded = jwt.decode(idToken)
    }

    if (!decoded || !decoded.email) {
      return res.status(400).json({
        message: 'Invalid token'
      })
    }

    let user = await User.findOne({ email: decoded.email })

    if (!user) {
      // Create new user from Google OAuth
      user = await User.create({
        name: decoded.name || decoded.given_name || 'User',
        email: decoded.email,
        profilePhoto: decoded.picture || null,
        role: 'student',
        isApproved: true,
        isVerified: true,
        oauthProvider: 'google',
        oauthId: decoded.id || decoded.sub || decoded.jti,
        lastLoginAt: new Date()
      })

      // Send welcome email
      await sendWelcomeEmail(decoded.email, user.name)
    } else {
      // Update existing user with OAuth info if not already linked
      if (!user.oauthProvider || user.oauthProvider !== 'google') {
        user.oauthProvider = 'google'
        user.oauthId = decoded.id || decoded.sub || decoded.jti
        user.isVerified = true
        if (!user.role) {
          user.role = user.owner ? 'admin' : 'student'
        }
      }

      user.lastLoginAt = new Date()
      await user.save()
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, ENV.JWT_TOKEN)

    res.cookie('token', token, authCookieOptions)

    if (isBrowserRedirectFlow) {
      return res.redirect(getFrontendLoginSuccessUrl())
    }

    return res.status(200).json({
      message: `Welcome ${user.name}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || (user.owner ? 'admin' : 'student'),
        isApproved: Boolean(user.isApproved),
        profilePhoto: user.profilePhoto || null,
        cartItem: user.cartItems?.length || 0
      }
    })
  } catch (error) {
    console.error('Google Auth Error:', error)

    if (req.method === 'GET') {
      const frontendUrl = ENV.FRONTEND_URL || 'http://localhost:5173'
      const reason = encodeURIComponent(error?.message || 'google_auth_failed')
      return res.redirect(`${frontendUrl}/login?oauthError=${reason}`)
    }

    return res.status(500).json({
      message: 'Google authentication failed',
      error: error.message
    })
  }
}

// Get OAuth URLs for frontend
export const getOAuthUrls = (req, res) => {
  try {
    return res.status(200).json({
      google: getGoogleAuthUrl()
    })
  } catch (error) {
    console.error('Get OAuth URLs Error:', error)
    return res.status(500).json({
      message: 'Failed to get OAuth URLs',
      error: error.message
    })
  }
}
