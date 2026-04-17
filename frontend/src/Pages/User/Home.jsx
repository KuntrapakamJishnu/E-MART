
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useGetFeaturedProcut } from '@/hooks/product.hook'
import FeaturedProducts from './FeaturedProducts'
import Footer from '@/components/Footer'
import CustomerReview from '@/components/CustomerReview'

const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || visible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -10% 0px',
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [visible])

  return (
    <div
      ref={ref}
      className={`reveal-in ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

const Home = () => {
    const { data: featuredProducts = [], isLoading } = useGetFeaturedProcut()

  const prioritizedFeaturedProducts = useMemo(() => {
    const preferredKeywords = [/hoodie/i, /jeans?/i, /pants?/i]

    const scored = [...featuredProducts].map((item) => {
      const text = `${item?.name || ''} ${item?.description || ''}`
      const score = preferredKeywords.reduce((acc, pattern, index) => {
        if (pattern.test(text)) {
          return acc + (preferredKeywords.length - index)
        }
        return acc
      }, 0)

      return { item, score }
    })

    return scored
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item)
      .slice(0, 6)
  }, [featuredProducts])

  useEffect(() => {
    const heroImage = new Image()
    heroImage.fetchPriority = 'high'
    heroImage.src = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1280&q=65'
  }, [])

  return (
    <div className='min-h-screen w-full overflow-hidden bg-slate-950 text-white'>
      <div className="relative isolate">
        <section className='relative min-h-[82vh] px-6 py-10 lg:px-10'>
          <div
            className='absolute inset-0 -z-10 bg-cover bg-center'
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1280&q=65')"
            }}
          />
          <div className='absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,6,23,0.82)_0%,rgba(2,6,23,0.52)_42%,rgba(2,6,23,0.24)_100%)]' />

          <div className='mx-auto flex min-h-[82vh] max-w-7xl items-end lg:items-center'>
            <Reveal className='w-full max-w-2xl'>
              <div className='rounded-[34px] border border-white/10 bg-slate-950/35 p-6 shadow-[0_32px_100px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8'>
                <p className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/80 backdrop-blur-xl'>
                  <span className='h-2 w-2 rounded-full bg-fuchsia-400' />
                  Campus edit
                </p>

                <h2 className='mt-5 max-w-xl text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl'>
                  Fresh clothes, bold looks, campus-ready style.
                </h2>

                <p className='mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base'>
                  Browse a cleaner, sharper collection with curated fashion pieces, everyday essentials, and standout drops designed for your campus routine.
                </p>

                <div className='mt-8 flex justify-start'>
                  <a
                    href='/product'
                    className='inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-slate-950 shadow-[0_18px_45px_rgba(255,255,255,0.18)] transition-transform duration-300 hover:scale-[1.03]'
                  >
                    Shop Now
                  </a>
                </div>
              </div>
            </Reveal>

            <div className='ml-auto hidden w-full max-w-[380px] gap-4 lg:flex lg:flex-col'>
              <Reveal delay={120}>
                <div className='overflow-hidden rounded-[28px] border border-white/10 bg-white/10 shadow-[0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur-xl'>
                  <img
                    src='https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=720&q=65'
                    alt='Clothing display one'
                    className='h-48 w-full object-cover'
                    loading='lazy'
                    decoding='async'
                  />
                </div>
              </Reveal>
              <Reveal delay={220}>
                <div className='overflow-hidden rounded-[28px] border border-white/10 bg-white/10 shadow-[0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur-xl'>
                  <img
                    src='https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=720&q=65'
                    alt='Clothing display two'
                    className='h-48 w-full object-cover'
                    loading='lazy'
                    decoding='async'
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

      </div>


      <section id='featured-products' className='relative -mt-6 rounded-t-[40px] bg-slate-50 px-6 pb-20 pt-12 text-slate-950 lg:px-10'>
        <div className='mx-auto max-w-7xl'>
          <Reveal className='mb-8 flex items-end justify-between gap-6'>
            <div>
              <p className='text-sm font-bold uppercase tracking-[0.35em] text-fuchsia-500'>Curated selection</p>
              <h2 className='mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl'>Featured Products</h2>
            </div>
            <div className='hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm sm:block'>
              {isLoading ? 'Loading featured products...' : `${prioritizedFeaturedProducts.length} items`} 
            </div>
          </Reveal>

          <Reveal className='mb-6'>
            <div className='flex flex-wrap gap-2'>
              {['Hoodie', 'Jeans', 'Pants'].map((tag) => (
                <span
                  key={tag}
                  className='rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600'
                >
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>

          {prioritizedFeaturedProducts.length === 0 ? (
            <Reveal>
              <div className='rounded-[32px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm'>
                <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl'>✨</div>
                <h3 className='mt-5 text-2xl font-bold'>No featured products yet</h3>
                <p className='mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500'>
                  Once an admin marks products as featured, they will appear here with the new premium card layout.
                </p>
              </div>
            </Reveal>
          ) : (
            <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3'>
              {prioritizedFeaturedProducts.map((item, index) => (
                <Reveal key={item?._id || item?.id || item?.name} delay={index * 90}>
                  <FeaturedProducts item={item} />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <Reveal className='mx-auto mt-20 max-w-7xl'>
          <CustomerReview/>
        </Reveal>
      </section>

      <Footer/>
    </div>
  )
}

export default Home