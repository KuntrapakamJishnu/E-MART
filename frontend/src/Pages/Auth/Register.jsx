import { useSendOtpHook, useVerifyOtpHook, useResendOtpHook } from '@/hooks/auth.hook'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, ArrowRight, RotateCw, CheckCircle2, Sparkles } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import CompanyLogo from '@/assets/CompanyLogo.png'

const Register = () => {
    const navigate = useNavigate()
    const { register, handleSubmit } = useForm()
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState(null)
    const [resendTimer, setResendTimer] = useState(0)

    const { mutate: sendOtp, isPending: sendOtpPending } = useSendOtpHook()
    const { mutate: verifyOtp, isPending: verifyOtpPending } = useVerifyOtpHook()
    const { mutate: resendOtp, isPending: resendOtpPending } = useResendOtpHook()

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [resendTimer])

    const handleSendOtp = (data) => {
        setFormData(data)
        sendOtp({ email: data.email, role: data.role }, {
            onSuccess: () => {
                setStep(2)
                setResendTimer(60)
            }
        })
    }

    const handleVerifyOtp = (data) => {
        if (!formData) return

        verifyOtp({
            email: formData.email,
            otp: data.otp,
            name: formData.name,
            password: formData.password,
            role: formData.role
        }, {
            onSuccess: () => {
                setStep(1)
                setFormData(null)
                navigate('/login')
            }
        })
    }

    const handleResendOtp = () => {
        if (!formData) return
        resendOtp(formData.email, {
            onSuccess: () => {
                setResendTimer(60)
            }
        })
    }

    const activeSubmit = step === 1 ? handleSendOtp : handleVerifyOtp

    return (
        <div className='relative min-h-screen overflow-hidden bg-[#0a0820] text-white'>
            <div
                className='absolute inset-0 bg-no-repeat'
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1542272604-787c62d465d1?w=1600&q=80')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.16),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(170deg,_rgba(7,12,28,0.35),_rgba(8,22,38,0.45))]' />
            <div className='pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-teal-400/12 blur-3xl' />
            <div className='pointer-events-none absolute right-0 bottom-20 h-80 w-80 rounded-full bg-cyan-400/13 blur-3xl' />
            <div className='pointer-events-none absolute right-1/3 top-0 h-52 w-52 rounded-full bg-blue-400/10 blur-3xl' />

            <div className='relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-6 sm:py-10'>
                <div className='w-full max-w-lg'>
                    <div className='mb-8 flex justify-center'>
                        <div className='h-24 w-24 overflow-hidden rounded-[30px] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.42)] ring-1 ring-white/25 sm:h-28 sm:w-28 md:h-32 md:w-32'>
                            <img src={CompanyLogo} alt='Company logo' className='h-full w-full object-cover' />
                        </div>
                    </div>

                    <div>
                        <div className='relative overflow-hidden rounded-[34px] border border-white/15 bg-slate-950/72 p-1 shadow-[0_35px_95px_rgba(2,6,23,0.58)] animate-zoom-soft'>
                            <div className='pointer-events-none absolute -inset-[2px] rounded-[36px] bg-[conic-gradient(from_0deg,rgba(20,184,166,0.4),rgba(14,165,233,0.34),rgba(59,130,246,0.32),rgba(20,184,166,0.4))] opacity-60 blur-md' />
                            <div className='relative overflow-hidden rounded-[32px] border border-white/15 bg-[linear-gradient(160deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05))] p-6 backdrop-blur-2xl sm:p-8'>
                                <div className='mb-5 inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-100/85'>
                                    <Sparkles className='h-3.5 w-3.5' />
                                    Quick OTP Registration
                                </div>
                                <div className='mb-6 flex items-start justify-between gap-4'>
                                    <div>
                                        <p className='text-xs uppercase tracking-[0.34em] text-white/45'>Join now</p>
                                        <h2 className='mt-2 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl'>Create Account</h2>
                                        <p className='mt-2 max-w-md text-sm leading-6 text-white/72'>Create your profile, verify your email securely, and start buying or selling on campus.</p>
                                    </div>
                                    <div className='rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200'>
                                        Step {step} of 2
                                    </div>
                                </div>

                                <div className='mb-6 flex items-center gap-3'>
                                    {[1, 2].map((item) => (
                                        <div key={item} className='flex flex-1 items-center gap-3'>
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${step >= item ? 'border-cyan-300/40 bg-cyan-400/20 text-white' : 'border-white/10 bg-white/5 text-white/45'}`}>
                                                {item}
                                            </div>
                                            {item === 1 ? <div className={`h-px flex-1 ${step >= 2 ? 'bg-cyan-300/50' : 'bg-white/10'}`} /> : null}
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleSubmit(activeSubmit)} className='space-y-5'>
                                    {step === 1 && (
                                        <div className='space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5'>
                                            <div>
                                                <label className='mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/45'>Full Name</label>
                                                <input
                                                    type='text'
                                                    placeholder='John Doe'
                                                    className='h-12 w-full rounded-xl border border-white/25 bg-slate-900/45 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-cyan-300/85 focus:bg-slate-900/70 focus:ring-2 focus:ring-cyan-500/30'
                                                    {...register('name', { required: true })}
                                                />
                                            </div>

                                            <div>
                                                <label className='mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/45'>Account Type</label>
                                                <select
                                                    className='h-12 w-full rounded-xl border border-white/25 bg-slate-900/45 px-4 text-sm text-white outline-none transition focus:border-cyan-300/85 focus:bg-slate-900/70 focus:ring-2 focus:ring-cyan-500/30'
                                                    {...register('role', { required: true })}
                                                    defaultValue='student'
                                                >
                                                    <option value='student' className='text-slate-900'>Student Buyer</option>
                                                    <option value='seller' className='text-slate-900'>Seller</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className='mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/45'>Email</label>
                                                <input
                                                    type='email'
                                                    placeholder='you@example.com'
                                                    className='h-12 w-full rounded-xl border border-white/25 bg-slate-900/45 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-cyan-300/85 focus:bg-slate-900/70 focus:ring-2 focus:ring-cyan-500/30'
                                                    {...register('email', { required: true })}
                                                />
                                            </div>

                                            <div>
                                                <label className='mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/45'>Password</label>
                                                <input
                                                    type='password'
                                                    placeholder='••••••••'
                                                    className='h-12 w-full rounded-xl border border-white/25 bg-slate-900/45 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-cyan-300/85 focus:bg-slate-900/70 focus:ring-2 focus:ring-cyan-500/30'
                                                    {...register('password', { required: true })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className='space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5'>
                                            <div className='rounded-2xl border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-sm'>
                                                <div className='flex items-center gap-3'>
                                                    <CheckCircle2 className='h-5 w-5 text-emerald-300' />
                                                    <div>
                                                        <p className='text-sm font-semibold text-white'>Check your inbox</p>
                                                        <p className='text-xs text-white/55'>We sent a one-time code to {formData?.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className='mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/45'>Verification Code</label>
                                                <input
                                                    type='text'
                                                    placeholder='000000'
                                                    maxLength='6'
                                                    className='h-12 w-full rounded-xl border border-white/25 bg-slate-900/45 px-4 text-center text-sm text-white placeholder:text-white/45 outline-none transition focus:border-cyan-300/85 focus:bg-slate-900/70 focus:ring-2 focus:ring-cyan-500/30'
                                                    {...register('otp', { required: true })}
                                                />
                                            </div>

                                            <p className='text-xs text-white/50'>
                                                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Didn\'t receive the code?'}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        type='submit'
                                        disabled={sendOtpPending || verifyOtpPending || resendOtpPending}
                                        className='mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_16px_42px_rgba(20,184,166,0.35)] disabled:cursor-not-allowed disabled:opacity-70'
                                    >
                                        {sendOtpPending || verifyOtpPending ? <Spinner /> : <>
                                            {step === 1 ? 'Send OTP' : 'Verify & Sign Up'}
                                            <ArrowRight className='h-4 w-4' />
                                        </>}
                                    </button>

                                    {step === 2 && resendTimer === 0 && (
                                        <button
                                            type='button'
                                            onClick={handleResendOtp}
                                            disabled={resendOtpPending}
                                            className='mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-slate-900/45 text-sm font-semibold text-white transition-all duration-300 hover:bg-slate-900/65 hover:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-70'
                                        >
                                            {resendOtpPending ? <Spinner /> : <>
                                                <RotateCw className='h-4 w-4' />
                                                Resend Code
                                            </>}
                                        </button>
                                    )}

                                    <p className='mt-2 text-center text-sm text-white/70'>
                                        Already have an account?{' '}
                                        <Link to='/login' className='font-semibold text-cyan-300 transition hover:text-cyan-200'>
                                            Sign in
                                        </Link>
                                    </p>

                                    <div className='mt-2 flex items-center justify-center gap-2 rounded-full border border-sky-300/20 bg-[linear-gradient(145deg,rgba(14,165,233,0.2),rgba(2,132,199,0.08))] px-4 py-2 backdrop-blur-sm'>
                                        <ShieldCheck className='h-4 w-4 text-sky-300' />
                                        <span className='text-xs text-white/60'>Secure & encrypted OTP verification</span>
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

export default Register