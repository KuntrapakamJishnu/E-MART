// SideBar.jsx
import { Home, LayoutDashboard, Package, ShieldCheck, Sparkles } from 'lucide-react'
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const SideBar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Analytics', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Products', icon: Package, path: '/dashboard/product' }
  ]

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside className='sticky top-0 h-screen w-72 shrink-0 border-r border-white/15 bg-slate-950/95 text-white backdrop-blur-2xl'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.2),_transparent_30%)]' />
      <div className='relative h-full p-6'>
        <div className='mb-8 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl'>
          <p className='inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60'>
            <ShieldCheck className='h-4 w-4 text-emerald-400' />
            Admin Suite
          </p>
          <h2 className='mt-2 text-2xl font-black tracking-[-0.04em] text-white'>Dashboard</h2>
          <p className='mt-1 text-xs text-white/60'>Control commerce, products, and analytics.</p>
        </div>
        
        <nav className='space-y-2'>
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 flex items-center gap-3 ${
                  active 
                    ? 'bg-white text-slate-950 shadow-[0_14px_28px_rgba(236,72,153,0.22)]' 
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className='w-5 h-5' />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className='mt-8 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-white/75 backdrop-blur-xl'>
          <p className='inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/55'>
            <Sparkles className='h-3.5 w-3.5 text-cyan-300' />
            Live Operations
          </p>
          <p className='mt-2 leading-6'>Monitor product updates and sales trends in one place.</p>
        </div>
      </div>
    </aside>
  )
}

export default SideBar