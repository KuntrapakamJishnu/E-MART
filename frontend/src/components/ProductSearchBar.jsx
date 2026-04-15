import React from 'react'
import { Search, Sparkles } from 'lucide-react'

const ProductSearchBar = ({searchInput, setsearchInput, onSearchSubmit}) => {
  return (
    <div className='relative overflow-hidden border-b border-white/10 bg-slate-950 text-white'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.2),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.2),_transparent_26%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,1))]' />
      <div className='pointer-events-none absolute -left-20 top-16 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl animate-float-slow' />
      <div className='pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl animate-float-medium' />

      <div className='relative mx-auto flex min-h-[300px] max-w-7xl items-center px-6 py-10 lg:px-10'>
        <div className='w-full space-y-6'>
          <div className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70'>
            <Sparkles className='h-3.5 w-3.5 text-cyan-300' />
            Product Studio
          </div>
          <h1 className='max-w-4xl text-4xl font-black tracking-[-0.05em] sm:text-5xl lg:text-6xl'>Discover products with a cinematic shopping flow.</h1>
          <p className='max-w-2xl text-sm leading-7 text-white/70 sm:text-base'>Search by name or category, then refine with premium filters and live pagination.</p>

          <form onSubmit={onSearchSubmit} className='flex max-w-3xl items-center rounded-full border border-white/20 bg-white/10 p-1.5 shadow-[0_18px_40px_rgba(2,6,23,0.26)] backdrop-blur-xl'>
            <Search className='ml-4 h-4 w-4 text-white/60' />
            <input
              type='text'
              placeholder='Search products, categories, and drops...'
              className='h-11 flex-1 bg-transparent px-3 text-sm text-white placeholder:text-white/45 outline-none'
              value={searchInput}
              onChange={(e) => setsearchInput(e.target.value)}
            />
            <button
              type='submit'
              className='inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-slate-900 transition-transform hover:scale-[1.02]'
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProductSearchBar