import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useGetProfileHook } from '@/hooks/user.hook'
import CompanyLogo from '@/assets/CompanyLogo.png'

const backgroundImage = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1800&q=80'

const Welcome = () => {
  const navigate = useNavigate()
  const { data: profileData } = useGetProfileHook()

  useEffect(() => {
    if (profileData) {
      navigate('/home', { replace: true })
    }
  }, [navigate, profileData])

  useEffect(() => {
    const heroImage = new Image()
    heroImage.src = backgroundImage
  }, [])

  return (
    <div className='relative min-h-screen overflow-hidden bg-slate-950 text-white'>
      <div
        className='absolute inset-0 bg-cover bg-center'
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />
      <div className='absolute inset-0 bg-black/48' />

      <header className='relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8'>
        <Link to='/' className='flex items-center gap-4'>
          <div className='h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_rgba(15,23,42,0.35)] ring-1 ring-white/15 sm:h-14 sm:w-14'>
            <img src={CompanyLogo} alt='Company logo' className='h-full w-full object-cover' />
          </div>
          <p className='text-xs uppercase tracking-[0.3em] text-white/80 sm:text-sm'>CampusKartAI</p>
        </Link>

        <div className='rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md sm:text-[11px]'>
          AI-Powered Campus Store
        </div>
      </header>

      <main className='relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-20'>
        <section className='max-w-xl rounded-[28px] border border-white/12 bg-black/35 p-6 text-left shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8'>
          <p className='mb-3 text-xs uppercase tracking-[0.28em] text-white/55'>Welcome</p>
          <h1 className='text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl'>Simple fashion marketplace</h1>
          <p className='mt-4 max-w-lg text-sm leading-7 text-white/75 sm:text-base'>
            Browse clothes, sign in, and continue into the store.
          </p>

          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Link
              to='/login'
              className='inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]'
            >
              Login
              <ArrowRight className='h-4 w-4' />
            </Link>
            <Link
              to='/register'
              className='inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15'
            >
              Register
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Welcome