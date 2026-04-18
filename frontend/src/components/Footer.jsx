import React from 'react'
import { Link } from 'react-router-dom'
import CompanyLogo from '@/assets/CompanyLogo.png'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='relative overflow-hidden bg-slate-950 text-slate-300'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.18),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.16),_transparent_22%)]' />
      <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent' />

      <div className='relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8'>
        <div className='mb-10 flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/5 px-6 py-7 shadow-[0_20px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center gap-4'>
            <div className='h-20 w-20 overflow-hidden rounded-[24px] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.28)] ring-1 ring-white/15 sm:h-24 sm:w-24 md:h-28 md:w-28'>
              <img src={CompanyLogo} alt='Company logo' className='h-full w-full object-cover' />
            </div>
          </div>
          <p className='max-w-xl text-sm leading-7 text-slate-300'>
            Premium shopping, bold visuals, and polished interactions across every page of the storefront.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4'>
          <div>
            <h3 className='text-lg font-bold text-white mb-4'>Marketplace</h3>
            <p className='text-sm leading-relaxed mb-4 text-slate-400'>
              Your trusted destination for quality products. We bring you the best shopping experience with great deals and excellent customer service.
            </p>
            <div className='flex gap-4'>
              <a href='#' className='hover:text-white transition-colors' aria-label='Facebook'>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'/>
                </svg>
              </a>
              <a href='#' className='hover:text-white transition-colors' aria-label='Instagram'>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/>
                </svg>
              </a>
              <a href='#' className='hover:text-white transition-colors' aria-label='Twitter'>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z'/>
                </svg>
              </a>
              <a href='#' className='hover:text-white transition-colors' aria-label='YouTube'>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className='text-white text-sm font-semibold mb-4 uppercase tracking-[0.32em]'>Shop</h3>
            <ul className='space-y-3'>
              <li>
                <Link to='/product' className='text-sm hover:text-white transition-colors'>
                  All Products
                </Link>
              </li>
              <li>
                <Link to='/product' className='text-sm hover:text-white transition-colors'>
                  Men's Collection
                </Link>
              </li>
              <li>
                <Link to='/product' className='text-sm hover:text-white transition-colors'>
                  Women's Collection
                </Link>
              </li>
              <li>
                <Link to='/product' className='text-sm hover:text-white transition-colors'>
                  Kids Collection
                </Link>
              </li>
              <li>
                <Link to='/home' className='text-sm hover:text-white transition-colors'>
                  Featured Products
                </Link>
              </li>
              <li>
                <Link to='/home' className='text-sm hover:text-white transition-colors'>
                  Special Offers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-white text-sm font-semibold mb-4 uppercase tracking-[0.32em]'>Customer Service</h3>
            <ul className='space-y-3'>
              <li>
                <Link to='/home' className='text-sm hover:text-white transition-colors'>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to='/home' className='text-sm hover:text-white transition-colors'>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to='/home' className='text-sm hover:text-white transition-colors'>
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link to='/home' className='text-sm hover:text-white transition-colors'>
                  Returns & Exchange
                </Link>
              </li>
              <li>
                <Link to='/home' className='text-sm hover:text-white transition-colors'>
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to='/home' className='text-sm hover:text-white transition-colors'>
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-white text-sm font-semibold mb-4 uppercase tracking-[0.32em]'>Newsletter</h3>
            <p className='text-sm mb-4'>
              Subscribe to get special offers, updates and exclusive deals.
            </p>
            <form className='space-y-3'>
              <input
                type='email'
                placeholder='Enter your email'
                className='w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/60'
              />
              <button
                type='submit'
                className='w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-emerald-400 bg-[length:200%_200%] py-3 px-4 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] animate-sweep'
              >
                Subscribe
              </button>
            </form>
            <p className='text-xs mt-3 text-slate-500'>
              By subscribing, you agree to our Privacy Policy
            </p>
          </div>
        </div>

        <div className='mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between'>
          <div className='text-sm text-slate-500'>
            © {currentYear} All rights reserved.
          </div>
          <div>
            <ul className='flex flex-wrap gap-6 text-sm'>
              <li>
                <Link to='' className='text-slate-500 hover:text-white transition-colors'>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to='/home' className='text-slate-500 hover:text-white transition-colors'>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to='/home' className='text-slate-500 hover:text-white transition-colors'>
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer