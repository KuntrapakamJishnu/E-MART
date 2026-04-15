import mongoose from "mongoose"
import { ENV } from "./env.js"

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const connectDB = async ({ retries = 5, retryDelayMs = 5000 } = {}) => {
  if (!ENV.MONGO_URI) {
    throw new Error('Missing MONGO_URI environment variable')
  }

  let lastError = null

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(ENV.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 30000,
        maxPoolSize: 20,
        minPoolSize: 5,
        maxIdleTimeMS: 600000,
      })
      console.log('Connected to MongoDB')
      return
    } catch (error) {
      lastError = error
      console.error(`MongoDB connection failed (attempt ${attempt}/${retries}):`, error.message)
      if (attempt < retries) {
        console.log(`Retrying MongoDB connection in ${retryDelayMs / 1000}s...`)
        await sleep(retryDelayMs)
      }
    }
  }

  throw lastError
}
