import { Spinner } from '@/components/ui/spinner'
import { useLoginHook } from '@/hooks/user.hook'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import loginHoodie from '@/assets/login-hoodie.png'
import CompanyLogo from '@/assets/CompanyLogo.png'
import { useGetProfileHook } from '@/hooks/user.hook'
import { googleAuthCallbackApi } from '@/Api/auth.api'
import { API_BASE_URL, setAuthToken } from '@/Api/base.api'

const loadGoogleScript = () => new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
        resolve()
        return
    }

    const existing = document.getElementById('google-oauth-script')
    if (existing) {
        existing.addEventListener('load', () => resolve())
        existing.addEventListener('error', () => reject(new Error('Failed to load Google script')))
        return
    }

    const script = document.createElement('script')
    script.id = 'google-oauth-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google script'))
    document.head.appendChild(script)
})

const Login = () => {
    const { register, handleSubmit } = useForm()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { mutate, isPending } = useLoginHook()
    const { data: profileData } = useGetProfileHook()

    const loginHandler = (data) => {
        mutate(data)
    }

    const startGoogleLogin = async () => {
        const oauthEntry = `${API_BASE_URL}/auth/google`

        try {
            await loadGoogleScript()

            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
            if (!clientId || !window.google?.accounts?.oauth2) {
                window.location.href = oauthEntry
                return
            }

            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'openid email profile',
                callback: async (tokenResponse) => {
                    try {
                        if (!tokenResponse?.access_token) {
                            throw new Error('Google access token missing')
                        }

                        const oauthResponse = await googleAuthCallbackApi({ accessToken: tokenResponse.access_token })
                        setAuthToken(oauthResponse?.token)
                        toast.success('Google login successful')
                        navigate('/', { replace: true })
                    } catch (error) {
                        console.error('Google popup auth failed:', error)
                        toast.error(error?.response?.data?.message || 'Google login failed')
                        window.location.href = oauthEntry
                    }
                }
            })

            tokenClient.requestAccessToken()
        } catch (error) {
            console.error('OAuth popup setup failed:', error)
            window.location.href = oauthEntry
        }
    }

    useEffect(() => {
        const oauthSuccess = searchParams.get('success')
        const oauthError = searchParams.get('oauthError')
        const hasOAuthParams = Boolean(oauthSuccess || oauthError)

        if (hasOAuthParams) {
            window.history.replaceState({}, document.title, window.location.pathname)
        }

        if (oauthSuccess === 'true') {
            toast.success('Google login successful. Loading your session...')
            navigate('/', { replace: true })
        }

        if (oauthError) {
            toast.error(decodeURIComponent(oauthError))
        }
    }, [navigate, searchParams])

    useEffect(() => {
        if (profileData) {
            navigate('/', { replace: true })
        }
    }, [navigate, profileData])

    return (
        <div className='relative min-h-screen overflow-hidden bg-[#040712] text-white'>
            <div className='absolute inset-0 bg-no-repeat md:hidden' />

            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_32%),linear-gradient(170deg,_rgba(3,7,18,0.62),_rgba(10,20,36,0.76))]' />
            <div className='pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:32px_32px]' />
            <div className='pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-amber-400/12 blur-3xl' />
            <div className='pointer-events-none absolute right-0 bottom-20 h-80 w-80 rounded-full bg-blue-400/14 blur-3xl' />

            <div className='relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-6 sm:py-10'>
                <div className='w-full max-w-6xl lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-10'>
                    <div className='mb-8 hidden lg:block'>
                        <div className='relative overflow-hidden rounded-[34px] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_30px_90px_rgba(2,6,23,0.5)] backdrop-blur-xl'>
                            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(56,189,248,0.16),transparent_46%),radial-gradient(circle_at_55%_78%,rgba(245,158,11,0.14),transparent_44%)]' />
                            <div className='pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/25 to-transparent' />
                            <img
                                src={loginHoodie}
                                alt='Login illustration'
                                className='relative mx-auto h-[72vh] max-h-[760px] w-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.45)]'
                            />
                        </div>
                    </div>

                    <div className='w-full max-w-lg justify-self-center'>
                    <div className='mb-8 flex justify-center'>
                        <div className='h-24 w-24 overflow-hidden rounded-[30px] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.42)] ring-1 ring-white/25 sm:h-28 sm:w-28 md:h-32 md:w-32'>
                            <img src={CompanyLogo} alt='Company logo' className='h-full w-full object-cover' />
                        </div>
                    </div>

                    <div>
                        <div className='relative overflow-hidden rounded-[36px] border border-white/15 bg-[linear-gradient(160deg,rgba(255,255,255,0.18),rgba(255,255,255,0.05))] p-1 shadow-[0_35px_95px_rgba(2,6,23,0.58)] animate-zoom-soft'>
                            <div className='pointer-events-none absolute -inset-[2px] rounded-[38px] bg-[conic-gradient(from_0deg,rgba(245,158,11,0.45),rgba(59,130,246,0.32),rgba(249,115,22,0.35),rgba(245,158,11,0.45))] opacity-60 blur-md' />
                            <div className='relative overflow-hidden rounded-[34px] border border-white/15 bg-slate-950/70 p-6 backdrop-blur-2xl sm:p-8'>
                                <div className='mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100/85'>
                                    <Sparkles className='h-3.5 w-3.5' />
                                    Trusted Campus Commerce
                                </div>
                                <div className='mb-6 flex items-start justify-between gap-4'>
                                    <div>
                                        <p className='text-xs uppercase tracking-[0.34em] text-white/45'>Welcome back</p>
                                        <h2 className='mt-2 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl'>Login</h2>
                                        <p className='mt-2 max-w-md text-sm leading-6 text-white/72'>Access your account to manage orders, discover products, and continue your marketplace journey.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit(loginHandler)} className='space-y-5'>
                                    <div className='space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5'>
                                        <div>
                                            <label className='mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/45'>Email</label>
                                            <input
                                                type='email'
                                                placeholder='you@example.com'
                                                className='h-12 w-full rounded-xl border border-white/25 bg-slate-900/45 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-sky-300/85 focus:bg-slate-900/70 focus:ring-2 focus:ring-sky-500/35'
                                                {...register('email')}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className='mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/45'>Password</label>
                                            <input
                                                type='password'
                                                placeholder='••••••••'
                                                className='h-12 w-full rounded-xl border border-white/25 bg-slate-900/45 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-sky-300/85 focus:bg-slate-900/70 focus:ring-2 focus:ring-sky-500/35'
                                                {...register('password')}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type='submit'
                                        disabled={isPending}
                                        className='mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-blue-500 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_18px_44px_rgba(245,158,11,0.35)] disabled:cursor-not-allowed disabled:opacity-70'
                                    >
                                        {isPending ? <Spinner /> : <>
                                            Login
                                            <ArrowRight className='h-4 w-4' />
                                        </>}
                                    </button>

                                    <div className='flex items-center gap-3 pt-1'>
                                        <div className='h-px flex-1 bg-white/10' />
                                        <span className='text-[11px] font-medium uppercase tracking-[0.2em] text-white/45'>Or continue with Google</span>
                                        <div className='h-px flex-1 bg-white/10' />
                                    </div>

                                    <button
                                        type='button'
                                        onClick={startGoogleLogin}
                                        disabled={false}
                                        className='inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/60 bg-white px-4 text-sm font-semibold text-slate-900 shadow-[0_8px_24px_rgba(255,255,255,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:shadow-[0_12px_32px_rgba(255,255,255,0.24)] disabled:cursor-not-allowed disabled:opacity-70'
                                    >
                                        <svg viewBox='0 0 24 24' aria-hidden='true' className='h-5 w-5 shrink-0'>
                                            <path fill='#EA4335' d='M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5A9.5 9.5 0 0 0 2.5 12 9.5 9.5 0 0 0 12 21.5c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6z' />
                                            <path fill='#34A853' d='M3.6 7.9 6.8 10.2C7.7 8.1 9.6 6.7 12 6.7c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5c-3.7 0-6.9 2.1-8.4 5.4z' />
                                            <path fill='#4A90E2' d='M12 21.5c2.5 0 4.6-.8 6.1-2.1l-2.8-2.3c-.8.5-1.8.8-3.3.8-3.9 0-5.3-2.6-5.6-3.9L3.2 16.4A9.5 9.5 0 0 0 12 21.5z' />
                                            <path fill='#FBBC05' d='M3.2 16.4A9.4 9.4 0 0 1 2.5 12c0-1.5.4-2.9 1.1-4.1l3.2 2.3A5.7 5.7 0 0 0 6 12c0 .6.1 1.2.4 1.8z' />
                                        </svg>
                                        Continue with Google
                                    </button>

                                    <div className='flex items-center gap-3 pt-2'>
                                        <div className='h-px flex-1 bg-white/10' />
                                        <span className='text-xs text-white/50'>Secure Access</span>
                                        <div className='h-px flex-1 bg-white/10' />
                                    </div>

                                    <div className='grid gap-3 sm:grid-cols-2'>
                                        <div className='rounded-2xl border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-sm'>
                                            <p className='text-xs uppercase tracking-[0.28em] text-white/45'>Need an account?</p>
                                            <Link to='/register' className='mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200'>
                                                Sign up for free <ArrowRight className='h-4 w-4' />
                                            </Link>
                                        </div>
                                        <div className='rounded-2xl border border-sky-300/20 bg-[linear-gradient(145deg,rgba(14,165,233,0.2),rgba(2,132,199,0.08))] px-4 py-4 backdrop-blur-sm'>
                                            <div className='flex items-center gap-2'>
                                                <ShieldCheck className='h-4 w-4 text-sky-300' />
                                                <span className='text-xs font-semibold uppercase tracking-[0.28em] text-white/55'>Secure & encrypted</span>
                                            </div>
                                            <p className='mt-2 text-xs leading-5 text-white/55'>Protected sessions, trusted access, and role-aware account routing.</p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login