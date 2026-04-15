import { Pencil } from 'lucide-react'
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useForm } from 'react-hook-form'
import { useUpdateProfileHook } from '@/hooks/user.hook'
import { Spinner } from '@/components/ui/spinner'
import { useUserStore } from '@/store/userStore'

const Profile = () => {
  const user = useUserStore((state) => state.user)
  const role = user?.role || (user?.owner ? 'admin' : 'student')
  const roleLabel = role === 'admin' ? 'Admin' : role === 'seller' ? 'Seller' : 'Student Buyer'
  const {register, handleSubmit, reset} = useForm()
  const {mutate, isPending} = useUpdateProfileHook()

  const updateFormHandler = (data) => {
    const formdata = new FormData()

    if(data.name) {
      formdata.append("name", data.name)
    }
    if(data.profilePhoto && data.profilePhoto[0]) {
      formdata.append("profilePhoto", data.profilePhoto[0])
    }
    mutate(formdata, {
      onSuccess: () => reset()
    })
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-slate-950 text-white'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.2),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.2),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,1))]' />
      <div className='relative mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-10'>
      <div className='glass-panel w-full rounded-[34px] p-8 sm:p-10'>
        
        {/* Avatar with Edit */}
        <div className='relative mx-auto mb-8 h-36 w-36'>
          <img 
            src={user?.profilePhoto || 'https://via.placeholder.com/300x300?text=E-Mart'} 
            className='h-full w-full rounded-full border border-white/20 object-cover shadow-[0_0_0_12px_rgba(255,255,255,0.08)]' 
            loading='lazy'
            decoding='async'
            alt={user?.name} 
          />
          
          <Dialog>
            <DialogTrigger asChild>
              <button className='absolute bottom-1 right-1 rounded-full bg-white/90 p-2 text-slate-900 transition-transform hover:scale-105'>
                <Pencil className='w-4 h-4' />
              </button>
            </DialogTrigger>
            
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Update your name and profile photo
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(updateFormHandler)} className='space-y-4 mt-4'>
                <input 
                  type="text" 
                  placeholder='Name' 
                  className='w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                  {...register('name')}
                />
                
                <input 
                  type="file" 
                  accept="image/*"
                  className='w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none'
                  {...register('profilePhoto')}
                />
                
                <button 
                  type='submit' 
                  disabled={isPending}
                  className='w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors disabled:opacity-50 flex items-center justify-center'
                >
                  {isPending ? <Spinner /> : "Update"}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* User Info */}
        <div className='space-y-6 text-center'>
          <h1 className='text-4xl font-black tracking-[-0.05em] text-white'>{user?.name}</h1>
          
          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur-xl'>
              <p className='text-xs uppercase tracking-[0.28em] text-white/45'>Account Type</p>
              <p className='mt-2 text-base font-semibold text-white'>{roleLabel}</p>
              {role === 'seller' && (
                <p className='mt-1 text-xs text-white/65'>Status: {user?.isApproved ? 'Approved' : 'Pending Admin Approval'}</p>
              )}
            </div>
            <div className='rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur-xl'>
              <p className='text-xs uppercase tracking-[0.28em] text-white/45'>Cart Items</p>
              <p className='mt-2 text-base font-semibold text-white'>{user?.cartItem?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Profile