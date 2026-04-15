// Dashboard.jsx
import SideBar from '@/components/SideBar'
import React from 'react'
import { useUserStore } from '@/store/userStore'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

const Dashboard = () => {
  const user = useUserStore((state) => state.user)
  const location = useLocation()
  const role = user?.role || (user?.owner ? 'admin' : 'student')
  const canAccessSellerDashboard = role === 'seller' && user?.isApproved

  if (canAccessSellerDashboard && location.pathname === '/dashboard') {
    return <Navigate to='/dashboard/product' replace />
  }

  return (
    <div className='relative flex min-h-screen bg-slate-950 text-white'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.2),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.18),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,1))]' />
      <SideBar/>
      <div className='relative flex-1 overflow-y-auto premium-scrollbar'>
        <Outlet />
      </div>
    </div>
  )
}

export default Dashboard