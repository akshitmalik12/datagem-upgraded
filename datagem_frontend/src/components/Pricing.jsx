import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles, Terminal, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CheckoutModal from './CheckoutModal';

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' | 'yearly'
  const [currency, setCurrency] = useState('INR'); // 'INR' | 'USD'
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);

  const plans = [
    {
      id: "starter",
      name: "Starter Analyst",
      badge: "Free Exploration",
      price_monthly_inr: "₹0",
      price_monthly_usd: "$0",
      price_yearly_inr: "₹0",
      price_yearly_usd: "$0",
      description: "For individual founders and solo operators exploring small datasets.",
      features: [
        "15 Natural Language queries / day",
        "CSV & Excel upload support (up to 10MB)",
        "Instant Plotly interactive charts",
        "Standard execution sandbox",
        "Community support"
      ],
      cta: "Get Started Free",
      popular: false,
      tierColor: "sky"
    },
    {
      id: "pro",
      name: "Pro Growth",
      badge: "High Value",
      price_monthly_inr: "₹2,499",
      price_monthly_usd: "$29",
      price_yearly_inr: "₹1,999",
      price_yearly_usd: "$24",
      description: "For growing merchants needing unlimited queries and dispute recovery.",
      features: [
        "150 DuckDB OLAP queries / day",
        "100MB dataset file uploads",
        "Bi-weekly Watchdog Sentinel (Mon & Thu 8:00 AM alerts)",
        "Google Sheets & CSV live synchronization",
        "3 1-Click Amazon/Flipkart Dispute Filings / mo",
        "Full Dynamic CM3 & Hidden Bleeder Ledger",
        "Email support (24h SLA)"
      ],
      cta: "Start 14-Day Pro Pilot",
      popular: false,
      tierColor: "cyan"
    },
    {
      id: "operator",
      name: "Autonomous Operator with Continuous Intelligence",
      badge: "Flagship Engine",
      price_monthly_inr: "₹7,999",
      price_monthly_usd: "$99",
      price_yearly_inr: "₹6,499",
      price_yearly_usd: "$79",
      description: "Hands-free continuous intelligence, scheduled briefings, and unlimited dispute recovery.",
      features: [
        "Everything in Pro Growth with Unlimited queries",
        "Full Custom Watchdog Sentinel (Custom days, hours & daily alerts)",
        "Unlimited 1-Click Amazon/Flipkart Dispute Claims & PDF export",
        "Live Marketplace Connectors (Amazon SP-API, Flipkart & Shopify)",
        "Price Elasticity & Cash Contribution Simulator",
        "500MB dataset vault storage with Snappy Parquet",
        "Priority WhatsApp & Founder Support (3 Team Seats)"
      ],
      cta: "Deploy Autonomous Engine",
      popular: true,
      tierColor: "emerald"
    },
    {
      id: "enterprise",
      name: "Enterprise Scale",
      badge: "Full Power",
      price_monthly_inr: "₹24,999",
      price_monthly_usd: "$299",
      price_yearly_inr: "₹19,999",
      price_yearly_usd: "$249",
      description: "For multi-brand aggregators, large catalogs, and data engineering teams.",
      features: [
        "Everything in Autonomous Operator",
        "5GB+ out-of-core Parquet & DuckDB processing",
        "Postgres, Snowflake, BigQuery & Supabase direct sync",
        "Custom Dedicated Sandbox Cluster compute",
        "Multi-user Workspaces & Role-Based Access Control (RBAC)",
        "Audit Trail Compliance Logging & SLA Guarantee",
        "Dedicated Solutions Engineer & Custom Normalizer"
      ],
      cta: "Talk to Enterprise Sales",
      popular: false,
      tierColor: "sky"
    }
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 font-sans tracking-tight py-16 px-4 sm:px-6 relative overflow-hidden selection:bg-emerald-500 selection:text-black">
      
      {/* Deep Obsidian & Cyan Ambient Glow */}
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

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Navigation back */}
        <div className="flex justify-between items-center mb-12">
          <Link to="/chat" className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-sky-300 transition-colors">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>← Back to CRM Studio</span>
          </Link>
          <span className="text-xs font-mono text-slate-500">Dual-Rail: Razorpay (India) + Stripe (Global)</span>
        </div>

        {/* Pricing Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-mono uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> High-Density Value Ladder
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 font-sans">
            Predictable pricing for <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 drop-shadow-[0_0_25px_rgba(56,189,248,0.3)]">
              continuous intelligence.
            </span>
          </h1>
          <p className="text-sm text-slate-400 font-normal leading-relaxed">
            Replace 20+ hours of manual spreadsheet reconciliation with automated Monday briefings and verified clawback claims.
          </p>

          {/* Currency and Billing Period Toggles */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <div className="bg-[#090D14] p-1 rounded-xl border border-slate-800 flex items-center gap-1 font-mono text-xs">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  billingPeriod === 'monthly' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  billingPeriod === 'yearly' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Yearly</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-emerald-200">Save 20%</span>
              </button>
            </div>

            <div className="bg-[#090D14] p-1 rounded-xl border border-slate-800 flex items-center gap-1 font-mono text-xs">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currency === 'INR' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currency === 'USD' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                $ USD
              </button>
            </div>
          </div>
        </div>

        {/* 4-Tier Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((p, idx) => {
            const displayPrice = currency === 'INR' 
              ? (billingPeriod === 'yearly' ? p.price_yearly_inr : p.price_monthly_inr)
              : (billingPeriod === 'yearly' ? p.price_yearly_usd : p.price_monthly_usd);

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6 }}
                className={`p-6 rounded-3xl backdrop-blur-xl transition-all relative overflow-hidden flex flex-col justify-between ${
                  p.popular
                    ? 'bg-gradient-to-b from-[#0c1e28] to-[#090D14] border-2 border-emerald-500/80 shadow-[0_0_40px_rgba(16,185,129,0.2)]'
                    : 'bg-[#090D14]/90 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Popular Flagship Glow Ribbon */}
                {p.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-sky-500 text-black text-[10px] font-mono font-extrabold uppercase tracking-widest px-4 py-1 rounded-bl-xl shadow-md">
                    {p.badge}
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    {!p.popular && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase">
                        {p.badge}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-white font-sans mt-2 leading-snug">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 min-h-[36px] font-sans leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="my-6 pb-6 border-b border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-extrabold font-mono tracking-tight ${p.popular ? 'text-emerald-400' : 'text-white'}`}>
                        {displayPrice}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/ month</span>
                    </div>
                    {billingPeriod === 'yearly' && p.id !== 'starter' && (
                      <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                        Billed annually (20% savings applied)
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-8">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                      Included Capabilities:
                    </span>
                    {p.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300 font-sans">
                        <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${p.popular ? 'text-emerald-400' : 'text-sky-400'}`} />
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {p.id === 'starter' ? (
                  <Link
                    to="/chat"
                    className="w-full py-3 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-2 transition-all shadow-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white"
                  >
                    <span>{p.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (user) {
                        setSelectedPlanForCheckout(p);
                      } else {
                        navigate(`/signup?plan=${p.id}`);
                      }
                    }}
                    className={`w-full py-3 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                      p.popular
                        ? 'bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 hover:opacity-95 text-black shadow-emerald-500/25'
                        : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white'
                    }`}
                  >
                    <span>{p.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Highlights */}
        <div className="mt-16 p-8 rounded-3xl bg-[#090D14]/80 border border-slate-800 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h4 className="text-base font-bold text-white font-sans">Enterprise-Grade Security by Design</h4>
              <p className="text-xs text-slate-400 font-sans">AST Python sandbox validation, Zero-Trust DuckDB compute, and standard compliance.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono text-xs text-slate-300 pt-4 border-t border-slate-800/80">
            <div><span className="text-emerald-400 block font-bold text-sm">0 Tokens</span> In-Memory OLAP</div>
            <div><span className="text-sky-400 block font-bold text-sm">&lt; 50ms</span> Average Latency</div>
            <div><span className="text-emerald-400 block font-bold text-sm">100% Verified</span> Math Formulas</div>
            <div><span className="text-sky-400 block font-bold text-sm">256-bit</span> TLS + Snappy Vault</div>
          </div>
        </div>

      </div>

      <CheckoutModal
        isOpen={!!selectedPlanForCheckout}
        onClose={() => setSelectedPlanForCheckout(null)}
        selectedPlan={selectedPlanForCheckout}
        onUpgradeSuccess={() => {
          // Stay on pricing or navigate to chat
          navigate('/chat');
        }}
      />
    </div>
  );
}
