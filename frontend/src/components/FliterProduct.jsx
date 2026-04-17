import React from 'react'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'

const FilterProduct = ({ category, setcategory, priceRange, setPriceRange, color, setColor, quality, setQuality, onReset }) => {
  return (
    <div className='w-full lg:block lg:w-[320px] lg:shrink-0 lg:sticky lg:top-24 lg:h-fit'>
      <div className='lg:p-1'>
        <div className='rounded-[24px] border border-slate-200/80 bg-white/85 p-5 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.1)] backdrop-blur-xl'>
        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
          <h2 className='inline-flex items-center gap-2 text-lg font-black text-slate-900'>
            <SlidersHorizontal className='h-4 w-4 text-fuchsia-500' />
            Filters
          </h2>
          {(category || priceRange.min || priceRange.max || color || quality) && (
            <button 
              className='inline-flex items-center gap-1 text-sm font-semibold text-fuchsia-600 hover:text-fuchsia-700'
              onClick={onReset}
            >
              <RotateCcw className='h-3.5 w-3.5' />
              Clear all
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className='mb-8 border-b border-slate-200 pb-8'>
          <label className='mb-3 block text-sm font-semibold text-slate-900'>
            Category
          </label>
          <select 
            value={category} 
            onChange={(e) => setcategory(e.target.value)}
            className='w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-200'
          >
            <option value="">All Categories</option>
            <option value="Mens">Men</option>
            <option value="Womens">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div className='mb-8 border-b border-slate-200 pb-8'>
          <label className='mb-3 block text-sm font-semibold text-slate-900'>
            Price Range (INR)
          </label>
          <div className='space-y-4'>
            <div>
              <label className='mb-1.5 block text-xs text-slate-500'>Minimum (Rs.)</label>
              <input 
                type="number" 
                value={priceRange.min} 
                onChange={(e) => setPriceRange((prev) => ({...prev, min: e.target.value}))}
                placeholder='Rs. 0'
                className='w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-200'
              />
            </div>
            <div>
              <label className='mb-1.5 block text-xs text-slate-500'>Maximum (Rs.)</label>
              <input 
                type="number" 
                value={priceRange.max} 
                onChange={(e) => setPriceRange((prev) => ({...prev, max: e.target.value}))}
                placeholder='Rs. 1000'
                className='w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-200'
              />
            </div>
          </div>
        </div>

        <div className='mb-8 border-b border-slate-200 pb-8'>
          <label className='mb-3 block text-sm font-semibold text-slate-900'>
            Color
          </label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className='w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-200'
          >
            <option value=''>All Colors</option>
            <option value='Black'>Black</option>
            <option value='White'>White</option>
            <option value='Blue'>Blue</option>
            <option value='Red'>Red</option>
            <option value='Green'>Green</option>
            <option value='Grey'>Grey</option>
            <option value='Pink'>Pink</option>
            <option value='Brown'>Brown</option>
          </select>
        </div>

        <div>
          <label className='mb-3 block text-sm font-semibold text-slate-900'>
            Quality
          </label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className='w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-200'
          >
            <option value=''>All Quality Levels</option>
            <option value='Budget'>Budget</option>
            <option value='Standard'>Standard</option>
            <option value='Premium'>Premium</option>
          </select>
        </div>
        </div>

      </div>
    </div>
  )
}

export default FilterProduct