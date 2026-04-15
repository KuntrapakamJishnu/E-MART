import { useGetDailySalesData, useGetDashBoardData } from '@/hooks/dashboard.hook'
import React, { useMemo } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BarChart3, DollarSign, Package, ShoppingBag, Users } from 'lucide-react'

const AnalyticDashboard = () => {
  const {data} = useGetDashBoardData()
 
  const {startDate, endDate} = useMemo(() => {
    const end = new Date()
    const start = new Date()

    start.setDate(end.getDate() - 7)
    end.setDate(end.getDate() + 2)

    const toStr = (d) => d.toISOString().split("T")[0]

    return {
      startDate: toStr(start),
      endDate: toStr(end)
    }
  }, [])

  const {data: dailySales} = useGetDailySalesData(startDate, endDate)

  const statCards = [
    {
      label: 'Total Users',
      value: data?.users || 0,
      icon: Users,
      tone: 'from-cyan-500 to-blue-500'
    },
    {
      label: 'Total Products',
      value: data?.products || 0,
      icon: Package,
      tone: 'from-fuchsia-500 to-rose-500'
    },
    {
      label: 'Total Revenue',
      value: `Rs. ${data?.totalRevenue || 0}`,
      icon: DollarSign,
      tone: 'from-emerald-500 to-lime-500'
    },
    {
      label: 'Total Sales',
      value: data?.totalSales || 0,
      icon: ShoppingBag,
      tone: 'from-violet-500 to-indigo-500'
    }
  ]

  return (
    <div className='min-h-screen'>
      <div className='mx-auto max-w-[1450px] px-6 py-8 lg:px-8'>
        
        {/* Page Title */}
        <div className='mb-8 overflow-hidden rounded-[30px] border border-white/15 bg-white/10 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.35)] backdrop-blur-2xl'>
          <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300'>
                <BarChart3 className='h-4 w-4' />
                Revenue Intelligence
              </p>
              <h1 className='mt-3 text-3xl font-black tracking-[-0.04em] text-white lg:text-4xl'>Analytics Dashboard</h1>
              <p className='mt-2 text-sm text-white/70'>Live metrics, conversion trends, and business velocity across your storefront.</p>
            </div>
            <div className='rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs uppercase tracking-[0.24em] text-white/70'>
              Last 7 days + projected horizon
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4'>
          {statCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className='rounded-[26px] border border-white/15 bg-white/10 p-5 text-white shadow-[0_20px_45px_rgba(15,23,42,0.28)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1.5'
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <p className='text-xs uppercase tracking-[0.24em] text-white/60'>{card.label}</p>
                    <p className='mt-3 text-3xl font-black text-white'>{card.value}</p>
                  </div>
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r ${card.tone} text-white`}>
                    <Icon className='h-5 w-5' />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Chart Section */}
        <div className='rounded-[30px] border border-white/15 bg-white/95 p-6 shadow-[0_26px_70px_rgba(15,23,42,0.22)]'>
          <h2 className='text-xl font-black tracking-[-0.03em] text-slate-900 mb-1'>Sales and Revenue Trendline</h2>
          <p className='text-sm text-slate-500'>Correlated sales count and revenue over the selected timeline.</p>
          
          <div className='mt-5 h-[430px] w-full'>
            <ResponsiveContainer>
              <LineChart data={dailySales || []} margin={{ left: 10, right: 10, top: 16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                <XAxis 
                  dataKey="date"
                  tick={{fontSize: 12, fill: '#6b7280'}}
                  stroke="#d1d5db"
                />
                <YAxis 
                  yAxisId='left'
                  tick={{fontSize: 12, fill: '#6b7280'}}
                  stroke="#d1d5db"
                />
                <YAxis 
                  yAxisId='right'
                  orientation='right'
                  tick={{fontSize: 12, fill: '#6b7280'}}
                  tickFormatter={(v) => `$${v}`}
                  stroke="#d1d5db"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}
                />
                <Legend 
                  wrapperStyle={{fontSize: '14px'}}
                />
                <Line
                  yAxisId='left'
                  type='monotone'
                  dataKey='sales'
                  stroke='#0ea5e9'
                  strokeWidth={3}
                  name='Sales'
                  dot={{r: 4, fill: '#0ea5e9'}}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='revenue'
                  stroke='#d946ef'
                  strokeWidth={3}
                  name='Revenue (Rs.)'
                  dot={{r: 4, fill: '#d946ef'}}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticDashboard