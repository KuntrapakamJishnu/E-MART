import { Spinner } from '@/components/ui/spinner'
import { useLoginHook } from '@/hooks/user.hook'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { ShieldCheck, Sparkles, ArrowRight, Globe } from 'lucide-react'
import { toast } from 'sonner'
import loginHoodie from '@/assets/login-hoodie.png'

const Login = () => {
    const { register, handleSubmit} = useForm()
    const [searchParams] = useSearchParams()
    
    const {mutate, isPending} =useLoginHook()
    
    const loginHandler=(data)=>{
        mutate(data)
    }

    useEffect(() => {
        const oauthError = searchParams.get('oauthError')
        if (oauthError) {
            toast.error(decodeURIComponent(oauthError))
        }
    }, [searchParams])
  return (
        <div className='relative min-h-screen overflow-hidden bg-[#040712] text-white'>
            <div
                className='absolute inset-0 bg-no-repeat'
                style={{
                    backgroundImage: `url(${loginHoodie})`,
                    backgroundSize: 'auto 94vh',
                    backgroundPosition: 'right 58%'
                }}
            />
            
            {/* Gradient Overlays */}
                        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_32%),linear-gradient(170deg,_rgba(3,7,18,0.56),_rgba(10,20,36,0.7))]' />
                        <div className='pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-amber-400/12 blur-3xl' />
                        <div className='pointer-events-none absolute right-0 bottom-20 h-80 w-80 rounded-full bg-blue-400/14 blur-3xl' />

            {/* Centered Login Container */}
            <div className='relative flex min-h-screen items-center justify-center px-6 py-10'>
                <div className='w-full max-w-md'>
                    
                    {/* Logo & Branding */}
                    <div className='mb-8 text-center'>
                        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-blue-500 shadow-[0_10px_40px_rgba(245,158,11,0.35)]'>
                            <Sparkles className='h-8 w-8 text-white' />
                        </div>
                        <h1 className='bg-gradient-to-r from-white via-amber-100 to-blue-100 bg-clip-text text-3xl font-black tracking-[-0.05em] text-transparent'>VIT Campus space</h1>
                        <p className='mt-2 text-sm text-white/70'>Your premium student marketplace</p>
                    </div>

                    {/* Login Form Card */}
                    <div className='relative rounded-[30px] p-[1px]'>
                        <div className='pointer-events-none absolute -inset-[2px] rounded-[32px] bg-[conic-gradient(from_0deg,rgba(245,158,11,0.4),rgba(59,130,246,0.34),rgba(249,115,22,0.32),rgba(245,158,11,0.4))] opacity-55 blur-md' />
                    <form onSubmit={handleSubmit(loginHandler)} className='relative glass-panel rounded-[28px] border border-white/20 bg-[linear-gradient(150deg,rgba(255,255,255,0.18),rgba(255,255,255,0.06))] p-8 shadow-[0_35px_95px_rgba(2,6,23,0.58)] backdrop-blur-2xl sm:p-10'>
                        
                        {/* Form Header */}
                        <div className='mb-6'>
                            <h2 className='text-2xl font-black tracking-[-0.04em] text-white'>Login</h2>
                            <p className='mt-2 text-sm text-white/75'>Sign in to your account and continue shopping</p>
                        </div>

                        {/* Form Fields */}
                        <div className='space-y-4'>
                            <div>
                                <label className='mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/45'>Email</label>
                                <input
                                    type='email'
                                    placeholder='you@example.com'
                                    className='h-12 w-full rounded-xl border border-white/25 bg-slate-900/30 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-sky-300/85 focus:bg-slate-900/45 focus:ring-2 focus:ring-sky-500/35'
                                    {...register('email')}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className='mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/45'>Password</label>
                                <input
                                    type='password'
                                    placeholder='••••••••'
                                    className='h-12 w-full rounded-xl border border-white/25 bg-slate-900/30 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-sky-300/85 focus:bg-slate-900/45 focus:ring-2 focus:ring-sky-500/35'
                                    {...register('password')}
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type='submit'
                            disabled={isPending}
                            className='mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-blue-500 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_18px_44px_rgba(245,158,11,0.35)] disabled:cursor-not-allowed disabled:opacity-70'
                        >
                            {isPending ? <Spinner /> : <>
                                Continue
                                <ArrowRight className='h-4 w-4' />
                            </>}
                        </button>

                        {/* Divider */}
                        <div className='mt-6 flex items-center gap-3'>
                            <div className='flex-1 h-px bg-white/10' />
                            <span className='text-xs text-white/50'>OR</span>
                            <div className='flex-1 h-px bg-white/10' />
                        </div>

                        {/* Google OAuth Button */}
                        <button
                            type='button'
                            onClick={() => {
                                try {
                                    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
                                    const callbackUrl = import.meta.env.VITE_GOOGLE_CALLBACK_URL
                                    
                                    if (!clientId || !callbackUrl) {
                                        alert('Google OAuth not configured. Please contact support.')
                                        return
                                    }

                                    const redirectUri = callbackUrl
                                    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`
                                    window.location.href = authUrl
                                } catch (error) {
                                    console.error('OAuth error:', error)
                                    alert('Failed to initiate Google login')
                                }
                            }}
                            disabled={false}
                            className='mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-slate-900/35 text-sm font-semibold text-white transition-all duration-300 hover:bg-slate-900/55 hover:border-sky-200/60 disabled:cursor-not-allowed disabled:opacity-70'
                        >
                            <>
                                <Globe className='h-4 w-4' />
                                Continue with Google
                            </>
                        </button>

                        {/* Sign Up Link */}
                        <p className='mt-6 text-center text-sm text-white/70'>
                            No account yet?{' '}
                            <Link to='/register' className='font-semibold text-cyan-300 transition hover:text-cyan-200'>
                                Sign up for free
                            </Link>
                        </p>

                        {/* Security Badge */}
                        <div className='mt-6 flex items-center justify-center gap-2 rounded-full border border-sky-300/20 bg-sky-500/10 px-4 py-2 backdrop-blur-sm'>
                            <ShieldCheck className='h-4 w-4 text-sky-300' />
                            <span className='text-xs text-white/60'>Secure & Encrypted</span>
                        </div>
                    </form>
                    </div>
                </div>
            </div>
    </div>
  )
}

export default Login;