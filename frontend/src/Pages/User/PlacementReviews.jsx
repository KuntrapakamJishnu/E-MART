import React, { useMemo, useState } from 'react'
import {
  useCreateInterviewReviewHook,
  useDeleteInterviewReviewHook,
  useHelpfulInterviewReviewHook,
  useInterviewReviewListHook,
  useInterviewReviewStatsHook,
  useUpdateInterviewReviewHook
} from '@/hooks/interviewReview.hook'
import { useUserStore } from '@/store/userStore'
import { BarChart3, Briefcase, Pencil, ThumbsUp, Trash2 } from 'lucide-react'

const StarRow = ({ rating }) => {
  const rounded = Math.max(1, Math.min(5, Number(rating || 0)))
  return (
    <div className='flex items-center gap-1'>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`text-base ${star <= rounded ? 'text-amber-400' : 'text-slate-300'}`}>
          ★
        </span>
      ))}
    </div>
  )
}

const defaultFormState = {
  companyName: '',
  role: '',
  experienceLevel: 'Fresher',
  rounds: 3,
  hiringProcessRating: 4,
  processSummary: '',
  askedQuestions: '',
  tipsForStudents: '',
  outcome: 'Waiting'
}

const PlacementReviews = () => {
  const user = useUserStore((state) => state.user)
  const role = user?.role || (user?.owner ? 'admin' : 'student')
  const isAdmin = role === 'admin'
  const canReviewManage = isAdmin || (role === 'seller' && user?.isApproved)
  const [companyFilter, setCompanyFilter] = useState('')
  const [minRatingFilter, setMinRatingFilter] = useState(0)
  const [editingId, setEditingId] = useState(null)

  const [formState, setFormState] = useState(defaultFormState)

  const { mutateAsync: createReview, isPending: posting } = useCreateInterviewReviewHook()
  const { mutateAsync: updateReview, isPending: updating } = useUpdateInterviewReviewHook()
  const { mutateAsync: deleteReview, isPending: deleting } = useDeleteInterviewReviewHook()
  const { mutateAsync: toggleHelpful, isPending: helping } = useHelpfulInterviewReviewHook()
  const { data, isLoading } = useInterviewReviewListHook({
    company: companyFilter,
    minRating: minRatingFilter
  })
  const { data: statsData, isLoading: statsLoading } = useInterviewReviewStatsHook()

  const reviews = data?.reviews || []
  const averageRating = data?.averageRating || 0

  const topCompanies = useMemo(() => {
    const map = new Map()
    for (const item of reviews) {
      const key = (item.companyName || 'Unknown').trim()
      map.set(key, (map.get(key) || 0) + 1)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
  }, [reviews])

  const resetForm = () => {
    setFormState(defaultFormState)
    setEditingId(null)
  }

  const submitHandler = async (event) => {
    event.preventDefault()
    if (editingId) {
      await updateReview({ id: editingId, payload: formState })
    } else {
      await createReview(formState)
    }
    resetForm()
  }

  const beginEditReview = (review) => {
    setEditingId(review._id)
    setFormState({
      companyName: review.companyName || '',
      role: review.role || '',
      experienceLevel: review.experienceLevel || 'Fresher',
      rounds: Number(review.rounds || 3),
      hiringProcessRating: Number(review.hiringProcessRating || 4),
      processSummary: review.processSummary || '',
      askedQuestions: review.askedQuestions || '',
      tipsForStudents: review.tipsForStudents || '',
      outcome: review.outcome || 'Waiting'
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteHandler = async (reviewId) => {
    const shouldDelete = window.confirm('Delete this review? This cannot be undone.')
    if (!shouldDelete) return
    await deleteReview(reviewId)
  }

  const companies = statsData?.companies || []
  const roundDistribution = statsData?.roundDistribution || []
  const topQuestionTopics = statsData?.topQuestionTopics || []

  const maxCompanyCount = Math.max(1, ...companies.map((item) => item.total || 0))
  const maxRoundCount = Math.max(1, ...roundDistribution.map((item) => item.count || 0))

  const canSubmit = canReviewManage && !(posting || updating)

  const byCurrentUser = (review) => {
    if (typeof review.isOwner === 'boolean') return review.isOwner
    return String(review?.author?._id || '') === String(user?._id || '')
  }

  return (
    <div className='min-h-screen bg-slate-950'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.18),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,1))]' />
      <div className='relative mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8'>
        <div className='mb-6 rounded-[34px] border border-white/15 bg-white/10 p-6 text-white backdrop-blur-2xl shadow-[0_24px_80px_rgba(2,6,23,0.42)]'>
          <p className='inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300'>
            <Briefcase className='h-4 w-4' />
            Placement Community Hub
          </p>
          <h1 className='mt-3 text-3xl font-black tracking-[-0.05em] sm:text-4xl'>Interview Intelligence Board</h1>
          <p className='mt-3 max-w-3xl text-sm leading-7 text-white/70'>
            Real interview experiences, hiring process quality ratings, common question themes, and survival tips from peers.
          </p>

          <div className='mt-6 grid gap-3 sm:grid-cols-4'>
            <div className='rounded-2xl border border-white/10 bg-white/10 p-4'>
              <p className='text-xs uppercase tracking-[0.22em] text-white/45'>Total Reviews</p>
              <p className='mt-2 text-3xl font-black text-white'>{data?.total || 0}</p>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/10 p-4'>
              <p className='text-xs uppercase tracking-[0.22em] text-white/45'>Avg Hiring Rating</p>
              <p className='mt-2 text-3xl font-black text-white'>{averageRating}</p>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/10 p-4'>
              <p className='text-xs uppercase tracking-[0.22em] text-white/45'>Selection Rate</p>
              <p className='mt-2 text-3xl font-black text-white'>{statsData?.selectionRate || 0}%</p>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/10 p-4'>
              <p className='text-xs uppercase tracking-[0.22em] text-white/45'>Top Discussed</p>
              <p className='mt-2 text-sm font-semibold text-white/90'>
                {topCompanies.length ? topCompanies.map(([name]) => name).join(', ') : 'No data yet'}
              </p>
            </div>
          </div>
        </div>

        <div className={canReviewManage ? 'grid gap-6 xl:grid-cols-[1.1fr_0.9fr]' : 'grid gap-6'}>
          {canReviewManage ? (
          <section className='rounded-[32px] border border-white/15 bg-white/95 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.22)]'>
            <div className='mb-2 flex items-center justify-between'>
              <h2 className='text-xl font-black tracking-[-0.03em] text-slate-900'>
                {editingId ? 'Edit Your Review' : 'Post New Interview Review'}
              </h2>
              {editingId ? (
                <button
                  type='button'
                  onClick={resetForm}
                  className='rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600'
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
            <p className='text-sm text-slate-500'>Document interview rounds and insights so the next student is better prepared.</p>

            <form onSubmit={submitHandler} className='mt-4 space-y-3'>
              <div className='grid gap-3 sm:grid-cols-2'>
                <input
                  value={formState.companyName}
                  onChange={(e) => setFormState((prev) => ({ ...prev, companyName: e.target.value }))}
                  placeholder='Company name'
                  className='h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-400'
                  disabled={!canReviewManage}
                  required
                />
                <input
                  value={formState.role}
                  onChange={(e) => setFormState((prev) => ({ ...prev, role: e.target.value }))}
                  placeholder='Role (SDE, Analyst, Intern...)'
                  className='h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-400'
                  disabled={!canReviewManage}
                  required
                />
              </div>

              <div className='grid gap-3 sm:grid-cols-3'>
                <select
                  value={formState.experienceLevel}
                  onChange={(e) => setFormState((prev) => ({ ...prev, experienceLevel: e.target.value }))}
                  className='h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-400'
                  disabled={!canReviewManage}
                >
                  <option value='Intern'>Intern</option>
                  <option value='Fresher'>Fresher</option>
                  <option value='1-2 years'>1-2 years</option>
                  <option value='3+ years'>3+ years</option>
                </select>

                <input
                  type='number'
                  min={1}
                  max={20}
                  value={formState.rounds}
                  onChange={(e) => setFormState((prev) => ({ ...prev, rounds: Number(e.target.value) }))}
                  className='h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-400'
                  placeholder='Rounds'
                  disabled={!canReviewManage}
                  required
                />

                <select
                  value={formState.hiringProcessRating}
                  onChange={(e) => setFormState((prev) => ({ ...prev, hiringProcessRating: Number(e.target.value) }))}
                  className='h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-400'
                  disabled={!canReviewManage}
                >
                  <option value={1}>1/5</option>
                  <option value={2}>2/5</option>
                  <option value={3}>3/5</option>
                  <option value={4}>4/5</option>
                  <option value={5}>5/5</option>
                </select>
              </div>

              <textarea
                value={formState.processSummary}
                onChange={(e) => setFormState((prev) => ({ ...prev, processSummary: e.target.value }))}
                placeholder='Hiring process overview (round flow, timeline, evaluation style...)'
                className='min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400'
                disabled={!canReviewManage}
                required
              />

              <textarea
                value={formState.askedQuestions}
                onChange={(e) => setFormState((prev) => ({ ...prev, askedQuestions: e.target.value }))}
                placeholder='Questions asked (technical/HR/coding)'
                className='min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400'
                disabled={!canReviewManage}
              />

              <textarea
                value={formState.tipsForStudents}
                onChange={(e) => setFormState((prev) => ({ ...prev, tipsForStudents: e.target.value }))}
                placeholder='Tips for students preparing for this company'
                className='min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400'
                disabled={!canReviewManage}
              />

              <select
                value={formState.outcome}
                onChange={(e) => setFormState((prev) => ({ ...prev, outcome: e.target.value }))}
                className='h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-400'
                disabled={!canReviewManage}
              >
                <option value='Selected'>Selected</option>
                <option value='Rejected'>Rejected</option>
                <option value='Waiting'>Waiting</option>
                <option value='Offer Declined'>Offer Declined</option>
              </select>

              <button
                type='submit'
                disabled={!canSubmit}
                className='inline-flex h-11 items-center justify-center rounded-xl bg-[length:200%_200%] bg-gradient-to-r from-slate-950 via-fuchsia-600 to-cyan-500 px-5 text-sm font-semibold text-white transition-transform duration-300 animate-sweep hover:scale-[1.01] disabled:opacity-60'
              >
                {posting || updating ? 'Saving...' : editingId ? 'Update Review' : 'Post Review'}
              </button>
            </form>
          </section>
          ) : null}

          <section className={canReviewManage ? 'space-y-6' : ''}>
            {isAdmin ? (
            <div className='rounded-[32px] border border-white/15 bg-white/95 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.22)]'>
              <h3 className='inline-flex items-center gap-2 text-lg font-black text-slate-900'>
                <BarChart3 className='h-5 w-5 text-fuchsia-500' />
                Company Insights Dashboard
              </h3>
              {statsLoading ? (
                <p className='mt-3 text-sm text-slate-500'>Loading insights...</p>
              ) : (
                <div className='mt-4 space-y-4'>
                  <div>
                    <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Company Activity</p>
                    <div className='mt-2 space-y-2'>
                      {companies.slice(0, 5).map((item) => (
                        <div key={item.companyName}>
                          <div className='mb-1 flex items-center justify-between text-xs text-slate-600'>
                            <span>{item.companyName}</span>
                            <span>{item.total} reviews • {item.averageRating}/5</span>
                          </div>
                          <div className='h-2 overflow-hidden rounded-full bg-slate-200'>
                            <div
                              className='h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500'
                              style={{ width: `${Math.max(12, (item.total / maxCompanyCount) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Most Common Rounds</p>
                    <div className='mt-2 grid grid-cols-3 gap-2'>
                      {(statsData?.mostCommonRounds || []).map((item) => (
                        <div key={item.rounds} className='rounded-xl border border-slate-200 bg-slate-50 p-2 text-center'>
                          <p className='text-lg font-black text-slate-900'>{item.rounds}</p>
                          <p className='text-[11px] uppercase tracking-[0.2em] text-slate-400'>Rounds</p>
                          <p className='text-xs text-slate-500'>{item.count} reviews</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Round Distribution</p>
                    <div className='mt-2 space-y-1.5'>
                      {roundDistribution.slice(0, 7).map((item) => (
                        <div key={item.rounds} className='flex items-center gap-2 text-xs'>
                          <span className='w-16 text-slate-500'>{item.rounds} rounds</span>
                          <div className='h-2 flex-1 overflow-hidden rounded-full bg-slate-200'>
                            <div
                              className='h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400'
                              style={{ width: `${Math.max(8, (item.count / maxRoundCount) * 100)}%` }}
                            />
                          </div>
                          <span className='text-slate-500'>{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Common Interview Topics</p>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {topQuestionTopics.slice(0, 10).map((item) => (
                        <span key={item.topic} className='rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600'>
                          {item.topic} ({item.count})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            ) : null}

            <div className='rounded-[32px] border border-white/15 bg-white/95 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.22)]'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <h2 className='text-xl font-black text-slate-900'>Community Interview Feed</h2>
              <div className='flex gap-2'>
                <input
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  placeholder='Filter company'
                  className='h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-cyan-400'
                />
                <select
                  value={minRatingFilter}
                  onChange={(e) => setMinRatingFilter(Number(e.target.value))}
                  className='h-10 rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-cyan-400'
                >
                  <option value={0}>All</option>
                  <option value={3}>3+ star</option>
                  <option value={4}>4+ star</option>
                  <option value={5}>5 star</option>
                </select>
              </div>
            </div>

            <div className='mt-4 max-h-[760px] space-y-3 overflow-y-auto pr-1'>
              {isLoading ? (
                <p className='text-sm text-slate-500'>Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className='text-sm text-slate-500'>No interview reviews yet. Be the first one to help your batch.</p>
              ) : (
                reviews.map((review) => (
                  <article key={review._id} className='rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm'>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <h3 className='text-base font-bold text-slate-900'>
                          {review.companyName} • {review.role}
                        </h3>
                        <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>
                          {review.experienceLevel} • {review.rounds} rounds • {review.outcome}
                        </p>
                      </div>
                      <div className='text-right'>
                        <StarRow rating={review.hiringProcessRating} />
                        <p className='mt-1 text-xs text-slate-500'>Hiring: {review.hiringProcessRating}/5</p>
                      </div>
                    </div>

                    <p className='mt-3 text-sm leading-7 text-slate-700'>{review.processSummary}</p>

                    {review.askedQuestions ? (
                      <p className='mt-2 text-sm text-slate-600'>
                        <span className='font-semibold text-slate-800'>Questions:</span> {review.askedQuestions}
                      </p>
                    ) : null}

                    {review.tipsForStudents ? (
                      <p className='mt-2 text-sm text-slate-600'>
                        <span className='font-semibold text-slate-800'>Tips:</span> {review.tipsForStudents}
                      </p>
                    ) : null}

                    <p className='mt-3 text-xs text-slate-400'>
                      Posted by {review?.author?.name || 'Anonymous'} • {new Date(review.createdAt).toLocaleDateString()}
                    </p>

                    <div className='mt-3 flex flex-wrap items-center gap-2'>
                      {canReviewManage ? (
                        <button
                          onClick={() => toggleHelpful(review._id)}
                          disabled={helping}
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            review.isHelpfulByViewer
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <ThumbsUp className='h-3.5 w-3.5' />
                          Helpful ({review.helpfulVotes || 0})
                        </button>
                      ) : (
                        <span className='inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600'>
                          <ThumbsUp className='h-3.5 w-3.5' />
                          Helpful ({review.helpfulVotes || 0})
                        </span>
                      )}

                      {canReviewManage && byCurrentUser(review) ? (
                        <>
                          <button
                            onClick={() => beginEditReview(review)}
                            className='inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700'
                          >
                            <Pencil className='h-3.5 w-3.5' />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteHandler(review._id)}
                            disabled={deleting}
                            className='inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700'
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                            Delete
                          </button>
                        </>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default PlacementReviews
