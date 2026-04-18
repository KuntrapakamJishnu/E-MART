import React from 'react'
import MainRoutes from './Routes/MainRoutes'
import Navbar from './components/Navbar'
import { useLocation } from 'react-router-dom'
import AIProductAssistant from './components/AIProductAssistant'

const App = () => {

  const location = useLocation()
  const hiddenRoute = ['/login', '/register','/dashboard','/purchase', '/ai-assistant']
  const shouldHideNavbar = location.pathname === '/' || hiddenRoute.some((route)=>location.pathname.startsWith(route))
  return (
    <div className='app-shell'>
      <div className='app-noise' />
      {!shouldHideNavbar && <Navbar/>}
      <div key={location.pathname} className='route-enter'>
        <MainRoutes/>
      </div>
      {!shouldHideNavbar && <AIProductAssistant />}
    </div>
  )
}

export default App