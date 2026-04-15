import { useGetAllProductHook } from '@/hooks/product.hook'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from './ui/spinner'
import { ArrowRight } from 'lucide-react'

const AllProducts = ({page, setpage, activeSearch, category, priceRange},) => {
  const {data, isLoading} = useGetAllProductHook({
    page,
    search:activeSearch,
    category:category,
     minPrice: priceRange.min,
  maxPrice: priceRange.max
  })
  const navigate = useNavigate()
  
  if(isLoading){
    return <div className='h-screen text-3xl w-full flex items-center justify-center'><Spinner/></div>
  }
 
  const navigateSingleProduct = (id) => {
    navigate(`/product/${id}`)
  }

  const products = data?.products || []
  const totalPages = data?.totalPages || 1
  const currentPage = data?.page || page

  return (
    <div className='min-h-screen w-full flex flex-col justify-between'>
      
      {/* Products Grid */}
      {products.length === 0 ? (
        <div className='rounded-[28px] border border-dashed border-slate-300 bg-white/85 px-6 py-16 text-center shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl'>
          <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>No results</p>
          <h3 className='mt-3 text-2xl font-black text-slate-900'>No products match your filters</h3>
          <p className='mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500'>Try widening your price range or removing category/search constraints.</p>
        </div>
      ) : (
      <div className='grid grid-cols-1 gap-6 py-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
        {products.map((item) => {
          return(
            <div 
              key={item._id}
              onClick={() => navigateSingleProduct(item._id)} 
              className='group cursor-pointer overflow-hidden rounded-[24px] border border-slate-200 bg-white/90 shadow-[0_14px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_70px_rgba(15,23,42,0.18)] flex flex-col h-[392px] backdrop-blur-xl'
            >
              {/* Image Container */}
              <div className='relative w-full h-[240px] overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200'>
                <div className='absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                <img 
                  src={item.image || item.imageUrl} 
                  className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' 
                  loading='lazy'
                  decoding='async'
                  alt={item.name} 
                />
                <span className='absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-700'>
                  {item.category}
                </span>
              </div>

              {/* Product Info */}
              <div className='flex-1 flex flex-col justify-between p-4'>
                <div className='space-y-2'>
                  <h3 className='text-gray-900 font-medium text-base leading-tight line-clamp-2'>
                    {item.name}
                  </h3>
                  <p className='text-2xl font-bold text-gray-900'>
                    Rs. {item.price}
                  </p>
                </div>
                
                <div className='mt-3 flex items-center justify-between'>
                  <span className='text-xs font-semibold uppercase tracking-[0.28em] text-slate-400'>Explore details</span>
                  <ArrowRight className='h-4 w-4 text-fuchsia-500 transition-transform duration-300 group-hover:translate-x-1' />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      )}

      {/* Pagination */}
      <div className='mt-8 flex items-center justify-center gap-6 rounded-2xl border border-slate-200 bg-white/70 py-5 shadow-[0_16px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl'>
        <button 
          disabled={page === 1}
          onClick={() => setpage((prev) => prev - 1)}
          className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
            page === 1 
              ? 'cursor-not-allowed bg-slate-100 text-slate-400' 
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          Previous
        </button>

        <div className='flex items-center gap-2 text-sm'>
          <span className='font-semibold text-slate-900'>{currentPage}</span>
          <span className='text-slate-500'>of</span>
          <span className='font-semibold text-slate-900'>{totalPages}</span>
        </div>

        <button 
          disabled={!data?.hasMore}
          onClick={() => setpage((prev) => prev + 1)}
          className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
            !data?.hasMore 
              ? 'cursor-not-allowed bg-slate-100 text-slate-400' 
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default AllProducts