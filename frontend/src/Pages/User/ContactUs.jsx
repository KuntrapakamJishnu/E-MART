import React, { useState } from 'react'
import { Mail, UserRound, Sparkles, Copy, CheckCircle2 } from 'lucide-react'
import AdminImage from '@/assets/Admin.jpeg'

const CONTACT_EMAIL = 'kjishnu973@gmail.com'

const ContactUs = () => {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-slate-950 text-white'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.17),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.16),_transparent_30%)]' />
      <div className='pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-cyan-400/12 blur-3xl' />
      <div className='pointer-events-none absolute right-0 bottom-12 h-80 w-80 rounded-full bg-fuchsia-400/12 blur-3xl' />

      <section className='relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 pb-16 pt-28 sm:px-7 lg:px-10'>
        <div className='rounded-[34px] border border-white/15 bg-white/[0.07] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8'>
          <div className='inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200'>
            <Sparkles className='h-3.5 w-3.5' />
            Contact Us
          </div>
          <h1 className='mt-5 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl'>Let’s Connect</h1>
          <p className='mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base'>
            Reach out directly for project collaboration, feedback, and support.
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          <div className='group rounded-3xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-[0_22px_55px_rgba(34,211,238,0.2)]'>
            <div className='mb-5 flex items-center gap-4'>
              <div className='h-20 w-20 overflow-hidden rounded-[24px] border border-white/15 bg-slate-900 shadow-[0_16px_36px_rgba(15,23,42,0.28)] transition-transform duration-300 group-hover:scale-[1.03]'>
                <img src={AdminImage} alt='Jishnu Kuntrapakam' className='h-full w-full object-cover' />
              </div>
              <div className='inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200'>
                <UserRound className='h-6 w-6' />
              </div>
            </div>
            <p className='text-xs uppercase tracking-[0.24em] text-slate-400'>Creator</p>
            <h2 className='mt-2 text-2xl font-black tracking-tight text-white'>Jishnu Kuntrapakam</h2>
          </div>

          <div className='group rounded-3xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-300/35 hover:shadow-[0_22px_55px_rgba(217,70,239,0.2)]'>
            <div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-400/15 text-fuchsia-200'>
              <Mail className='h-6 w-6' />
            </div>
            <p className='text-xs uppercase tracking-[0.24em] text-slate-400'>Email</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className='mt-2 inline-block text-xl font-bold tracking-tight text-white underline-offset-4 transition hover:text-cyan-200 hover:underline'
            >
              {CONTACT_EMAIL}
            </a>

            <div className='mt-5 flex flex-wrap gap-3'>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className='inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.03]'
              >
                <Mail className='h-4 w-4' />
                Send Email
              </a>
              <button
                onClick={copyEmail}
                className='inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.03] hover:bg-white/15'
              >
                {copied ? <CheckCircle2 className='h-4 w-4 text-emerald-300' /> : <Copy className='h-4 w-4' />}
                {copied ? 'Copied' : 'Copy Email'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactUs
