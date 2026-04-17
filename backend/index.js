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
import { googleAuthCallback } from "./src/controller/oauth.controller.js"
import cors from 'cors'

const app = express()

app.use(cors({
  origin: "https://campuskart-gamma.vercel.app", // OR your current URL
  credentials: true
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
app.use('/api/auth/oauth', oauthRoute)
app.get('/api/auth/google/callback', googleAuthCallback)

const startServer = async () => {
  try {
    await connectDB({ retries: 5, retryDelayMs: 5000 })
    app.listen(ENV.PORT, () => {
      console.log(`server started ${ENV.PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server after retries:', error)
    process.exit(1)
  }
}

startServer()

