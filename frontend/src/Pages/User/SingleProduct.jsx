import { useAddToCartHook } from '@/hooks/cart.hook'
import { useGetSingleProduct } from '@/hooks/product.hook'
import { Spinner } from '@/components/ui/spinner'
import React from 'react'
import { useParams } from 'react-router-dom'
import { ShoppingBag, Sparkles } from 'lucide-react'

const SingleProduct = () => {
  const {id} = useParams()
  const {data} = useGetSingleProduct(id)
  
  const {mutate, isPending} = useAddToCartHook()
  
  const addTocartFunction = (id) => {
    mutate({productId: id})
  }

  return (
    <div className='min-h-screen bg-slate-950 text-white'>
      <div className='mx-auto max-w-6xl px-6 py-12'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          
          {/* Product Image */}
          <div className='relative h-[500px] w-full overflow-hidden rounded-[28px] border border-white/15 bg-white/10 p-4 backdrop-blur-xl'>
            <div className='absolute -left-8 top-8 h-24 w-24 rounded-full bg-fuchsia-500/20 blur-3xl' />
            <div className='absolute -right-8 bottom-8 h-24 w-24 rounded-full bg-cyan-500/20 blur-3xl' />
            <img 
              src={data?.image || data?.imageUrl} 
              alt={data?.name}
              className='h-full w-full object-contain drop-shadow-[0_28px_40px_rgba(2,6,23,0.45)]'
              loading='lazy'
              decoding='async'
            />
          </div>

          {/* Product Details */}
          <div className='flex flex-col justify-center space-y-6'>
            
            {/* Category Badge */}
            <span className='inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70'>
              <Sparkles className='h-3.5 w-3.5 text-cyan-300' />
              {data?.category}
            </span>

            {/* Product Name */}
            <h1 className='text-4xl font-black leading-tight tracking-[-0.05em] text-white sm:text-5xl'>
              {data?.name}
            </h1>

            {/* Price */}
            <p className='text-4xl font-black text-white'>
              Rs. {data?.price}
            </p>

            {/* Description */}
            <p className='border-t border-white/15 pt-6 text-base leading-relaxed text-white/70'>
              {data?.description}
            </p>

            {/* Add to Cart Button */}
            <button 
              onClick={() => addTocartFunction(data?._id)}
              disabled={isPending}
              className='inline-flex w-full items-center justify-center gap-2 rounded-full bg-[length:200%_200%] bg-gradient-to-r from-slate-950 via-fuchsia-600 to-cyan-500 px-12 py-4 text-base font-semibold text-white transition-transform duration-300 animate-sweep hover:scale-[1.01] disabled:opacity-50 lg:w-auto'
            >
              {isPending ? <Spinner /> : <><ShoppingBag className='h-4 w-4' /> Add to Cart</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SingleProduct