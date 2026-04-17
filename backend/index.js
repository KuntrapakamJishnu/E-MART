import express from "express"
import { ENV } from "./src/config/env.js"
import { connectDB } from "./src/config/db.js"
import cookieParser from "cookie-parser"
import userRoute from "./src/routes/user.route.js"
import productRoute from "./src/routes/product.route.js"
import cartRoute from "./src/routes/cart.route.js"
import paymentRoute from "./src/routes/payment.route.js"
import analyticRoute from "./src/routes/analytic.route.js"
import aiRoute from "./src/routes/ai.route.js"
import interviewReviewRoute from "./src/routes/interviewReview.route.js"
import otpRoute from "./src/routes/otp.route.js"
import oauthRoute from "./src/routes/oauth.route.js"
import cors from 'cors'

const app = express()

const getAllowedOrigins = () => {
  const frontendUrl = ENV.FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:5173'
  return [frontendUrl.replace(/\/$/, ''), 'http://localhost:3000', 'http://localhost:5173']
}

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins()

    if (!origin) {
      return callback(null, true)
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    const isVercelOrigin = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
    if (isVercelOrigin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', userRoute)
app.use('/api/product', productRoute)
app.use('/api/cart', cartRoute)
app.use('/api/payment', paymentRoute)
app.use('/api/analytic', analyticRoute)
app.use('/api/ai', aiRoute)
app.use('/api/interview-review', interviewReviewRoute)
app.use('/api/auth/otp', otpRoute)
app.use('/api/auth', oauthRoute)

const validateRequiredEnv = () => {
  const required = ['MONGO_URI', 'JWT_TOKEN', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`)
    process.exit(1)
  }
}

const startServer = async () => {
  try {
    validateRequiredEnv()
    await connectDB({ retries: 5, retryDelayMs: 5000 })
    app.listen(ENV.PORT, () => {
      console.log(`✅ Server running on port ${ENV.PORT}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server after retries:', error.message)
    process.exit(1)
  }
}

startServer()

