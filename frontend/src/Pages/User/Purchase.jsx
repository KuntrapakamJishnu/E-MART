import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Package, Home, ArrowRight, ShieldCheck, Sparkles, Star, Rocket, Truck } from 'lucide-react';

const Purchase = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.22),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.2),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,1))]" />
      <div className="pointer-events-none absolute -left-10 top-10 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl animate-float-medium" />
      <div className="pointer-events-none absolute bottom-8 left-1/3 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl animate-glow-pulse" />
      <div className="relative w-full max-w-2xl">
        <div className="glass-panel overflow-hidden rounded-[36px] p-8 sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 backdrop-blur-xl">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Payment confirmed
              </div>
              <h1 className="text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                Order confirmed. Experience delivered.
              </h1>
              <p className="max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                Your transaction is complete and your order has entered fulfillment. Continue shopping or jump to profile for account activity.
              </p>
            </div>

            <div className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-[0_0_80px_rgba(34,211,238,0.18)] animate-glow-pulse">
              <div className="absolute inset-5 rounded-full border border-white/10" />
              <div className="absolute inset-8 rounded-full bg-emerald-400/20 blur-2xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-xl">
                <CheckCircle2 className="h-10 w-10" />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Payment', 'Verified'],
              ['Order', 'Placed'],
              ['Status', 'Processing'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
                <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">{label}</p>
                <p className="mt-2 text-lg font-bold text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-white"><Star className="h-4 w-4 text-amber-300" /> Premium flow</div>
              <p className="mt-2 text-sm text-white/60">Checkout, verification, and confirmation in one polished journey.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-white"><Rocket className="h-4 w-4 text-cyan-300" /> Startup-grade speed</div>
              <p className="mt-2 text-sm text-white/60">Fast response from payment submit to completion state.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-white"><Truck className="h-4 w-4 text-emerald-300" /> Dispatch pipeline</div>
              <p className="mt-2 text-sm text-white/60">Order is queued for fulfillment and delivery updates.</p>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <Package className="mt-0.5 h-5 w-5 text-cyan-300" />
              <div>
                <p className="text-sm font-semibold text-white">What happens next?</p>
                <p className="mt-1 text-sm leading-7 text-white/65">
                  We verified the payment callback and cleared the cart for a clean state. Next upgrades can include invoice generation and full tracking history.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/" className="block flex-1">
              <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-slate-950 transition-transform hover:scale-[1.01]">
                <Home className="h-4 w-4" />
                Back to Home
              </button>
            </Link>

            <Link to="/profile" className="block flex-1">
              <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/8 px-6 text-sm font-bold text-white backdrop-blur-xl transition-transform hover:scale-[1.01]">
                <ArrowRight className="h-4 w-4" />
                Open Profile
              </button>
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.35em] text-white/35">
            <Sparkles className="h-3.5 w-3.5" />
            Premium commerce experience
          </div>
        </div>
      </div>
    </div>
  )
};

export default Purchase;