import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useGetProfileHook } from '@/hooks/user.hook'

const OAuthCallback = () => {
  const navigate = useNavigate()
  const attemptsRef = useRef(0)
  const { data, isLoading, isError, refetch } = useGetProfileHook()

  useEffect(() => {
    if (data) {
      toast.success('Google login successful')
      navigate('/', { replace: true })
      return
    }

    if (isError) {
      if (attemptsRef.current < 5) {
        attemptsRef.current += 1
        const timer = setTimeout(() => {
          refetch()
        }, 800)

        return () => clearTimeout(timer)
      }

      toast.error('Google login completed, but session could not be restored.')
      navigate('/login', { replace: true })
    }
  }, [data, isError, navigate, refetch])

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white'>
      <div className='rounded-3xl border border-white/15 bg-white/5 px-6 py-5 text-center shadow-2xl backdrop-blur-xl'>
        <p className='text-xs uppercase tracking-[0.3em] text-white/55'>Signing you in</p>
        <div className='mx-auto mt-4 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-cyan-300' />
        <p className='mt-4 text-sm text-white/75'>Finalizing your Google session...</p>
        {isLoading ? null : <p className='mt-2 text-xs text-white/50'>Please wait a moment.</p>}
      </div>
    </div>
  )
}

export default OAuthCallback