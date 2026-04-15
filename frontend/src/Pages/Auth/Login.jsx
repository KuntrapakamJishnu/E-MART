import { Spinner } from '@/components/ui/spinner'
import { useLoginHook } from '@/hooks/user.hook'
import { getOAuthUrlsApi } from '@/Api/auth.api'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { ShieldCheck, ArrowRight, Globe } from 'lucide-react'
import { toast } from 'sonner'
import loginHoodie from '@/assets/login-hoodie.png'
import CompanyLogo from '@/assets/CompanyLogo.png'

const Login = () => {
    const { register, handleSubmit } = useForm()
    const [searchParams] = useSearchParams()
    const { mutate, isPending } = useLoginHook()

    const loginHandler = (data) => {
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
                className='absolute inset-0 bg-no-repeat md:hidden'
                style={{
                    backgroundImage: `url(${loginHoodie})`,
                    backgroundSize: 'auto 90vh',
                    backgroundPosition: 'center 56%'
                }}
            />

            <div className='pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] md:block'>
                <div
                    className='absolute inset-0 bg-no-repeat'
                    style={{
                        backgroundImage: `url(${loginHoodie})`,
                        backgroundSize: 'auto 92vh',
                        backgroundPosition: 'center 60%'
                    }}
                />
                <div className='absolute inset-0 bg-[linear-gradient(90deg,rgba(4,7,18,0.92)_0%,rgba(4,7,18,0.35)_24%,rgba(4,7,18,0.22)_100%)]' />
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_78%_35%,rgba(56,189,248,0.16),transparent_46%),radial-gradient(circle_at_65%_80%,rgba(245,158,11,0.14),transparent_44%)]' />
                <div className='absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent' />
            </div>

            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_32%),linear-gradient(170deg,_rgba(3,7,18,0.62),_rgba(10,20,36,0.76))]' />
            <div className='pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:32px_32px]' />
            <div className='pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-amber-400/12 blur-3xl' />
            <div className='pointer-events-none absolute right-0 bottom-20 h-80 w-80 rounded-full bg-blue-400/14 blur-3xl' />

            <div className='relative flex min-h-screen items-center justify-center px-6 py-10'>
                <div className='w-full max-w-md'>
                    <div className='mb-8 flex justify-center'>
                        <div className='h-24 w-24 overflow-hidden rounded-[30px] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.42)] ring-1 ring-white/25 sm:h-28 sm:w-28 md:h-32 md:w-32'>
                            <img src={CompanyLogo} alt='Company logo' className='h-full w-full object-cover' />
                        </div>
                    </div>

                    <div>
                        <div className='relative overflow-hidden rounded-[36px] border border-white/15 bg-[linear-gradient(160deg,rgba(255,255,255,0.18),rgba(255,255,255,0.05))] p-1 shadow-[0_35px_95px_rgba(2,6,23,0.58)] animate-zoom-soft'>
                            <div className='pointer-events-none absolute -inset-[2px] rounded-[38px] bg-[conic-gradient(from_0deg,rgba(245,158,11,0.45),rgba(59,130,246,0.32),rgba(249,115,22,0.35),rgba(245,158,11,0.45))] opacity-60 blur-md' />
                            <div className='relative overflow-hidden rounded-[34px] border border-white/15 bg-slate-950/70 p-8 backdrop-blur-2xl sm:p-10'>
                                <div className='mb-6 flex items-start justify-between gap-4'>
                                    <div>
                                        <p className='text-xs uppercase tracking-[0.34em] text-white/45'>Welcome back</p>
                                        <h2 className='mt-2 text-3xl font-black tracking-[-0.05em] text-white'>Login</h2>
                                        <p className='mt-2 text-sm text-white/72'>Pick up where you left off and continue shopping.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit(loginHandler)} className='space-y-4'>
                                    <div className='space-y-4'>
                                        <div>
                                            <label className='mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/45'>Email</label>
                                            <input
                                                type='email'
                                                placeholder='you@example.com'
                                                className='h-12 w-full rounded-xl border border-white/25 bg-slate-900/35 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-sky-300/85 focus:bg-slate-900/50 focus:ring-2 focus:ring-sky-500/35'
                                                {...register('email')}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className='mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/45'>Password</label>
                                            <input
                                                type='password'
                                                placeholder='••••••••'
                                                className='h-12 w-full rounded-xl border border-white/25 bg-slate-900/35 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-sky-300/85 focus:bg-slate-900/50 focus:ring-2 focus:ring-sky-500/35'
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
                                            Continue
                                            <ArrowRight className='h-4 w-4' />
                                        </>}
                                    </button>

                                    <div className='flex items-center gap-3 pt-2'>
                                        <div className='h-px flex-1 bg-white/10' />
                                        <span className='text-xs text-white/50'>OR</span>
                                        <div className='h-px flex-1 bg-white/10' />
                                    </div>

                                    <button
                                        type='button'
                                        onClick={async () => {
                                            try {
                                                const oauthData = await getOAuthUrlsApi()
                                                const authUrl = oauthData?.google

                                                if (!authUrl) {
                                                    alert('Google OAuth not configured. Please contact support.')
                                                    return
                                                }

                                                window.location.href = authUrl
                                            } catch (error) {
                                                console.error('OAuth error:', error)
                                                alert('Failed to initiate Google login')
                                            }
                                        }}
                                        disabled={false}
                                        className='inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/6 text-sm font-semibold text-white transition-all duration-300 hover:border-sky-200/60 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70'
                                    >
                                        <Globe className='h-4 w-4' />
                                        Continue with Google
                                    </button>

                                    <div className='grid gap-3 sm:grid-cols-2'>
                                        <div className='rounded-2xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-sm'>
                                            <p className='text-xs uppercase tracking-[0.28em] text-white/45'>Need an account?</p>
                                            <Link to='/register' className='mt-2 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200'>
                                                Sign up for free <ArrowRight className='h-4 w-4' />
                                            </Link>
                                        </div>
                                        <div className='rounded-2xl border border-sky-300/20 bg-sky-500/10 px-4 py-3 backdrop-blur-sm'>
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
    )
}

export default Login