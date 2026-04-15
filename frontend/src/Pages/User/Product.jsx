import AllProducts from '@/components/AllProducts'
import FilterProduct from '@/components/FliterProduct'
import ProductSearchBar from '@/components/ProductSearchBar'
import React, { useState } from 'react'
import { Boxes } from 'lucide-react'

const Product = () => {
  const [page, setpage] = useState(1)
  const [searchInput, setsearchInput] = useState("")
  const [activeSearch, setactiveSearch] = useState("")
  const [category, setcategory] = useState("")
  const [price, setprice] = useState({min:"", max:""})

  const handleSearchSubmit = (e)=>{
    e.preventDefault()
    setpage(1)
    setactiveSearch(searchInput)
    setsearchInput("")
  }

  const handleCategoryChange = (e)=>{
    setpage(1)
    setcategory(e)
  }
 
  const resetFormHandler =()=>{
    setsearchInput("")
    setactiveSearch("")
    setcategory("")
    setprice({min:"", max:""})
  }

  console.log(activeSearch)
  return (
    <div className='relative min-h-screen bg-slate-50'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.1),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.12),_transparent_22%),linear-gradient(180deg,_rgba(255,255,255,0.65)_0%,_rgba(248,250,252,1)_100%)]' />
      <ProductSearchBar
        searchInput={searchInput}
        setsearchInput={setsearchInput}
        onSearchSubmit={handleSearchSubmit}
      />
      <div className='relative mx-auto max-w-[1460px] px-4 pb-10 lg:px-6'>
        <div className='mb-4 lg:hidden'>
          <FilterProduct
            category={category}
            setcategory={handleCategoryChange}
            priceRange={price}
            setPriceRange={setprice}
            onReset={resetFormHandler}
          />
        </div>
        <div className='flex gap-5'>
        <FilterProduct
          category={category}
          setcategory={handleCategoryChange}
          priceRange={price}
          setPriceRange={setprice}
          onReset={resetFormHandler}
        />
        <div className='w-full min-w-0'>
          <div className='mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-[0_16px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl'>
            <span className='inline-flex items-center gap-2 font-semibold text-slate-700'>
              <Boxes className='h-4 w-4 text-fuchsia-500' />
              All Products
            </span>
            <span className='text-slate-500'>
              Category: {category || 'All'}
              {activeSearch ? ` • AI search: "${activeSearch}"` : ''}
            </span>
          </div>
          <AllProducts
            page={page}
            setpage={setpage}
            activeSearch={activeSearch}
            category={category}
            priceRange={price}
          />
        </div>
        </div>
      </div>
    </div>
  )
}

export default Product