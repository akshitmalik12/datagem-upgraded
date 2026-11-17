import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles, Terminal, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' | 'yearly'

  const plans = [
    {
      name: "Starter Analyst",
      badge: "Free Tier",
      price_monthly_inr: "₹0",
      price_monthly_usd: "$0",
      description: "For individual founders and solo operators exploring datasets.",
      features: [
        "15 Natural Language queries / day",
        "CSV & Excel upload support",
        "Instant Plotly interactive charts",
        "Standard execution sandbox",
        "Community support"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Automated Watchdog",
      badge: "Most Popular",
      price_monthly_inr: "₹9,999",
      price_monthly_usd: "$129",
      description: "Autonomous reporting, live connectors, and weekly executive briefings.",
      features: [
        "Unlimited queries & DuckDB streaming",
        "Shopify & Google Sheets live connectors",
        "PostgreSQL & Supabase direct sync",
        "Zero-Trust E2B MicroVM Sandboxes",
        "Monday 8 AM Slack & Email Briefings",
        "Verified Math & SQL formula export",
        "Priority founder WhatsApp support"
      ],
      cta: "Start 14-Day Free Pilot",
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 font-sans tracking-tight py-20 px-6 relative overflow-hidden selection:bg-emerald-500 selection:text-black">
      
      {/* Floating Deep Cyan-Blue & Emerald Ambient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-sky-600/15 blur-[160px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.25, 1], rotate: [0, -45, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-15%] -right-[10%] w-[65vw] h-[65vw] rounded-full bg-emerald-600/10 blur-[170px]" 
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Navigation back */}
        <div className="flex justify-between items-center mb-16">
          <Link to="/chat" className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-sky-300 transition-colors">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>← Back to Studio</span>
          </Link>
          <span className="text-xs font-mono text-slate-500">Dual-Rail: Razorpay (India) + Stripe (Global)</span>
        </div>

        {/* Pricing Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-mono uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> High-Ticket B2B Wedge
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Transparent pricing for <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-emerald-300 to-white drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              continuous intelligence.
            </span>
          </h1>
          <p className="text-sm text-slate-400 font-light leading-relaxed">
            Replace 20+ hours of manual spreadsheet reporting with automated Monday briefings and verified calculations.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, borderColor: p.popular ? 'rgba(16, 185, 129, 0.8)' : 'rgba(2, 132, 199, 0.8)' }}
              className={`p-8 rounded-3xl backdrop-blur-xl transition-all relative overflow-hidden flex flex-col justify-between ${
                p.popular
                  ? 'bg-[#090D14]/95 border-2 border-emerald-500/50 shadow-[0_20px_50px_rgba(16,185,129,0.25)]'
                  : 'bg-slate-950/70 border border-slate-800'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-lg text-slate-100">{p.name}</span>
                  <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                    p.popular
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    {p.badge}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{p.price_monthly_inr}</span>
                  <span className="text-xs font-mono text-slate-400">/ month</span>
                  <span className="text-xs font-mono text-slate-500 ml-2">({p.price_monthly_usd})</span>
                </div>

                <p className="text-xs text-slate-400 font-light mb-6 leading-relaxed">
                  {p.description}
                </p>

                <div className="border-t border-slate-800/80 pt-6 mb-8 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Features Included:</span>
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Snappy Keycap CTA */}
              <motion.button
                whileHover={{ scale: 1.02, borderColor: p.popular ? '#34D399' : '#38BDF8' }}
                whileTap={{ scale: 0.96, y: 1 }}
                transition={{ duration: 0.06 }}
                onClick={() => alert(`Starting setup for ${p.name}. Razorpay / Stripe gateway trigger.`)}
                className={`w-full py-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                  p.popular
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400'
                    : 'bg-slate-900 border border-slate-700 text-slate-200 hover:border-sky-500'
                }`}
              >
                <span>{p.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
