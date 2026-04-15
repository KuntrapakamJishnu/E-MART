import { useSendOtpHook, useVerifyOtpHook, useResendOtpHook } from '@/hooks/auth.hook'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Sparkles, ArrowRight, RotateCw } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

const Register = () => {
    const navigate = useNavigate()
    const { register, handleSubmit } = useForm()
    const [step, setStep] = useState(1) // 1: Email/Name/Password, 2: OTP Verification
    const [formData, setFormData] = useState(null)
    const [resendTimer, setResendTimer] = useState(0)

    const { mutate: sendOtp, isPending: sendOtpPending } = useSendOtpHook()
    const { mutate: verifyOtp, isPending: verifyOtpPending } = useVerifyOtpHook()
    const { mutate: resendOtp, isPending: resendOtpPending } = useResendOtpHook()

    // Countdown timer for resend
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
            
            {/* Gradient Overlays */}
                        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.16),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(170deg,_rgba(7,12,28,0.35),_rgba(8,22,38,0.45))]' />
                        <div className='pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-teal-400/12 blur-3xl' />
                        <div className='pointer-events-none absolute right-0 bottom-20 h-80 w-80 rounded-full bg-cyan-400/13 blur-3xl' />
                        <div className='pointer-events-none absolute right-1/3 top-0 h-52 w-52 rounded-full bg-blue-400/10 blur-3xl' />

            {/* Centered Register Container */}
            <div className='relative flex min-h-screen items-center justify-center px-6 py-10'>
                <div className='w-full max-w-md'>
                    
                    {/* Logo & Branding */}
                    <div className='mb-8 text-center'>
                        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 shadow-[0_10px_40px_rgba(20,184,166,0.35)]'>
                            <Sparkles className='h-8 w-8 text-white' />
                        </div>
                        <h1 className='bg-gradient-to-r from-white via-cyan-100 to-teal-100 bg-clip-text text-3xl font-black tracking-[-0.05em] text-transparent'>VIT Campus space</h1>
                        <p className='mt-2 text-sm text-white/70'>Your premium student marketplace</p>
                    </div>

                    {/* Register Form Card */}
                    <div className='relative rounded-[30px] p-[1px]'>
                        <div className='pointer-events-none absolute -inset-[2px] rounded-[32px] bg-[conic-gradient(from_0deg,rgba(20,184,166,0.38),rgba(14,165,233,0.34),rgba(59,130,246,0.32),rgba(20,184,166,0.38))] opacity-55 blur-md' />
                    <form onSubmit={handleSubmit(step === 1 ? handleSendOtp : handleVerifyOtp)} className='relative glass-panel rounded-[28px] border border-white/20 bg-[linear-gradient(150deg,rgba(255,255,255,0.16),rgba(255,255,255,0.06))] p-8 shadow-[0_35px_95px_rgba(2,6,23,0.58)] backdrop-blur-2xl sm:p-10'>
                        
                        {/* Form Header */}
                        <div className='mb-6'>
                            <h2 className='text-2xl font-black tracking-[-0.04em] text-white'>
                                {step === 1 ? 'Create Account' : 'Verify Email'}
                            </h2>
                            <p className='mt-2 text-sm text-white/75'>
                                {step === 1 
                                    ? 'Set your password, then verify OTP to complete signup' 
                                    : `We sent a code to ${formData?.email}`}
                            </p>
                        </div>

                        {/* Step 1: Email/Name/Password */}
                        {step === 1 && (
                            <div className='space-y-4'>
                                <div>
                                    <label className='mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/45'>Full Name</label>
                                    <input
                                        type='text'
                                        placeholder='John Doe'
                                        className='h-12 w-full rounded-xl border border-white/25 bg-slate-900/30 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-sky-300/85 focus:bg-slate-900/45 focus:ring-2 focus:ring-sky-500/30'
                                        {...register('name', { required: true })}
                                    />
                                </div>

                                <div>
                                    <label className='mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/45'>Account Type</label>
                                    <select
                                        className='h-12 w-full rounded-xl border border-white/25 bg-slate-900/30 px-4 text-sm text-white outline-none transition focus:border-sky-300/85 focus:bg-slate-900/45 focus:ring-2 focus:ring-sky-500/30'
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
                                        className='h-12 w-full rounded-xl border border-white/25 bg-slate-900/30 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-sky-300/85 focus:bg-slate-900/45 focus:ring-2 focus:ring-sky-500/30'
                                        {...register('email', { required: true })}
                                    />
                                </div>
                                
                                <div>
                                    <label className='mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/45'>Password</label>
                                    <input
                                        type='password'
                                        placeholder='••••••••'
                                        className='h-12 w-full rounded-xl border border-white/25 bg-slate-900/30 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-sky-300/85 focus:bg-slate-900/45 focus:ring-2 focus:ring-sky-500/30'
                                        {...register('password', { required: true })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: OTP Verification */}
                        {step === 2 && (
                            <div className='space-y-4'>
                                <div>
                                    <label className='mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/45'>Verification Code</label>
                                    <input
                                        type='text'
                                        placeholder='000000'
                                        maxLength='6'
                                        className='h-12 w-full rounded-xl border border-white/25 bg-slate-900/30 px-4 text-center text-sm text-white placeholder:text-white/45 outline-none transition focus:border-sky-300/85 focus:bg-slate-900/45 focus:ring-2 focus:ring-sky-500/30'
                                        {...register('otp', { required: true })}
                                    />
                                </div>

                                <p className='text-xs text-white/50'>
                                    {resendTimer > 0 
                                        ? `Resend code in ${resendTimer}s`
                                        : 'Didn\'t receive the code?'
                                    }
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type='submit'
                            disabled={sendOtpPending || verifyOtpPending || resendOtpPending}
                            className='mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_16px_42px_rgba(20,184,166,0.35)] disabled:cursor-not-allowed disabled:opacity-70'
                        >
                            {sendOtpPending || verifyOtpPending ? <Spinner /> : <>
                                {step === 1 ? 'Send OTP' : 'Verify & Sign Up'}
                                <ArrowRight className='h-4 w-4' />
                            </>}
                        </button>

                        {/* Resend OTP Button */}
                        {step === 2 && resendTimer === 0 && (
                            <button
                                type='button'
                                onClick={handleResendOtp}
                                disabled={resendOtpPending}
                                className='mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-slate-900/35 text-sm font-semibold text-white transition-all duration-300 hover:bg-slate-900/55 hover:border-sky-300/60 disabled:cursor-not-allowed disabled:opacity-70'
                            >
                                {resendOtpPending ? <Spinner /> : <>
                                    <RotateCw className='h-4 w-4' />
                                    Resend Code
                                </>}
                            </button>
                        )}

                        {/* Links */}
                        <p className='mt-6 text-center text-sm text-white/70'>
                            Already have an account?{' '}
                            <Link to='/login' className='font-semibold text-cyan-300 transition hover:text-cyan-200'>
                                Sign in
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

export default Register