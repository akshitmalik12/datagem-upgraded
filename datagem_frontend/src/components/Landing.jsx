import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GhostFibers from './GhostFibers';
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
  Copy,
  ShoppingCart,
  Layers,
  LineChart
} from 'lucide-react';

export default function Landing() {
  // Active Domain Tab for the Interactive Showcase
  const [activeDomain, setActiveDomain] = useState('ecom'); // 'ecom' | 'saas' | 'studio'

  // 1. Price Elasticity Simulator Interactive State (E-Commerce)
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

  // 2. SaaS Simulator Interactive State
  const [saasPriceDelta, setSaasPriceDelta] = useState(10);
  const saasBaseArr = 142000;
  const projectedArrGain = Math.round(saasBaseArr * (saasPriceDelta / 100) * 0.88);

  // 3. Clawback Copy State
  const [copiedClaim, setCopiedClaim] = useState(false);

  const sampleMetrics = [
    { label: "Gross Marketplace GMV", value: "₹7,69,700", change: "+18.4%", badge: "E-Commerce" },
    { label: "Net Bankable Cash (CM3)", value: "₹2,31,704", change: "+14.2%", badge: "Banked" },
    { label: "SaaS MRR Growth", value: "$18,450", change: "+24.5%", badge: "B2B SaaS" },
    { label: "DuckDB In-Memory Latency", value: "28ms", change: "0 Tokens", badge: "Universal Engine" },
  ];

  const domainHubs = [
    {
      id: "ecom",
      title: "🛒 E-Commerce & Retail Hub",
      badge: "High Cash ROI",
      badgeColor: "bg-emerald-950/80 text-emerald-400 border-emerald-800",
      headline: "Autonomous Amazon & Flipkart Clawback Engine",
      description: "Recovers 3%–9% of top-line revenue lost to volumetric overcharges, damaged return leaks, and calculates true CM3 net margins."
    },
    {
      id: "saas",
      title: "📈 B2B SaaS & Growth Hub",
      badge: "Growth & Retention",
      badgeColor: "bg-sky-950/80 text-sky-400 border-sky-800",
      headline: "Cohort Retention & Churn Prevention Intelligence",
      description: "Instantly audits Stripe and billing logs: calculates net dollar retention (NDR), customer lifetime value (LTV), and churn anomalies."
    },
    {
      id: "studio",
      title: "⚡ Universal Ad-Hoc Data Studio",
      badge: "Vectorized BI",
      badgeColor: "bg-slate-800 text-slate-300 border-slate-700",
      headline: "Zero-Token In-Memory DuckDB OLAP Sandbox",
      description: "Upload any CSV or connect live SQL databases. Get instant statistical summaries, correlation matrices, and Plotly charts in under 30ms."
    }
  ];

  const comparisons = [
    { feature: "Natural Language SQL Queries", free: "15 / day", pro: "Unlimited", ent: "Dedicated Fast Queue" },
    { feature: "Domain-Aware Workspaces", free: "Basic Switcher", pro: "E-Com + SaaS + Studio", ent: "Custom Industry Models" },
    { feature: "Autonomous Clawback Engine", free: "Audit Only", pro: "Pre-filled Amazon/FK Tickets", ent: "Automated Dispute Submissions" },
    { feature: "True Contribution Margin (CM3)", free: "Basic Gross Profit", pro: "Full Net Bankable Cash", ent: "Multi-Store P&L Consolidation" },
    { feature: "Price Elasticity & ARR Simulator", free: "Preview", pro: "Full Interactive Model", ent: "Automated Repricing Rules" },
    { feature: "Multichannel Connectors", free: "Manual CSV Upload", pro: "Amazon, Shopify, Stripe, CSV", ent: "Custom Enterprise ERPs & DBs" },
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 font-sans tracking-tight selection:bg-emerald-500 selection:text-black relative overflow-hidden">
      
      {/* GhostFibers WebGL Interactive Background (Sky Blue + Emerald) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-75">
        <GhostFibers
          glowColor="#0284c7"
          lineColor="#34d399"
          secondaryColor="#059669"
          layers={3}
          twist={1.2}
          threads={72}
          fiberStyle="dots"
          depthOfField={0.85}
          hoverEffect="focus"
          intro={true}
          mouseInteraction={true}
        />
      </div>

      {/* Sticky Header / Navbar */}
      <nav className="relative z-50 border-b border-slate-800/80 bg-[#090D14]/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 p-[1px] shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-[#090D14] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                💎
              </div>
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400">
              DataGem
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-semibold ml-1">
              Domain-Aware Decision OS
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/about" className="text-sm font-medium text-slate-300 hover:text-sky-300 transition-colors">
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
              className="px-4 py-2 bg-gradient-to-r from-sky-600 via-cyan-600 to-emerald-600 hover:opacity-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-sky-500/20 transition-all"
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
          Autonomous Domain-Aware Decision Engine
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
        >
          Turn raw business data into <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400">
            actionable cash and growth.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Three pre-trained domain engines in one platform: Recover Amazon fee leakages, audit SaaS retention churn, or analyze custom datasets with sub-second in-memory DuckDB speed.
        </motion.p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-sky-600 via-cyan-600 to-emerald-600 hover:opacity-95 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2"
          >
            Launch Free Workspace <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#domain-hubs"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#090D14] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all"
          >
            Explore 3 Domain Hubs ↓
          </a>
        </div>

        {/* Top Metric Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 text-left">
          {sampleMetrics.map((m, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#090D14]/90 backdrop-blur-md border border-slate-800/80 hover:border-sky-500/30 transition-colors">
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

      {/* 3 DOMAIN HUBS INTERACTIVE SELECTOR */}
      <section id="domain-hubs" className="relative z-10 py-12 px-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <Layers className="w-3.5 h-3.5 text-sky-400" /> Modular Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Select Your Dedicated Domain Hub</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Switch anytime. DataGem tailors its SQL logic, profit formulas, and automated watchdogs to your specific industry.
          </p>
        </div>

        {/* Hub Selector Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {domainHubs.map((hub) => (
            <button
              key={hub.id}
              onClick={() => setActiveDomain(hub.id)}
              className={`text-left p-5 rounded-2xl border transition-all ${
                activeDomain === hub.id 
                  ? 'bg-slate-900/90 border-sky-500 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/30' 
                  : 'bg-[#090D14]/70 border-slate-800 hover:border-slate-700 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-white">{hub.title}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${hub.badgeColor}`}>
                  {hub.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">{hub.description}</p>
            </button>
          ))}
        </div>

        {/* ACTIVE DOMAIN LIVE SIMULATOR & FEATURES */}
        <div className="p-8 rounded-3xl bg-[#090D14]/90 backdrop-blur-md border border-slate-800 shadow-2xl relative overflow-hidden mt-6">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400" />

          {/* E-COMMERCE HUB VIEW */}
          {activeDomain === 'ecom' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono mb-2">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Interactive E-Com Simulation
                  </div>
                  <h3 className="text-xl font-bold text-white">Price Elasticity &amp; Clawback Dispute Engine</h3>
                  <p className="text-xs text-slate-400 mt-1">Pre-loaded with Amazon FBA Settlement Ledger &amp; Catalog Specifications.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400">Target Channel:</span>
                  <div className="text-xs font-bold text-emerald-400 font-mono">Amazon FBA &amp; Flipkart</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Price Slider */}
                <div className="lg:col-span-6 space-y-6">
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
                      className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                      <span>-20% Discount</span>
                      <span>Baseline (₹2,499)</span>
                      <span>+25% Premium</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#05070A] border border-slate-800">
                      <div className="text-[11px] font-mono text-slate-400">Projected Units Sold</div>
                      <div className="text-lg font-bold text-white mt-1 font-mono">{newUnits} <span className="text-xs font-normal text-slate-400">/mo</span></div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">From 420 units baseline</div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#05070A] border border-slate-800">
                      <div className="text-[11px] font-mono text-slate-400">Net Bankable Margin</div>
                      <div className={`text-lg font-bold mt-1 font-mono ${profitDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {profitDelta >= 0 ? `+₹${Math.round(profitDelta).toLocaleString()}` : `-₹${Math.abs(Math.round(profitDelta)).toLocaleString()}`}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">After COGS &amp; Logistics</div>
                    </div>
                  </div>
                </div>

                {/* 1-Click Clawback Ticket Preview */}
                <div className="lg:col-span-6 p-5 rounded-2xl bg-[#05070A] border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Amazon Claim #CLM-2026-981
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText("Reimbursement Request: Volumetric Weight Handling Discrepancy for SKU ELEC-W-EARBUDS (ASIN: B09XSAMPLE). Actual: 380g. Billed: 1,250g across 340 orders = ₹42,500 overcharge.");
                        setCopiedClaim(true);
                        setTimeout(() => setCopiedClaim(false), 2500);
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedClaim ? "Copied!" : "Copy Ticket (₹42,500)"}
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 font-mono">Discrepancy: Catalog weight is 380g. Amazon billed 1.25kg across 340 orders.</p>
                  <div className="p-3 bg-slate-900/60 rounded-lg text-[11px] font-mono text-slate-400 border border-slate-800">
                    "Please initiate cubiscan on SKU ELEC-W-EARBUDS and credit ₹42,500 fee leakage..."
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B2B SAAS HUB VIEW */}
          {activeDomain === 'saas' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800 text-sky-300 text-xs font-mono mb-2">
                    <LineChart className="w-3.5 h-3.5 text-sky-400" /> B2B SaaS &amp; Growth Studio
                  </div>
                  <h3 className="text-xl font-bold text-white">Net Revenue Retention (NDR) &amp; ARR Expansion Model</h3>
                  <p className="text-xs text-slate-400 mt-1">Pre-loaded with Stripe Subscriptions, churn cohorts, and seat expansion telemetry.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400">Baseline ARR:</span>
                  <div className="text-xs font-bold text-sky-400 font-mono">$142,000 ARR</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-[#05070A] border border-slate-800">
                  <div className="text-xs font-mono text-slate-400">Net Dollar Retention (NDR)</div>
                  <div className="text-2xl font-bold text-white mt-1 font-mono">118.4%</div>
                  <p className="text-[11px] text-emerald-400 mt-1">↑ Top-quartile SaaS expansion</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#05070A] border border-slate-800">
                  <div className="text-xs font-mono text-slate-400">Monthly User Churn Rate</div>
                  <div className="text-2xl font-bold text-white mt-1 font-mono">1.8%</div>
                  <p className="text-[11px] text-sky-400 mt-1">↓ Below industry average (3.2%)</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#05070A] border border-slate-800">
                  <div className="text-xs font-mono text-slate-400">Customer Lifetime Value (LTV)</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">$4,850</div>
                  <p className="text-[11px] text-slate-400 mt-1">CAC Payback: 4.8 months</p>
                </div>
              </div>
            </div>
          )}

          {/* AD-HOC DATA STUDIO VIEW */}
          {activeDomain === 'studio' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono mb-2">
                    <Database className="w-3.5 h-3.5 text-sky-400" /> In-Memory OLAP Sandbox
                  </div>
                  <h3 className="text-xl font-bold text-white">Zero-Token Vectorized DuckDB Engine</h3>
                  <p className="text-xs text-slate-400 mt-1">Drop any CSV or connect live SQL. 100% private, runs at 28ms without sending raw rows to an LLM.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400">Execution Speed:</span>
                  <div className="text-xs font-bold text-sky-400 font-mono">28ms • 0 API Tokens</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#05070A] border border-slate-800 space-y-2">
                  <div className="text-sm font-semibold text-white">📊 Automated EDA Summaries</div>
                  <p className="text-xs text-slate-400 leading-relaxed">Computes quartiles, standard deviations, distributions, and missing values instantly.</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#05070A] border border-slate-800 space-y-2">
                  <div className="text-sm font-semibold text-white">📈 Interactive Plotly Visuals</div>
                  <p className="text-xs text-slate-400 leading-relaxed">Generates zoomable, responsive scatter, bar, heatmap, and line charts with export options.</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#05070A] border border-slate-800 space-y-2">
                  <div className="text-sm font-semibold text-white">🔒 Enterprise Data Privacy</div>
                  <p className="text-xs text-slate-400 leading-relaxed">Your data rows never leave the secure in-memory sandbox. Strict zero-retention guarantee.</p>
                </div>
              </div>
            </div>
          )}

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

        <div className="bg-[#090D14]/90 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
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
        <div className="p-10 rounded-3xl bg-gradient-to-br from-sky-950/40 via-slate-900 to-emerald-950/20 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-400" />
          <h2 className="text-3xl font-bold text-white mb-4">Start Auditing Your Business Data Today</h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto mb-8">
            Deploy DataGem in under 60 seconds. Unlock clear insights into true product margins, SaaS retention, or ad-hoc datasets.
          </p>
          <Link
            to="/signup"
            className="px-8 py-3.5 bg-gradient-to-r from-sky-600 via-cyan-600 to-emerald-600 hover:opacity-95 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-600/30 transition-all inline-block"
          >
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-8 px-6 text-center text-xs font-mono text-slate-500">
        <p>© 2026 DataGem. Engineered for high-margin operators on Railway &amp; DuckDB.</p>
      </footer>

    </div>
  );
}
