import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sendOtpApi, verifyOtpApi, resendOtpApi, getOAuthUrlsApi, googleAuthCallbackApi } from '@/Api/auth.api'

// ============ OTP Hooks ============

export const useSendOtpHook = () => {
  return useMutation({
    mutationFn: sendOtpApi,
    onSuccess: (data) => {
      toast.success(data?.message || 'OTP sent to your email')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to send OTP')
    }
  })
}

export const useVerifyOtpHook = () => {
  return useMutation({
    mutationFn: verifyOtpApi,
    onSuccess: (data) => {
      toast.success(data?.message || 'Account verified')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'OTP verification failed')
    }
  })
}

export const useResendOtpHook = () => {
  return useMutation({
    mutationFn: resendOtpApi,
    onSuccess: (data) => {
      toast.success(data?.message || 'New OTP sent')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP')
    }
  })
}

// ============ OAuth Hooks ============

export const useGetOAuthUrlsHook = () => {
  return useQuery({
    queryKey: ['oauthUrls'],
    queryFn: getOAuthUrlsApi
  })
}

export const useGoogleAuthHook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: googleAuthCallbackApi,
    onSuccess: (data) => {
      toast.success(data?.message || 'Google login successful')
      queryClient.invalidateQueries({ queryKey: ['getUser'] })
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Google login failed')
    }
  })
}


