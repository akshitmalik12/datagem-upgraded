import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Database, 
  Sliders, 
  AlertTriangle, 
  Receipt, 
  TrendingUp, 
  CheckCircle2, 
  Copy 
} from 'lucide-react';

export default function Landing() {
  // 1. Price Elasticity Simulator Interactive State
  const [sliderPercent, setSliderPercent] = useState(5);
  const basePrice = 2499;
  const baseUnits = 420;
  const elasticity = -0.42;

  const priceDeltaRatio = sliderPercent / 100;
  const newPrice = Math.round(basePrice * (1 + priceDeltaRatio));
  const demandDeltaRatio = priceDeltaRatio * elasticity;
  const newUnits = Math.max(0, Math.round(baseUnits * (1 + demandDeltaRatio)));

  const unitCogs = basePrice * 0.35;
  const feeRate = 0.15;
  const oldNet = (basePrice - unitCogs - (basePrice * feeRate)) * baseUnits;
  const newNet = (newPrice - unitCogs - (newPrice * feeRate)) * newUnits;
  const profitDelta = newNet - oldNet;

  // 2. Clawback Copy State
  const [copiedClaim, setCopiedClaim] = useState(false);

  const sampleMetrics = [
    { label: "Gross Marketplace GMV", value: "₹7,69,700", change: "+18.4%", badge: "Verified" },
    { label: "Net Bankable Cash (CM3)", value: "₹2,31,704", change: "+14.2%", badge: "Banked" },
    { label: "Identified Fee Leakage", value: "₹1,38,400", change: "18.0% GMV", badge: "Flagged" },
    { label: "Reclaimable Clawbacks", value: "₹58,900", change: "2 Claims Ready", badge: "Recoverable" },
  ];

  const features = [
    {
      icon: <Receipt className="w-5 h-5 text-emerald-400" />,
      accent: "from-emerald-500/20 to-emerald-500/0 border-emerald-500/30",
      title: "Autonomous Clawback Engine",
      description: "Detects Amazon FBA weight overcharges and logistics penalties. Generates pre-filled reimbursement tickets to reclaim cash."
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
      accent: "from-rose-500/20 to-rose-500/0 border-rose-500/30",
      title: "CM3 'Hidden Bleeders' Audit",
      description: "Computes Gross Sales − COGS − Commissions − Returns − Gateway Fees = Net Cash. Identifies top sellers that are bleeding money."
    },
    {
      icon: <Sliders className="w-5 h-5 text-purple-400" />,
      accent: "from-purple-500/20 to-purple-500/0 border-purple-500/30",
      title: "Price Elasticity Simulator",
      description: "Interactive slider projecting how a +5% or -10% price change shifts customer demand and expands your net bankable profit."
    },
    {
      icon: <Zap className="w-5 h-5 text-sky-400" />,
      accent: "from-sky-500/20 to-sky-500/0 border-sky-500/30",
      title: "In-Memory DuckDB Engine",
      description: "Processes hundreds of thousands of transactions in 42ms locally without hallucinating math or burning costly LLM tokens."
    }
  ];

  const comparisons = [
    { feature: "Natural Language SQL Queries", free: "15 / day", pro: "Unlimited", ent: "Dedicated Queue" },
    { feature: "Autonomous Clawback Claims", free: "Audit Only", pro: "Pre-filled Amazon/FK Tickets", ent: "Automated Dispute Filing" },
    { feature: "True Contribution Margin (CM3)", free: "Basic Gross Profit", pro: "Full Net Bankable Cash", ent: "Multi-Store P&L Consolidation" },
    { feature: "Price Elasticity Simulator", free: "Preview", pro: "Full Interactive Model", ent: "Automated Repricing Rules" },
    { feature: "Multichannel Connectors", free: "Manual CSV Upload", pro: "Amazon, Shopify, Flipkart, WooCommerce", ent: "Custom ERP & Webhooks" },
    { feature: "Executive Weekly Digest", free: "—", pro: "Monday 8 AM Email Briefing", ent: "Custom Slack & WhatsApp" },
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 font-sans tracking-tight selection:bg-emerald-500 selection:text-black relative overflow-hidden">
      
      {/* Tri-Tone Ambient Glow: Purple, Deep Cyan-Blue & Emerald */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-purple-600/15 blur-[160px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], rotate: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-sky-600/15 blur-[160px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.25, 1], rotate: [0, -45, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-15%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-emerald-600/12 blur-[170px]" 
        />
      </div>

      {/* Sticky Header / Navbar */}
      <nav className="relative z-50 border-b border-slate-800/80 bg-[#090D14]/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-sky-500 to-emerald-400 p-[1px] shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-[#090D14] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                💎
              </div>
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-sky-300 to-emerald-400">
              DataGem
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-semibold ml-1">
              Profit OS
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/about" className="text-sm font-medium text-slate-300 hover:text-purple-300 transition-colors">
              About &amp; Tech
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-slate-300 hover:text-sky-300 transition-colors">
              Pricing
            </Link>
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-emerald-300 transition-colors">
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="px-4 py-2 bg-gradient-to-r from-purple-600 via-sky-600 to-emerald-600 hover:opacity-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-sky-500/20 transition-all"
            >
              Start Free Audit →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 text-sky-300 text-xs font-mono mb-6 shadow-sm shadow-sky-500/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          The Autonomous Profit Operating System for E-Commerce Brands
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
        >
          Recover lost margins. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-sky-400 to-emerald-400">
            Uncover your true bankable cash.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          DataGem automates Amazon/Flipkart overcharge clawbacks, detects hidden SKU bleeders eating your net margin, and projects profit-maximizing price elasticity with in-memory DuckDB speed.
        </motion.p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 via-sky-600 to-emerald-600 hover:opacity-95 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2"
          >
            Start Analyzing Free <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#interactive-demo"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#090D14] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all"
          >
            Explore Interactive Features ↓
          </a>
        </div>

        {/* Top Metric Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 text-left">
          {sampleMetrics.map((m, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#090D14] border border-slate-800/80 hover:border-sky-500/30 transition-colors">
              <div className="text-[11px] font-mono text-slate-400">{m.label}</div>
              <div className="text-xl font-extrabold text-white mt-1">{m.value}</div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] font-mono text-emerald-400">{m.change}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">{m.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE 1 & 2 SHOWCASE: INTERACTIVE PRICE SIMULATOR & CM3 BLEEDERS */}
      <section id="interactive-demo" className="relative z-10 py-16 px-6 max-w-6xl mx-auto space-y-12">
        
        {/* INTERACTIVE PRICE ELASTICITY SIMULATOR */}
        <div className="p-8 rounded-3xl bg-[#090D14] border border-purple-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-sky-500 to-emerald-400" />
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 text-xs font-mono mb-2">
                <Sliders className="w-3.5 h-3.5 text-purple-400" /> Interactive Feature #1
              </div>
              <h2 className="text-2xl font-bold text-white">Live Price Elasticity &amp; Profit Simulator</h2>
              <p className="text-xs text-slate-400 mt-1">Adjust the price on SKU-A to see how demand changes and what hits your net bankable cash.</p>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono text-slate-400">Simulated SKU</div>
              <div className="text-sm font-bold text-white font-mono">Wireless Noise Cancelling Earbuds</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Slider Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono text-slate-300">Price Adjustment</span>
                  <span className={`text-base font-bold font-mono ${sliderPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {sliderPercent >= 0 ? `+${sliderPercent}%` : `${sliderPercent}%`}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="-20" 
                  max="25" 
                  step="1"
                  value={sliderPercent} 
                  onChange={(e) => setSliderPercent(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>-20% Discount</span>
                  <span>Baseline (₹2,499)</span>
                  <span>+25% Premium</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#05070A] rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">New Unit Price</span>
                  <span className="text-base font-bold text-white mt-1 block">₹{newPrice.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400">Orig: ₹{basePrice}</span>
                </div>
                <div className="p-3 bg-[#05070A] rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Projected Demand</span>
                  <span className="text-base font-bold text-white mt-1 block">{newUnits} units</span>
                  <span className={`text-[10px] ${demandDeltaRatio >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {demandDeltaRatio >= 0 ? '+' : ''}{(demandDeltaRatio * 100).toFixed(1)}% volume
                  </span>
                </div>
              </div>
            </div>

            {/* Projected Impact Card */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-[#05070A] border border-purple-500/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold">DuckDB Projected Impact</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Sub-50ms Vectorized
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-mono text-slate-400">Monthly Net Profit Shift</span>
                  <div className={`text-2xl font-extrabold mt-1 font-mono ${profitDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {profitDelta >= 0 ? '+' : ''}₹{Math.round(profitDelta).toLocaleString()}/mo
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-400">Annualized Bankable Cash</span>
                  <div className={`text-2xl font-extrabold mt-1 font-mono ${profitDelta >= 0 ? 'text-purple-300' : 'text-slate-400'}`}>
                    {profitDelta >= 0 ? '+' : ''}₹{Math.round(profitDelta * 12).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#090D14] border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                {profitDelta > 0 ? (
                  <span>
                    <strong className="text-emerald-400">Recommendation:</strong> Increasing price by {sliderPercent}% lowers order volume by {Math.abs(Number((demandDeltaRatio * 100).toFixed(1)))}%, but expands gross contribution margin by <strong className="text-white">+₹{Math.round(profitDelta).toLocaleString()}/month</strong>.
                  </span>
                ) : (
                  <span>
                    <strong className="text-rose-400">Caution:</strong> Price reduction is outpaced by unit COGS; net bankable profit declines by <strong className="text-rose-400">₹{Math.abs(Math.round(profitDelta)).toLocaleString()}/month</strong>.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FEATURE 2: TRUE CONTRIBUTION MARGIN (CM3) & HIDDEN BLEEDERS */}
        <div className="p-8 rounded-3xl bg-[#090D14] border border-rose-500/30 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Killer Feature #2
              </div>
              <h2 className="text-2xl font-bold text-white">True Contribution Margin (CM3) &amp; 'Hidden Bleeders'</h2>
              <p className="text-xs text-slate-400 mt-1">Gross sales can be deceiving. Discover the exact SKUs losing money after returns and platform commissions.</p>
            </div>

            <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-xs font-mono font-bold">
              1 Hidden Bleeder Detected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Bleeder */}
            <div className="p-6 rounded-2xl bg-[#05070A] border border-rose-500/40 relative">
              <span className="absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-400 border border-rose-800 font-bold">
                ⚠️ LOSS MAKER
              </span>
              <div className="text-xs font-mono text-slate-400">Amazon India • ASIN B09XSAMPLE</div>
              <h3 className="text-base font-bold text-white mt-1">Wireless Noise Cancelling Earbuds</h3>
              
              <div className="grid grid-cols-2 gap-2 my-4 text-xs font-mono">
                <div>Gross Sales: <span className="text-white font-bold">₹2,49,900</span></div>
                <div>COGS: <span className="text-slate-400">₹85,000</span></div>
                <div>Amazon Fees: <span className="text-rose-400">₹38,500</span></div>
                <div>Return Freight (28%): <span className="text-rose-400">₹28,400</span></div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Net Bankable Cash:</span>
                <span className="text-rose-400 font-bold text-sm">-₹14,200 (-5.6% Margin)</span>
              </div>
            </div>

            {/* The Star Performer */}
            <div className="p-6 rounded-2xl bg-[#05070A] border border-emerald-500/40 relative">
              <span className="absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                ⭐ TOP PERFORMER
              </span>
              <div className="text-xs font-mono text-slate-400">Shopify D2C • Direct Web</div>
              <h3 className="text-base font-bold text-white mt-1">GaN Fast Charger 65W</h3>
              
              <div className="grid grid-cols-2 gap-2 my-4 text-xs font-mono">
                <div>Gross Sales: <span className="text-white font-bold">₹1,89,900</span></div>
                <div>COGS: <span className="text-slate-400">₹52,000</span></div>
                <div>Gateway Fees: <span className="text-slate-400">₹3,798</span></div>
                <div>Return Freight (2.4%): <span className="text-slate-400">₹3,200</span></div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Net Bankable Cash:</span>
                <span className="text-emerald-400 font-bold text-sm">+₹1,26,402 (66.5% Margin)</span>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURE 3: AUTONOMOUS CLAWBACK DISPUTE ENGINE */}
        <div className="p-8 rounded-3xl bg-[#090D14] border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono mb-2">
                <Receipt className="w-3.5 h-3.5 text-emerald-400" /> Direct Cash ROI Feature #3
              </div>
              <h2 className="text-2xl font-bold text-white">Autonomous Marketplace Clawback Engine</h2>
              <p className="text-xs text-slate-400 mt-1">Amazon and Flipkart overcharge on volumetric weights and lost returns. We generate ready-to-file dispute tickets.</p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-slate-400 block">Total Reclaimable Cash</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">₹58,900</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#05070A] border border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">Amazon Seller Central</span>
                <h4 className="text-sm font-bold text-white mt-1">Claim #CLM-AMZ-2026-981: Volumetric Weight Overcharge</h4>
                <p className="text-xs text-slate-400 font-mono">Catalog: 380g • Billed by Amazon: 1,250g (1.25kg) across 340 orders</p>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText("Reimbursement Request: Volumetric Weight Handling Discrepancy for SKU ELEC-W-EARBUDS (ASIN: B09XSAMPLE). Actual: 380g. Billed: 1,250g.");
                  setCopiedClaim(true);
                  setTimeout(() => setCopiedClaim(false), 3000);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedClaim ? "Copied to Clipboard!" : "Copy Ready-to-Submit Ticket (₹42,500)"}
              </button>
            </div>
            
            <div className="p-4 rounded-xl bg-[#090D14] border border-slate-800/80 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
              <p className="text-slate-500">// Generated Dispute Draft for Amazon Support:</p>
              <p className="mt-1">"Dear Amazon Seller Support Team, upon auditing our settlement reports for SKU: ELEC-W-EARBUDS (ASIN: B09XSAMPLE), we identified FBA weight handling fee was billed under the 1.0kg-1.5kg slab (1,250g). Actual package weight is 380g. Total affected: 340 orders between Oct 1 - Nov 15. Calculated overcharge: ₹42,500. Please initiate cubiscan and prompt fee reimbursement."</p>
            </div>
          </div>
        </div>

      </section>

      {/* Feature Comparison Table */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono mb-3">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Transparent ROI Tiers
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Compare Plans &amp; Capabilities</h2>
          <p className="text-sm text-slate-400 mt-2">Tools that literally pay for themselves on Day 1.</p>
        </div>

        <div className="bg-[#090D14] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#05070A] border-b border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Capability</th>
                  <th className="px-6 py-4">Starter (Free)</th>
                  <th className="px-6 py-4 text-sky-400">Pro ($15/mo)</th>
                  <th className="px-6 py-4 text-emerald-400">Enterprise ($49/mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-200">{row.feature}</td>
                    <td className="px-6 py-4 text-slate-400">{row.free}</td>
                    <td className="px-6 py-4 text-sky-300 font-semibold">{row.pro}</td>
                    <td className="px-6 py-4 text-emerald-300 font-semibold">{row.ent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="relative z-10 py-16 px-6 max-w-4xl mx-auto text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-br from-purple-950/40 via-sky-950/30 to-emerald-950/20 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-sky-500 to-emerald-400" />
          <h2 className="text-3xl font-bold text-white mb-4">Start Auditing Your E-Commerce Data Today</h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto mb-8">
            Deploy DataGem in under 60 seconds. Unlock clear insights into true product margins and fee leakages.
          </p>
          <Link
            to="/signup"
            className="px-8 py-3.5 bg-gradient-to-r from-purple-600 via-sky-600 to-emerald-600 hover:opacity-95 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-600/30 transition-all inline-block"
          >
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-8 px-6 text-center text-xs font-mono text-slate-500">
        <p>© 2026 DataGem. Engineered for high-margin e-commerce brands on Railway &amp; DuckDB.</p>
      </footer>

    </div>
  );
}
