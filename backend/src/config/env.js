import {configDotenv} from "dotenv";

configDotenv({quiet: true});

export const ENV = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_TOKEN: process.env.JWT_TOKEN,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    CLOUD_NAME: process.env.CLOUD_NAME,
    API_KEY: process.env.API_KEY,
    API_SECRET: process.env.API_SECRET,
    RAZORPAY_KEY_ID:process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET:process.env.RAZORPAY_KEY_SECRET,
    GEMINI_API_KEY:process.env.GEMINI_API_KEY,
    CLIENT_URL:process.env.CLIENT_URL,
    BACKEND_URL: process.env.BACKEND_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SERVICE: process.env.SMTP_SERVICE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
    MAIL_FROM: process.env.MAIL_FROM,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    UPSTASH_REDIS_REST_URL:process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN:process.env.UPSTASH_REDIS_REST_TOKEN
}