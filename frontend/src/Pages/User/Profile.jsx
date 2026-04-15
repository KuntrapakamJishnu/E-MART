import { Pencil } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useForm, useWatch } from 'react-hook-form'
import { useUpdateProfileHook } from '@/hooks/user.hook'
import { Spinner } from '@/components/ui/spinner'
import { useUserStore } from '@/store/userStore'
import AdminImage from '@/assets/Admin.jpeg'

const Profile = () => {
  const user = useUserStore((state) => state.user)
  const role = user?.role || (user?.owner ? 'admin' : 'student')
  const roleLabel = role === 'admin' ? 'Admin' : role === 'seller' ? 'Seller' : 'Student Buyer'
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const profileImage = useMemo(() => {
    return user?.profilePicture || user?.profilePhoto || 'https://via.placeholder.com/300x300?text=CampusKart'
  }, [user?.profilePicture, user?.profilePhoto])

  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      name: user?.name || ''
    }
  })

  const { mutate, isPending } = useUpdateProfileHook()
  const watchedName = useWatch({ control, name: 'name' })
  const watchedFile = useWatch({ control, name: 'profilePhoto' })
  const previewUrl = useMemo(() => {
    if (watchedFile && watchedFile[0]) {
      return URL.createObjectURL(watchedFile[0])
    }
    return ''
  }, [watchedFile])

  useEffect(() => {
    reset({ name: user?.name || '' })
  }, [user?.name, reset])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const hasNameChanged = (watchedName || '').trim() && (watchedName || '').trim() !== (user?.name || '').trim()
  const hasPhotoChanged = Boolean(watchedFile && watchedFile[0])
  const hasFormChanges = hasNameChanged || hasPhotoChanged

  const updateFormHandler = (data) => {
    const formdata = new FormData()

    if (data.name && data.name.trim() && data.name.trim() !== (user?.name || '').trim()) {
      formdata.append("name", data.name.trim())
    }
    if (data.profilePhoto && data.profilePhoto[0]) {
      formdata.append("profilePhoto", data.profilePhoto[0])
    }

    if (!hasFormChanges) {
      return
    }

    mutate(formdata, {
      onSuccess: () => {
        setIsDialogOpen(false)
        reset({ name: data.name || user?.name || '' })
      }
    })
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-slate-950 text-white'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.2),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.2),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,1))]' />
      <div className='relative mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-10'>
      <div className='w-full rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_100px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8'>
        <div className='grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center'>
          <div className='relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 transition-transform duration-300 hover:-translate-y-1'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.16),transparent_36%),radial-gradient(circle_at_bottom_left,_rgba(236,72,153,0.14),transparent_34%)]' />
            <div className='relative flex flex-col items-center gap-4 text-center'>
              <div className='relative h-56 w-56 overflow-hidden rounded-[32px] border border-white/15 bg-slate-900 shadow-[0_18px_50px_rgba(15,23,42,0.4)] transition-transform duration-300 hover:scale-[1.03] hover:-rotate-1 sm:h-64 sm:w-64'>
                <img
                  src={AdminImage}
                  alt='Jishnu Kuntrapakam'
                  className='h-full w-full object-cover'
                  loading='lazy'
                  decoding='async'
                />
              </div>

              <div className='space-y-1'>
                <h2 className='text-2xl font-black tracking-[-0.04em] sm:text-3xl'>Jishnu Kuntrapakam</h2>
                <p className='text-xs uppercase tracking-[0.32em] text-cyan-200/70'>Made with love by</p>
                <p className='text-sm text-white/60'>Profile section crafted with a clean, interactive finish.</p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15 hover:shadow-[0_12px_28px_rgba(34,211,238,0.15)]'>
                    <Pencil className='h-4 w-4' />
                    Edit Profile
                  </button>
                </DialogTrigger>

                <DialogContent className='border-white/10 bg-slate-950 text-white sm:max-w-md'>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription className='text-white/55'>
                      Update your name and profile photo.
                    </DialogDescription>
                  </DialogHeader>

                  <div className='mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3'>
                    <img
                      src={previewUrl || profileImage}
                      alt='Preview'
                      className='h-14 w-14 rounded-2xl border border-white/10 object-cover'
                    />
                    <div>
                      <p className='text-sm font-semibold text-white'>{watchedName?.trim() || user?.name || 'User'}</p>
                      <p className='text-xs text-white/50'>Live preview</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(updateFormHandler)} className='mt-4 space-y-4'>
                    <input
                      type='text'
                      placeholder='Name'
                      className='w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                      {...register('name')}
                    />

                    <input
                      type='file'
                      accept='image/*'
                      className='w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white file:hover:bg-white/15'
                      {...register('profilePhoto')}
                    />

                    <button
                      type='submit'
                      disabled={isPending || !hasFormChanges}
                      className='inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-sm font-semibold text-white transition-transform hover:scale-[1.01] disabled:opacity-50'
                    >
                      {isPending ? <Spinner /> : 'Update'}
                    </button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className='space-y-5'>
            <div className='rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1'>
              <p className='text-xs uppercase tracking-[0.32em] text-white/45'>Profile</p>
              <h1 className='mt-3 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl'>{user?.name}</h1>
              <p className='mt-3 max-w-xl text-sm leading-7 text-white/65'>A simple, polished profile area with your photo front and center.</p>
            </div>

            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 hover:border-cyan-400/30'>
                <p className='text-xs uppercase tracking-[0.28em] text-white/45'>Account Type</p>
                <p className='mt-2 text-base font-semibold text-white'>{roleLabel}</p>
                {role === 'seller' && (
                  <p className='mt-1 text-xs text-white/60'>Status: {user?.isApproved ? 'Approved' : 'Pending Admin Approval'}</p>
                )}
              </div>

              <div className='rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 hover:border-fuchsia-400/30'>
                <p className='text-xs uppercase tracking-[0.28em] text-white/45'>Cart Items</p>
                <p className='mt-2 text-base font-semibold text-white'>{user?.cartItems?.length || 0}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Profile