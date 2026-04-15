import React, { useMemo, useState } from 'react'
import { Bot, MessageCircle, PackageSearch, Send, Sparkles, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAiChatHook, useAiRecommendationsHook } from '@/hooks/ai.hook'
import { getAiRecommendationsApi } from '@/Api/ai.api'

const AIProductAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! Ask me anything about products, budget, category, or what to buy next.'
    }
  ])

  const { mutateAsync: chatWithAi, isPending } = useAiChatHook()
  const { data: recommendationData, isFetching: isRecoLoading } = useAiRecommendationsHook(activeQuery, 3)

  const recommendations = useMemo(() => recommendationData?.products || [], [recommendationData])

  const triggerQuickPrompt = async (prompt) => {
    if (isPending) return
    const nextHistory = [...messages, { role: 'user', content: prompt }]
    setMessages(nextHistory)
    setActiveQuery(prompt)

    try {
      const response = await chatWithAi({
        message: prompt,
        history: nextHistory.slice(-8)
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response?.reply || 'I could not find a good answer right now.'
        }
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I could not process that now. Please try again.'
        }
      ])
    }
  }

  const sendMessage = async (event) => {
    event.preventDefault()
    const message = input.trim()
    if (!message || isPending) return

    const nextHistory = [...messages, { role: 'user', content: message }]
    setMessages(nextHistory)
    setActiveQuery(message)
    setInput('')

    try {
      const response = await chatWithAi({
        message,
        history: nextHistory.slice(-8)
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response?.reply || 'I could not find a good answer right now.'
        }
      ])
    } catch (error) {
      const serverMessage = error?.response?.data?.message
      try {
        const fallbackReco = await getAiRecommendationsApi({ query: message, limit: 3 })
        const fallbackItems = fallbackReco?.products || []

        if (fallbackItems.length > 0) {
          const text = fallbackItems
            .map((item) => `- ${item.name} (${item.category}) | Rs. ${item.price}`)
            .join('\n')

          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `I had a temporary chat issue, but here are the best matches for your query:\n${text}`
            }
          ])
          return
        }
      } catch {
        // Ignore nested fallback failure and surface a concise message below.
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: serverMessage || 'Something went wrong. Please try again.'
        }
      ])
    }
  }

  return (
    <div className='fixed bottom-5 right-5 z-[70]'>
      {isOpen ? (
        <div className='w-[350px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(2,6,23,0.28)] sm:w-[410px]'>
          <div className='border-b border-slate-100 bg-gradient-to-r from-slate-950 to-slate-800 px-4 py-3 text-white'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Bot className='h-4 w-4 text-cyan-300' />
                <div>
                  <p className='text-sm font-semibold'>Shopping Assistant</p>
                  <p className='text-[11px] text-slate-300'>Recommendations, support, and order tracking</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className='rounded-md p-1 text-slate-300 transition-colors hover:bg-white/10 hover:text-white'
                aria-label='Close assistant'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            <div className='mt-3 flex flex-wrap gap-2'>
              <button
                onClick={() => triggerQuickPrompt('Recommend good products under 1000')}
                className='rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90'
              >
                Under 1000
              </button>
              <button
                onClick={() => triggerQuickPrompt('Suggest best products for summer')}
                className='rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90'
              >
                Summer Picks
              </button>
              <button
                onClick={() => triggerQuickPrompt('Track my latest order status')}
                className='inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90'
              >
                <PackageSearch className='h-3 w-3' />
                Track Order
              </button>
            </div>
          </div>

          <div className='h-[300px] space-y-2 overflow-y-auto bg-slate-50 p-3'>
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`max-w-[88%] rounded-xl px-3 py-2 text-sm ${
                  item.role === 'user' ? 'ml-auto bg-cyan-500 text-white' : 'bg-white text-slate-700 shadow-sm'
                }`}
              >
                {item.content}
              </div>
            ))}
          </div>

          <div className='border-t border-slate-100 bg-white p-3'>
            <form onSubmit={sendMessage} className='flex gap-2'>
              <input
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Ask products, deals, or track your order...'
                className='h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-cyan-400'
              />
              <button
                type='submit'
                disabled={isPending}
                className='inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white transition-colors hover:bg-slate-800 disabled:opacity-60'
                aria-label='Send message'
              >
                <Send className='h-4 w-4' />
              </button>
            </form>

            <div className='mt-3 rounded-lg bg-slate-50 p-2'>
              <p className='mb-2 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
                <Sparkles className='h-3.5 w-3.5 text-fuchsia-500' />
                Top Recommendations
              </p>
              {isRecoLoading ? (
                <p className='text-xs text-slate-500'>Finding best matches...</p>
              ) : recommendations.length === 0 ? (
                <p className='text-xs text-slate-500'>Ask a product question to get recommendations.</p>
              ) : (
                <div className='space-y-2'>
                  {recommendations.map((item) => (
                    <Link
                      key={item._id}
                      to={`/product/${item._id}`}
                      onClick={() => setIsOpen(false)}
                      className='flex items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700'
                    >
                      <span className='truncate pr-2'>{item.name}</span>
                      <span className='font-semibold text-slate-900'>Rs. {item.price}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_45px_rgba(2,6,23,0.38)] transition-transform hover:scale-[1.03]'
          aria-label='Open AI product assistant'
        >
          <MessageCircle className='h-4 w-4 text-cyan-300' />
          Assistant
        </button>
      )}
    </div>
  )
}

export default AIProductAssistant
