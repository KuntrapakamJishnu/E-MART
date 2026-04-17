import React, { useState } from 'react'

const CustomerReview = () => {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      rating: 5,
      reviewedAt: "2026-04-12T19:25:00",
      title: "Excellent quality",
      comment: "Great quality, fast delivery, and exactly what I needed.",
      verified: true,
      helpful: 24
    },
    {
      id: 2,
      name: "Priya Patel",
      rating: 4,
      reviewedAt: "2026-04-10T14:10:00",
      title: "Good value",
      comment: "Comfortable fit and solid material for the price.",
      verified: true,
      helpful: 18
    },
    {
      id: 3,
      name: "Amit Kumar",
      rating: 5,
      reviewedAt: "2026-04-08T21:05:00",
      title: "Amazing product",
      comment: "My second purchase here. Quality stays consistent.",
      verified: true,
      helpful: 32
    },
    {
      id: 4,
      name: "Sneha Reddy",
      rating: 4,
      reviewedAt: "2026-04-05T12:40:00",
      title: "Pretty good",
      comment: "On-time delivery and a good overall experience.",
      verified: false,
      helpful: 12
    }
  ])

  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [expandedReviewIds, setExpandedReviewIds] = useState({ [reviews[0]?.id || 1]: true })
  const [likedReviews, setLikedReviews] = useState({})
  const [reviewForm, setReviewForm] = useState({
    name: '',
    rating: 5,
    title: '',
    comment: ''
  })

  // Calculate rating statistics
  const totalReviews = reviews.length
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1)
    : '0.0'
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => 
    reviews.filter(review => review.rating === rating).length
  )

  // Filter reviews
  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(review => review.rating === parseInt(filter))

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'top') return b.rating - a.rating || b.helpful - a.helpful
    if (sortBy === 'helpful') return b.helpful - a.helpful
    return new Date(b.reviewedAt) - new Date(a.reviewedAt)
  })

  const visibleReviews = sortedReviews.slice(0, 3)

  const toggleExpandReview = (reviewId) => {
    setExpandedReviewIds((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
  }

  const toggleLoveReview = (reviewId) => {
    setLikedReviews((prev) => {
      const alreadyLiked = Boolean(prev[reviewId])

      setReviews((current) => current.map((review) => {
        if (review.id !== reviewId) return review
        const nextHelpful = alreadyLiked
          ? Math.max(0, Number(review.helpful || 0) - 1)
          : Number(review.helpful || 0) + 1

        return {
          ...review,
          helpful: nextHelpful
        }
      }))

      return {
        ...prev,
        [reviewId]: !alreadyLiked
      }
    })
  }

  const handleReviewSubmit = (event) => {
    event.preventDefault()

    if (!reviewForm.name.trim() || !reviewForm.title.trim() || !reviewForm.comment.trim()) {
      return
    }

    const newReview = {
      id: Date.now(),
      name: reviewForm.name.trim(),
      rating: Number(reviewForm.rating || 5),
      reviewedAt: new Date().toISOString(),
      title: reviewForm.title.trim(),
      comment: reviewForm.comment.trim(),
      verified: false,
      helpful: 0
    }

    setReviews((prev) => [newReview, ...prev])
    setExpandedReviewIds((prev) => ({ ...prev, [newReview.id]: true }))
    setReviewForm({ name: '', rating: 5, title: '', comment: '' })
  }

  const getPreviewText = (text = '', limit = 145) => {
    const content = String(text || '').trim()
    if (content.length <= limit) return content
    return `${content.slice(0, limit).trim()}...`
  }

  // Star rendering function
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
      {/* Section Header */}
      <div className='text-center mb-12'>
        <div className='mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-gray-500 shadow-sm'>
          Live feedback stream
        </div>
        <h2 className='text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-2'>
          Student Reviews
        </h2>
        <p className='text-gray-600 text-sm'>Quick feedback from students and buyers</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        
        {/* Left Sidebar - Rating Summary */}
        <div className='lg:col-span-1'>
          <div className='bg-white border border-gray-200 rounded-lg p-6 sticky top-4'>
            {/* Overall Rating */}
            <div className='text-center pb-6 border-b border-gray-200'>
              <div className='text-5xl font-bold text-gray-900 mb-2 transition-transform duration-300 hover:scale-105'>
                {averageRating}
              </div>
              <div className='flex items-center justify-center mb-2'>
                {renderStars(Math.round(averageRating))}
              </div>
              <p className='text-sm text-gray-600'>
                Based on {totalReviews} reviews
              </p>
            </div>

            <div className='mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-gray-50 p-2'>
              {[
                { key: 'recent', label: 'Recent' },
                { key: 'top', label: 'Top' },
                { key: 'helpful', label: 'Helpful' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSortBy(item.key)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-300 ${
                    sortBy === item.key
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-transparent text-gray-600 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Rating Breakdown */}
            <div className='pt-6 space-y-3'>
              {[5, 4, 3, 2, 1].map((rating, index) => {
                const count = ratingCounts[index]
                const percentage = (count / totalReviews) * 100
                
                return (
                  <div key={rating} className='flex items-center gap-3'>
                    <button
                      onClick={() => setFilter(rating.toString())}
                      className='flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900'
                    >
                      {rating}
                      <svg className='w-4 h-4 text-yellow-400' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                      </svg>
                    </button>
                    <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                      <div 
                        className='h-full bg-yellow-400 rounded-full'
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className='text-sm text-gray-600 w-8 text-right'>{count}</span>
                  </div>
                )
              })}
            </div>

            {/* Filter Reset */}
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className='w-full mt-6 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors duration-300'
              >
                Show all reviews
              </button>
            )}

            <form onSubmit={handleReviewSubmit} className='mt-6 space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-gray-600'>Write a Review</p>
              <input
                value={reviewForm.name}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder='Your name'
                className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-gray-500'
              />
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-gray-500'
              >
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
              <input
                value={reviewForm.title}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder='Review title'
                className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-gray-500'
              />
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                placeholder='Share your experience'
                className='min-h-20 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-gray-500'
              />
              <button className='w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-gray-800'>
                Submit Review
              </button>
            </form>
          </div>
        </div>

        {/* Right Content - Reviews List */}
        <div className='lg:col-span-2 space-y-6'>
          {filteredReviews.length === 0 ? (
            <div className='text-center py-12 bg-gray-50 rounded-lg border border-gray-200'>
              <p className='text-gray-600'>No reviews found for this rating</p>
            </div>
          ) : (
            visibleReviews.map((review) => (
              <div
                key={review.id}
                className='group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'
                style={{ animationDelay: `${review.id * 90}ms` }}
              >
                {/* Review Header */}
                <button
                  type='button'
                  onClick={() => toggleExpandReview(review.id)}
                  className='flex w-full items-start justify-between gap-4 text-left'
                >
                  <div className='flex items-center gap-3'>
                    {/* User Avatar */}
                    <div className='w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-semibold text-lg transition-transform duration-300 group-hover:scale-105'>
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div className='flex items-center gap-2'>
                        <h3 className='font-semibold text-gray-900'>{review.name}</h3>
                        {review.verified && (
                          <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800'>
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <p className='text-sm text-gray-500'>
                        {new Date(review.reviewedAt).toLocaleString('en-IN', {
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className='rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500 transition-colors duration-300 hover:bg-gray-100'>
                    {expandedReviewIds[review.id] ? 'Collapse' : 'Expand'}
                  </span>
                </button>

                {/* Star Rating */}
                <div className='mt-4 flex items-center mb-3'>
                  {renderStars(review.rating)}
                </div>

                {/* Review Title */}
                <h4 className='font-semibold text-gray-900 mb-2'>
                  {review.title}
                </h4>

                {/* Review Comment */}
                <p className='text-gray-700 leading-relaxed mb-4 transition-all duration-300'>
                  {expandedReviewIds[review.id] ? review.comment : getPreviewText(review.comment)}
                </p>

                {/* Review Footer */}
                <div className='flex items-center gap-4 pt-4 border-t border-gray-200'>
                  <button
                    onClick={() => toggleLoveReview(review.id)}
                    className={`flex items-center gap-2 text-sm ${likedReviews[review.id] ? 'text-rose-600' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5' />
                    </svg>
                    {likedReviews[review.id] ? 'Loved' : 'Love'} ({review.helpful})
                  </button>
                  <button className='text-sm text-gray-600 hover:text-gray-900'>
                    Report
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {filteredReviews.length > visibleReviews.length && (
        <p className='mt-6 text-center text-sm text-gray-500'>Showing the latest 3 reviews to keep the homepage clean.</p>
      )}
    </div>
  )
}

export default CustomerReview