import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useLogoutHook } from '@/hooks/user.hook'
import { useUserStore } from '@/store/userStore'
import { ShoppingCart, Sparkles } from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const user = useUserStore((state) => state.user)
  const clearUser = useUserStore((state) => state.clearUser)
  const { mutate } = useLogoutHook()
    
  const logoutHandler = () => {
    mutate()
    clearUser()
  }

  const cartCount = user?.cartItems?.length || 0
  const profileImage = user?.profilePicture || user?.profilePhoto
  const role = user?.role || (user?.owner ? 'admin' : 'student')
  const canOpenDashboard = role === 'admin' || (role === 'seller' && user?.isApproved)
  const navItemClass = ({ isActive }) =>
    `rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
      isActive
        ? 'bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.24)]'
        : 'text-slate-700 hover:bg-slate-950 hover:text-white'
    }`

  return (
    <nav className='sticky top-0 z-50 border-b border-white/20 bg-white/75 backdrop-blur-2xl'>
      <div className='absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-emerald-400 bg-[length:200%_200%] animate-sweep' />
      <div className='max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-20 items-center justify-between gap-4'>
          <Link to={'/'} className='group flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg transition-transform duration-300 group-hover:scale-105'>
              <Sparkles className='h-5 w-5' />
            </div>
            <div className='leading-none'>
              <p className='text-lg font-black tracking-tight text-slate-950 sm:text-xl'>VIT Campus space</p>
              <p className='hidden text-xs uppercase tracking-[0.32em] text-slate-400 sm:block'>Student marketplace</p>
            </div>
          </Link>

          <div className='hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 p-2 shadow-sm'>
            <NavLink
              to={'/'}
              className={navItemClass}
            >
              Home
            </NavLink>
            <NavLink
              to={'/product'}
              className={navItemClass}
            >
              Products
            </NavLink>
            <NavLink
              to={'/placements'}
              className={navItemClass}
            >
              Placements
            </NavLink>
          </div>

          <div className='flex items-center gap-3 sm:gap-4'>
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
    </nav>
  )
}

export default Navbar