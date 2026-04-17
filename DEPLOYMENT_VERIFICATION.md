# Deployment Verification Checklist

## Backend Render Deployment
- [ ] Wait 2-3 minutes for auto-deploy to complete
- [ ] Check Render logs at: https://dashboard.render.com
- [ ] Look for: `✅ Server running on port 10000` (or your port)
- [ ] Verify no errors in console

## Test OAuth Flow (Production)
1. **Visit**: https://campuskart-gamma.vercel.app/login
2. **Click**: "Continue with Google" button
3. **Verify**:
   - ✅ Redirects to Google login
   - ✅ Redirects back to https://campuskart-gamma.vercel.app/login?success=true
   - ✅ Auto-navigates to home page
   - ✅ Products display
   - ✅ User data in header

## Test Manual Login
1. **Email**: test@example.com
2. **Password**: testpass123
3. **Verify**:
   - ✅ Login successful
   - ✅ Redirects to home page
   - ✅ Products visible
   - ✅ Session persists on refresh

## Test Cart Operations
1. **Add item to cart** ✅
2. **Increase/decrease quantity** ✅
3. **Remove from cart** ✅
4. **Clear cart** ✅

## Error Handling Verification
In browser DevTools (F12), Network tab:
- [ ] All API calls have status 200, 201, or proper error codes
- [ ] No 500 errors with empty responses (silent failures)
- [ ] Error responses include helpful messages
- [ ] Check console for any JavaScript errors

## Server Logs (Render)
Expected patterns:
- ✅ `✅ Server running on port...`
- ✅ `✅ DB connected` (with retries if needed)
- ❌ No `console.log` from business logic (only `console.error` for errors)
- ❌ No unhandled promise rejections

## Critical Endpoints to Test
- [ ] POST /api/login
- [ ] GET /api/getUser
- [ ] GET /api/product
- [ ] POST /api/cart/addToCart
- [ ] GET /api/auth/otp/send
- [ ] GET /api/auth/google/callback

## Success Criteria
✅ No errors on page load
✅ OAuth flow works end-to-end
✅ Manual login works
✅ Cart operations work
✅ Products load without errors
✅ Session persists across page refreshes
