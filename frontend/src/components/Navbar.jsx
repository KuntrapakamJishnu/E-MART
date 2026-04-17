import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useLogoutHook } from '@/hooks/user.hook'
import { useUserStore } from '@/store/userStore'
import { Menu, ShoppingCart, X } from 'lucide-react'
import CompanyLogo from '@/assets/CompanyLogo.png'

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = useUserStore((state) => state.user)
  const clearUser = useUserStore((state) => state.clearUser)
  const { mutateAsync } = useLogoutHook()
    
  const logoutHandler = async () => {
    clearUser()
    try {
      await mutateAsync()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  const cartCount = user?.cartItems?.length || 0
  const profileImage = user?.profilePicture || user?.profilePhoto
  const role = user?.role || (user?.owner ? 'admin' : 'student')
  const canOpenDashboard = role === 'admin' || (role === 'seller' && user?.isApproved)
  const isHomePage = location.pathname === '/' || location.pathname === '/home'
  const navHeightClass = isHomePage ? 'h-32 sm:h-36' : 'h-24 sm:h-28'
  const mobileMenuTopClass = isHomePage ? 'top-[8.5rem]' : 'top-[6.5rem]'
  const logoSizeClass = isHomePage
    ? 'h-24 w-24 rounded-[30px] sm:h-28 sm:w-28 md:h-32 md:w-32'
    : 'h-16 w-16 rounded-[22px] sm:h-20 sm:w-20'
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/product', label: 'Products' },
    { to: '/placements', label: 'Placements' },
    { to: '/contact', label: 'Contact Us' }
  ]
  const navItemClass = ({ isActive }) =>
    `rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
      isActive
        ? 'bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.24)]'
        : 'text-slate-700 hover:bg-slate-950 hover:text-white'
    }`
  const mobileNavItemClass = ({ isActive }) =>
    `rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
      isActive
        ? 'bg-slate-950 text-white shadow-[0_10px_20px_rgba(15,23,42,0.26)]'
        : 'bg-white text-slate-700 hover:-translate-y-0.5 hover:bg-slate-950 hover:text-white'
    }`

  return (
    <nav className='sticky top-0 z-50 border-b border-white/20 bg-white/75 backdrop-blur-2xl'>
      <div className='absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-emerald-400 bg-[length:200%_200%] animate-sweep' />
      <div className='max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8'>
        <div className={`flex ${navHeightClass} items-center justify-between gap-4`}>
          <Link to={'/'} className='group flex items-center'>
            <div className={`${logoSizeClass} overflow-hidden bg-white shadow-lg ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-105`}>
              <img src={CompanyLogo} alt='Company logo' className='h-full w-full object-cover' />
            </div>
          </Link>

          <div className='hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 p-2 shadow-sm'>
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={navItemClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className='flex items-center gap-3 sm:gap-4'>
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className='md:hidden relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-950 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
              aria-label='Toggle navigation menu'
            >
              {isMobileMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            </button>

            <button
              onClick={() => navigate('/cart')}
              className='relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-950 hover:text-white'
              aria-label='Shopping cart'
            >
              <ShoppingCart className='h-5 w-5' />
              {cartCount > 0 && (
                <span className='absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-1 text-[10px] font-bold text-white shadow-lg animate-glow-pulse'>
                  {cartCount}
                </span>
              )}
            </button>

            <Popover>
              <PopoverTrigger asChild>
                <button className='flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300'>
                  <Avatar className='h-9 w-9 ring-2 ring-slate-100'>
                    <AvatarImage src={profileImage} alt={user?.name} />
                    <AvatarFallback className='bg-slate-950 text-white text-sm font-bold'>
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='hidden text-left lg:block'>
                    <p className='text-sm font-semibold text-slate-950 leading-none'>{user?.name}</p>
                    <p className='text-[11px] text-slate-500'>Account menu</p>
                  </div>
                </button>
              </PopoverTrigger>

              <PopoverContent className='w-56 rounded-2xl border-slate-200 bg-white p-2 shadow-2xl' align='end'>
                <div className='flex flex-col gap-1'>
                  <Link
                    to={'/profile'}
                    className='rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950'
                  >
                    Profile
                  </Link>

                  <Link
                    to={'/placements'}
                    className='rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950'
                  >
                    Placement Reviews
                  </Link>

                  {canOpenDashboard && (
                    <button
                      onClick={() => navigate('/dashboard')}
                      className='rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950'
                    >
                      Dashboard
                    </button>
                  )}

                  <button
                    onClick={logoutHandler}
                    className='rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50'
                  >
                    Logout
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <button
          className='absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]'
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label='Close mobile menu backdrop'
        />

        <div
          className={`absolute left-3 right-3 ${mobileMenuTopClass} rounded-3xl border border-white/25 bg-white/90 p-3 shadow-[0_30px_70px_rgba(15,23,42,0.26)] backdrop-blur-xl transition-all duration-300 ${
            isMobileMenuOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-3 scale-95 opacity-0'
          }`}
        >
          <div className='mb-2 grid gap-2'>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={mobileNavItemClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className='mt-3 border-t border-slate-200 pt-3'>
            <div className='grid gap-2'>
              <Link
                to={'/profile'}
                className='rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>

              <Link
                to={'/placements'}
                className='rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Placement Reviews
              </Link>

              {canOpenDashboard && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    navigate('/dashboard')
                  }}
                  className='rounded-2xl bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100'
                >
                  Dashboard
                </button>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  logoutHandler()
                }}
                className='rounded-2xl bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-100'
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar