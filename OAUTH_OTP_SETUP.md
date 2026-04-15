# OAuth & Email OTP Setup Guide

Complete guide to set up OAuth Authentication and Email OTP SMTP services for your e-commerce platform.

---

## 📧 Email OTP SMTP Setup (Gmail)

### 1. Generate Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App passwords**
4. Select "Mail" and "Windows Computer"
5. Google will generate a 16-character password
6. Copy this password

### 2. Add to .env file

```env
SMTP_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_character_app_password
```

### 3. Email OTP Flow

**Frontend to Backend:**
- User enters email → Send OTP
- User receives OTP → Enter OTP + Name + Password
- Verify OTP → Create account

**API Endpoints:**
```
POST /api/auth/otp/send
body: { email }

POST /api/auth/otp/verify
body: { email, otp, name, password }

POST /api/auth/otp/resend
body: { email }
```

---

## 🔐 Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add Authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - `http://localhost:5000` (backend)
7. Add Authorized redirect URIs:
   - `http://localhost:5173/auth/google/callback`
   - `http://localhost:5000/api/auth/oauth/google/callback`
8. Copy **Client ID** and **Client Secret**

### 2. Add to .env file

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

### 3. Frontend Integration

```jsx
import { useGoogleAuthHook } from '@/hooks/auth.hook'

const { mutate: googleLogin } = useGoogleAuthHook()

// Handle Google OAuth callback
const handleGoogleSuccess = (credentialResponse) => {
  googleLogin({ idToken: credentialResponse.credential })
}
```

**API Endpoint:**
```
POST /api/auth/oauth/google/callback
body: { idToken }
```

---

## 🐙 GitHub OAuth Setup

### 1. Create GitHub OAuth App

1. Go to GitHub Settings → [Developer settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: VIT Campus space
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/oauth/github/callback`
4. Copy **Client ID** and **Client Secret**

### 2. Add to .env file

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 3. Frontend Integration

```jsx
import { useGithubAuthHook } from '@/hooks/auth.hook'

const { mutate: githubLogin } = useGithubAuthHook()

// Handle GitHub OAuth callback
const handleGithubCallback = (code) => {
  githubLogin({ code })
}
```

**API Endpoint:**
```
POST /api/auth/oauth/github/callback
body: { code }
```

---

## 📱 Frontend Implementation

### 1. OTP Registration Flow

Create a new registration page with OTP:

```jsx
import { useSendOtpHook, useVerifyOtpHook } from '@/hooks/auth.hook'
import { useState } from 'react'

const OTPRegister = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1) // 1: enter email, 2: verify otp

  const { mutate: sendOtp, isPending: sendingOtp } = useSendOtpHook()
  const { mutate: verifyOtp, isPending: verifyingOtp } = useVerifyOtpHook()

  const handleSendOtp = (e) => {
    e.preventDefault()
    sendOtp(email, {
      onSuccess: () => setStep(2)
    })
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    verifyOtp({ email, otp, name: 'User', password: 'password' })
  }

  return (
    <div>
      {step === 1 ? (
        <form onSubmit={handleSendOtp}>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <button type="submit" disabled={sendingOtp}>
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <input 
            type="text" 
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            maxLength="6"
          />
          <button type="submit" disabled={verifyingOtp}>
            Verify & Register
          </button>
        </form>
      )}
    </div>
  )
}
```

### 2. OAuth Buttons

```jsx
import { useGoogleAuthHook, useGithubAuthHook } from '@/hooks/auth.hook'
import { Google, Github } from 'lucide-react'

const OAuthButtons = () => {
  const { mutate: googleLogin } = useGoogleAuthHook()
  const { mutate: githubLogin } = useGithubAuthHook()

  // Google OAuth (requires @react-oauth/google library)
  const handleGoogleLogin = async (credentialResponse) => {
    googleLogin({ idToken: credentialResponse.credential })
  }

  // GitHub OAuth
  const handleGithubLogin = async () => {
    // Redirect to GitHub auth URL
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&redirect_uri=${window.location.origin}/auth/github/callback`
  }

  return (
    <div className="flex gap-2">
      <button onClick={handleGoogleLogin} className="flex items-center gap-2">
        <Google className="w-5 h-5" />
        Google
      </button>
      <button onClick={handleGithubLogin} className="flex items-center gap-2">
        <Github className="w-5 h-5" />
        GitHub
      </button>
    </div>
  )
}
```

---

## 🔄 Backend User Model

The User model has been updated with:

```javascript
{
  // Existing fields...
  
  // OTP Fields
  otpCode: String,              // 6-digit OTP
  otpExpiry: Date,              // OTP expiration time (10 minutes)
  isVerified: Boolean,          // Email verification status
  
  // OAuth Fields
  oauthProvider: String,        // 'google' or 'github'
  oauthId: String               // Provider's user ID
}
```

---

## 🧪 Testing with cURL

### Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456",
    "name": "John Doe",
    "password": "password123"
  }'
```

### Get OAuth URLs
```bash
curl http://localhost:5000/api/auth/oauth/urls
```

---

## 🚀 Production Deployment

### 1. Update Environment Variables

Replace localhost URLs with your production domain:

```env
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

GOOGLE_CLIENT_ID=production_client_id
GOOGLE_CLIENT_SECRET=production_client_secret

GITHUB_CLIENT_ID=production_github_id
GITHUB_CLIENT_SECRET=production_github_secret

SMTP_USER=your_production_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### 2. Update OAuth Redirect URIs

**Google:**
- `https://yourdomain.com`
- `https://api.yourdomain.com/api/auth/oauth/google/callback`

**GitHub:**
- `https://yourdomain.com/auth/github/callback`
- `https://api.yourdomain.com/api/auth/oauth/github/callback`

### 3. Enable Cookie Secure Flag

In production, update `src/config/smtp.js`:
```javascript
const authCookieOptions = {
  secure: true,  // HTTPS only
  sameSite: 'strict'
}
```

---

## 📦 Package Dependencies

Already installed:
- `nodemailer` - Email sending
- `jsonwebtoken` - JWT tokens
- `mongoose` - Database

For frontend OAuth (optional):
```bash
npm install @react-oauth/google
```

---

## 🐛 Troubleshooting

### Gmail App Password Not Working
- ✅ Ensure 2-Step Verification is enabled
- ✅ Use the 16-character app password (without spaces)
- ✅ Restart backend after updating credentials

### Google OAuth Redirect URI Mismatch
- ✅ Ensure redirect URI exactly matches in Google Console
- ✅ Include protocol (http/https)
- ✅ Check for trailing slashes

### OTP Not Being Sent
- ✅ Check SMTP_USER and SMTP_PASSWORD
- ✅ Verify email is valid
- ✅ Check server logs for errors

### OAuth User Not Created
- ✅ Ensure oauthProvider and oauthId are saved
- ✅ Check MongoDB connection
- ✅ Verify provider returns email

---

## 📚 Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Nodemailer Documentation](https://nodemailer.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## ✅ Checklist

- [ ] Gmail App Password generated and added to .env
- [ ] Google OAuth credentials created and configured
- [ ] GitHub OAuth credentials created and configured
- [ ] Backend routes mounted in index.js
- [ ] User model updated with OTP/OAuth fields
- [ ] Frontend hooks and APIs created
- [ ] SMTP service tested
- [ ] OAuth flows tested locally
- [ ] Production URLs configured
- [ ] Security settings enabled for production
