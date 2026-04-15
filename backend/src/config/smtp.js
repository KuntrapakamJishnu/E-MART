import nodemailer from 'nodemailer'
import { ENV } from './env.js'

// Initialize SMTP transporter
const hasSmtpCredentials = Boolean(ENV.SMTP_USER && (ENV.SMTP_PASSWORD || ENV.SMTP_PASS))

const transporter = hasSmtpCredentials
  ? nodemailer.createTransport({
      host: ENV.SMTP_HOST || 'smtp.gmail.com',
      port: Number(ENV.SMTP_PORT || 587),
      secure: Number(ENV.SMTP_PORT || 587) === 465,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASSWORD || ENV.SMTP_PASS
      }
    })
  : null

// Verify transporter connection
if (transporter) {
  transporter.verify((error) => {
    if (error) {
      console.error('SMTP Connection Error:', error)
    } else {
      console.log('✓ SMTP Service Ready')
    }
  })
} else {
  console.warn('SMTP is not configured. OTP and welcome emails will be skipped until credentials are added.')
}

export const sendOtpEmail = async (email, otp) => {
  try {
    if (!transporter) {
      return { success: false, error: 'SMTP is not configured' }
    }

    const mailOptions = {
      from: ENV.MAIL_FROM || ENV.SMTP_USER,
      to: email,
      subject: 'Your VIT Campus space OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">VIT Campus space</h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">OTP Verification</p>
          </div>
          
          <div style="padding: 40px 20px; background: #f5f5f5; text-align: center;">
            <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">Your OTP for authentication is:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 8px;">${otp}</h2>
            </div>
            <p style="color: #888; font-size: 14px; margin: 20px 0 0 0;">This OTP will expire in 10 minutes</p>
          </div>
          
          <div style="padding: 20px; background: #f5f5f5; border-top: 1px solid #ddd; border-radius: 0 0 10px 10px; color: #888; font-size: 12px; text-align: center;">
            <p style="margin: 0;">Do not share this code with anyone. We will never ask for your OTP.</p>
            <p style="margin: 8px 0 0 0;">© 2026 VIT Campus space. All rights reserved.</p>
          </div>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✓ OTP Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('✗ Failed to send OTP email:', error)
    return { success: false, error: error.message }
  }
}

export const sendWelcomeEmail = async (email, name) => {
  try {
    if (!transporter) {
      return { success: false, error: 'SMTP is not configured' }
    }

    const mailOptions = {
      from: ENV.MAIL_FROM || ENV.SMTP_USER,
      to: email,
      subject: 'Welcome to VIT Campus space',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Welcome ${name}!</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #f5f5f5;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Thank you for joining <strong>VIT Campus space</strong>. Your account has been successfully created.
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 20px;">
              You can now start shopping from our premium collection of products curated for students.
            </p>
            
            <a href="${ENV.FRONTEND_URL || 'http://localhost:5173'}/product" style="display: inline-block; margin-top: 20px; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Start Shopping
            </a>
          </div>
          
          <div style="padding: 20px; background: #f5f5f5; border-top: 1px solid #ddd; border-radius: 0 0 10px 10px; color: #888; font-size: 12px; text-align: center;">
            <p style="margin: 0;">© 2026 VIT Campus space. All rights reserved.</p>
          </div>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✓ Welcome email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('✗ Failed to send welcome email:', error)
    return { success: false, error: error.message }
  }
}

export default transporter
