import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddToCartHook } from '@/hooks/cart.hook';

const FeaturedProducts = ({ item }) => {
  const cardRef = useRef(null)
  const navigate = useNavigate()
  const { mutate: addToCart, isPending: addToCartPending } = useAddToCartHook()
  const imageSrc = item?.imageUrl || item?.image || 'https://via.placeholder.com/600x600?text=E-Mart'
  const productId = item?._id
  const [showFullDescription, setShowFullDescription] = useState(false)

  const handlePointerMove = (event) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    const rotateY = (px - 0.5) * 10
    const rotateX = (0.5 - py) * 10

    card.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`)
    card.style.setProperty('--my', `${(py * 100).toFixed(2)}%`)
    card.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`)
    card.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`)
  }

  const resetPointer = () => {
    const card = cardRef.current
    if (!card) return

    card.style.setProperty('--mx', '50%')
    card.style.setProperty('--my', '50%')
    card.style.setProperty('--rx', '0deg')
    card.style.setProperty('--ry', '0deg')
  }

  return (
    <div
      ref={cardRef}
      onClick={() => {
        if (productId) {
          navigate(`/product/${productId}`)
        }
      }}
      onMouseMove={handlePointerMove}
      onMouseLeave={resetPointer}
      onMouseEnter={resetPointer}
      className="featured-tilt-card group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/10 backdrop-blur-xl shadow-[0_16px_56px_rgba(0,0,0,0.14)] cursor-pointer"
    >
      <div className="featured-spotlight absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/20 to-transparent" />
      <div className="absolute -top-24 right-0 h-44 w-44 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="relative flex h-full flex-col">
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200 p-4 sm:h-60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(255,255,255,0.15)_38%,_rgba(10,10,10,0.08)_100%)]" />
          <img
            src={imageSrc}
            className="featured-product-image relative z-10 h-full w-full object-contain drop-shadow-[0_20px_30px_rgba(15,23,42,0.22)]"
            loading="lazy"
            decoding="async"
            alt={item?.name || 'Product'}
            onError={(event) => {
              event.currentTarget.src = 'https://via.placeholder.com/600x600?text=E-Mart'
            }}
          />
          <div className="absolute left-4 top-4 z-20 rounded-full bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
            Featured
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 bg-white px-5 py-4">
          <div className="space-y-1.5">
            <h3 className="text-xl font-semibold text-slate-900 line-clamp-2">{item?.name}</h3>
            <p className={`text-sm leading-5 text-slate-500 ${showFullDescription ? '' : 'line-clamp-2'}`}>
              {item?.description || 'No description added yet for this product.'}
            </p>
            <button
              type='button'
              onClick={(event) => {
                event.stopPropagation()
                setShowFullDescription((prev) => !prev)
              }}
              className='text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 hover:text-cyan-800'
            >
              {showFullDescription ? 'Collapse Description' : 'View Description'}
            </button>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Price</p>
              <p className="text-2xl font-black text-slate-900">Rs. {item?.price}</p>
            </div>

            <button
              onClick={(event) => {
                event.stopPropagation()
                if (!productId || addToCartPending) return
                addToCart({ productId })
              }}
              disabled={!productId || addToCartPending}
              className="inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-[0_10px_24px_rgba(15,23,42,0.25)] disabled:opacity-70"
            >
              {addToCartPending ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;