import axios from 'axios'
import { API_BASE_URL } from './base.api'

// Send OTP
export const sendOtpApi = async ({ email, role }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/otp/send`, { email, role })
    return response.data
  } catch (error) {
    throw error
  }
}

// Verify OTP
export const verifyOtpApi = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/otp/verify`, data)
    return response.data
  } catch (error) {
    throw error
  }
}

// Resend OTP
export const resendOtpApi = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/otp/resend`, { email })
    return response.data
  } catch (error) {
    throw error
  }
}

// Get OAuth URLs
export const getOAuthUrlsApi = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/oauth/urls`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Google OAuth Callback
export const googleAuthCallbackApi = async (idToken) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/oauth/google/callback`, { idToken })
    return response.data
  } catch (error) {
    throw error
  }
}


