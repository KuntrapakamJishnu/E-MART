import React, { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './Protectedroutes'

const Login = lazy(() => import('@/Pages/Auth/Login'))
const Register = lazy(() => import('@/Pages/Auth/Register'))
const Home = lazy(() => import('@/Pages/User/Home'))
const Profile = lazy(() => import('@/Pages/User/Profile'))
const Product = lazy(() => import('@/Pages/User/Product'))
const Dashboard = lazy(() => import('@/Pages/Admin/Dashboard'))
const AnalyticDashboard = lazy(() => import('@/Pages/Admin/AnalyticDashboard'))
const ProductDashboard = lazy(() => import('@/Pages/Admin/ProductDashboard'))
const ApprovalDashboard = lazy(() => import('@/Pages/Admin/ApprovalDashboard'))
const SingleProduct = lazy(() => import('@/Pages/User/SingleProduct'))
const CartPage = lazy(() => import('@/Pages/User/CartPage'))
const Purchase = lazy(() => import('@/Pages/User/Purchase'))
const AIAssistant = lazy(() => import('@/Pages/User/AIAssistant'))
const PlacementReviews = lazy(() => import('@/Pages/User/PlacementReviews'))
const ContactUs = lazy(() => import('@/Pages/User/ContactUs'))

const PageFallback = () => (
    <div className='min-h-screen flex items-center justify-center bg-slate-950 px-4 text-white'>
        <div className='glass-panel rounded-3xl px-6 py-5 text-center'>
            <p className='text-xs uppercase tracking-[0.3em] text-white/55'>Loading</p>
            <div className='mx-auto mt-3 h-9 w-9 rounded-full border-2 border-white/20 border-t-cyan-300 animate-spin' />
            <p className='mt-3 text-sm text-white/70'>Preparing your page experience...</p>
        </div>
  </div>
)

const MainRoutes = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
          <Route path='/' element={
              <ProtectedRoute>
                  <Home/>
              </ProtectedRoute>
          }/>
          <Route path='/home' element={
              <ProtectedRoute>
                  <Home/>
              </ProtectedRoute>
          }/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/profile' element={
              <ProtectedRoute>
                  <Profile/>
              </ProtectedRoute>
          }/>
          <Route path='/product' element={
              <ProtectedRoute>
                  <Product/>
              </ProtectedRoute>
          }/>
          <Route path='/product/:id' element={
              <ProtectedRoute>
                  <SingleProduct/>
              </ProtectedRoute>
          }/>
          <Route path='/cart' element={
              <ProtectedRoute>
                  <CartPage/>
              </ProtectedRoute>
          }/>
          <Route path='/purchase' element={
              <ProtectedRoute>
                  <Purchase/>
              </ProtectedRoute>
          }/>
          <Route path='/ai-assistant' element={
              <ProtectedRoute>
                  <AIAssistant/>
              </ProtectedRoute>
          }/>
          <Route path='/placements' element={
              <ProtectedRoute>
                  <PlacementReviews/>
              </ProtectedRoute>
          }/>
          <Route path='/contact' element={
              <ProtectedRoute>
                  <ContactUs/>
              </ProtectedRoute>
          }/>

          <Route path='/dashboard' element={
              <ProtectedRoute>
                  <Dashboard/>
              </ProtectedRoute>
          }>
          <Route index element={
              <ProtectedRoute>

                  <AnalyticDashboard/>
              </ProtectedRoute>
              }/>
          <Route path='product' element={
              <ProtectedRoute>
                  <ProductDashboard/>

              </ProtectedRoute>
              }/>
          <Route path='approvals' element={
              <ProtectedRoute>
                  <ApprovalDashboard/>

              </ProtectedRoute>
              }/>


          </Route>
      </Routes>
    </Suspense>
  )
}

export default MainRoutes