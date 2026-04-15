import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Sparkles, Wand2 } from 'lucide-react'
import { useAiChatHook, useAiRecommendationsHook, useGenerateAiDescriptionHook } from '@/hooks/ai.hook'

const AIAssistant = () => {
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I can help with shopping suggestions, budget picks, and product copy.'
    }
  ])

  const [recommendInput, setRecommendInput] = useState('')
  const [activeRecommendQuery, setActiveRecommendQuery] = useState('')

  const [formState, setFormState] = useState({
    title: '',
    category: '',
    keywords: '',
    tone: 'friendly'
  })

  const [generatedDescription, setGeneratedDescription] = useState('')

  const { mutateAsync: chatWithAi, isPending: isChatPending } = useAiChatHook()
  const { mutateAsync: generateDescription, isPending: isDescriptionPending } = useGenerateAiDescriptionHook()
  const { data: recommendationData, isFetching: isRecommendationLoading } = useAiRecommendationsHook(activeRecommendQuery, 6)

  const recommendedProducts = useMemo(() => recommendationData?.products || [], [recommendationData])

  const sendChatMessage = async (event) => {
    event.preventDefault()
    const trimmed = chatInput.trim()
    if (!trimmed || isChatPending) return

    const history = [...messages, { role: 'user', content: trimmed }]
    setMessages(history)
    setChatInput('')

    try {
      const res = await chatWithAi({
        message: trimmed,
        history: history.slice(-8)
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res?.reply || 'No response generated.'
        }
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I could not process that right now. Please try again.'
        }
      ])
    }
  }

  const handleRecommendationSubmit = (event) => {
    event.preventDefault()
    setActiveRecommendQuery(recommendInput.trim())
  }

  const handleDescriptionSubmit = async (event) => {
    event.preventDefault()
    if (!formState.title.trim() || !formState.category.trim()) return

    const res = await generateDescription(formState)
    setGeneratedDescription(res?.description || '')
  }

  return (
    <div className='min-h-screen bg-slate-950 text-white'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='mb-8 rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <p className='text-xs uppercase tracking-[0.32em] text-cyan-300'>Gemini powered</p>
              <h1 className='mt-2 text-3xl font-black tracking-tight sm:text-4xl'>AI Studio</h1>
              <p className='mt-3 max-w-3xl text-sm text-white/70'>
                Chat for shopping help, get AI recommendations, and generate premium product descriptions.
              </p>
            </div>
            <div className='rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/80'>
              <span className='inline-flex items-center gap-2'>
                <Sparkles className='h-4 w-4 text-fuchsia-300' />
                Built for VIT Campus space
              </span>
            </div>
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-2'>
          <section className='rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl'>
            <div className='mb-4 flex items-center gap-2'>
              <Bot className='h-5 w-5 text-cyan-300' />
              <h2 className='text-xl font-bold'>AI Chatbot</h2>
            </div>

            <div className='mb-4 h-72 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-3'>
              {messages.map((msg, index) => (
                <div
                  key={`${msg.role}-${index}`}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === 'user' ? 'ml-auto bg-cyan-500/25 text-cyan-50' : 'bg-white/10 text-white/90'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            <form onSubmit={sendChatMessage} className='flex gap-2'>
              <input
                type='text'
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder='Ask: best outfit under 2000 for campus fest'
                className='h-11 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-sm outline-none placeholder:text-white/45 focus:border-cyan-300'
              />
              <button
                type='submit'
                disabled={isChatPending}
                className='h-11 rounded-xl bg-cyan-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70'
              >
                {isChatPending ? 'Thinking...' : 'Send'}
              </button>
            </form>
          </section>

          <section className='rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl'>
            <div className='mb-4 flex items-center gap-2'>
              <Sparkles className='h-5 w-5 text-fuchsia-300' />
              <h2 className='text-xl font-bold'>Smart Recommendations</h2>
            </div>

            <form onSubmit={handleRecommendationSubmit} className='mb-4 flex gap-2'>
              <input
                type='text'
                value={recommendInput}
                onChange={(e) => setRecommendInput(e.target.value)}
                placeholder='Try: streetwear shoes under 3000'
                className='h-11 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-sm outline-none placeholder:text-white/45 focus:border-fuchsia-300'
              />
              <button type='submit' className='h-11 rounded-xl bg-fuchsia-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-fuchsia-300'>
                Find
              </button>
            </form>

            <div className='space-y-3'>
              {isRecommendationLoading && <p className='text-sm text-white/70'>Finding best matches...</p>}
              {!isRecommendationLoading && activeRecommendQuery && recommendedProducts.length === 0 && (
                <p className='text-sm text-white/70'>No close matches found. Try a broader query.</p>
              )}

              {recommendedProducts.map((item) => (
                <div key={item._id} className='rounded-2xl border border-white/15 bg-white/10 p-3'>
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <p className='font-semibold'>{item.name}</p>
                      <p className='text-xs text-white/70'>{item.category} • Rs. {item.price}</p>
                    </div>
                    <Link to={`/product/${item._id}`} className='rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-950'>
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className='mt-6 rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl'>
          <div className='mb-4 flex items-center gap-2'>
            <Wand2 className='h-5 w-5 text-emerald-300' />
            <h2 className='text-xl font-bold'>AI Product Description Generator</h2>
          </div>

          <form onSubmit={handleDescriptionSubmit} className='grid gap-3 md:grid-cols-2'>
            <input
              type='text'
              value={formState.title}
              onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
              placeholder='Product title'
              className='h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm outline-none placeholder:text-white/45 focus:border-emerald-300'
            />
            <input
              type='text'
              value={formState.category}
              onChange={(e) => setFormState((prev) => ({ ...prev, category: e.target.value }))}
              placeholder='Category'
              className='h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm outline-none placeholder:text-white/45 focus:border-emerald-300'
            />
            <input
              type='text'
              value={formState.keywords}
              onChange={(e) => setFormState((prev) => ({ ...prev, keywords: e.target.value }))}
              placeholder='Keywords (comma separated)'
              className='h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm outline-none placeholder:text-white/45 focus:border-emerald-300 md:col-span-2'
            />
            <select
              value={formState.tone}
              onChange={(e) => setFormState((prev) => ({ ...prev, tone: e.target.value }))}
              className='h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm outline-none focus:border-emerald-300'
            >
              <option value='friendly' className='text-slate-900'>Friendly</option>
              <option value='premium' className='text-slate-900'>Premium</option>
              <option value='minimal' className='text-slate-900'>Minimal</option>
              <option value='bold' className='text-slate-900'>Bold</option>
            </select>
            <button
              type='submit'
              disabled={isDescriptionPending}
              className='h-11 rounded-xl bg-emerald-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-70'
            >
              {isDescriptionPending ? 'Generating...' : 'Generate'}
            </button>
          </form>

          {generatedDescription && (
            <div className='mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm leading-7 text-emerald-50'>
              {generatedDescription}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AIAssistant
