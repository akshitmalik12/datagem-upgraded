import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Zap, BarChart3, Database, Layers, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  const sampleMetrics = [
    { label: "Gross Marketplace GMV", value: "₹4,82,400", change: "+18.4%", badge: "Verified" },
    { label: "Net Payout Settlement", value: "₹3,91,220", change: "+14.2%", badge: "Deposited" },
    { label: "Fulfillment Fee Leakage", value: "₹91,180", change: "-4.6%", badge: "Flagged" },
    { label: "Vector Query Latency", value: "42 ms", change: "DuckDB In-Memory", badge: "Sub-Second" },
  ];

  const features = [
    {
      icon: <Database className="w-5 h-5 text-indigo-400" />,
      accent: "from-indigo-500/20 to-indigo-500/0 border-indigo-500/30",
      title: "In-Memory DuckDB Engine",
      description: "Analyze multi-gigabyte CSVs, Parquet, and Excel sheets in milliseconds with zero cloud compute latency."
    },
    {
      icon: <Zap className="w-5 h-5 text-sky-400" />,
      accent: "from-sky-500/20 to-sky-500/0 border-sky-500/30",
      title: "Zero-Token Multichannel Sync",
      description: "Native connectors for Amazon SP-API, Shopify D2C, Flipkart Hub, and WooCommerce with automated MTR reconciliation."
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-emerald-400" />,
      accent: "from-emerald-500/20 to-emerald-500/0 border-emerald-500/30",
      title: "Instant Plotly Visualizations",
      description: "Ask natural language questions and get publication-ready interactive charts, bar breakdowns, and scatter plots."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
      accent: "from-purple-500/20 to-purple-500/0 border-purple-500/30",
      title: "Zero-Trust Privacy & Security",
      description: "Your business secrets stay yours. Data is vectorized locally in memory with enterprise JWT authentication."
    }
  ];

  const comparisons = [
    { feature: "Natural Language SQL Queries", free: "15 / day", pro: "Unlimited", ent: "Dedicated Queue" },
    { feature: "Engine Performance", free: "DuckDB Standard", pro: "DuckDB Accelerated (Sub-50ms)", ent: "Custom Cluster" },
    { feature: "Multichannel Connectors", free: "Manual CSV Upload", pro: "Amazon, Shopify, Flipkart, WooCommerce", ent: "Custom ERP & Webhooks" },
    { feature: "Executive Weekly Digest", free: "—", pro: "Monday 8 AM Email Briefing", ent: "Custom Slack & WhatsApp" },
    { feature: "Fee Leakage Watchdog", free: "—", pro: "Real-time Spikes & Returns", ent: "Autonomous Audit & Clawback" },
    { feature: "Support SLA", free: "Community", pro: "Priority Email", ent: "Dedicated Solutions Engineer" },
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 font-sans tracking-tight selection:bg-emerald-500 selection:text-black relative overflow-hidden">
      
      {/* Tri-Tone Ambient Glow: Purple, Deep Cyan-Blue & Emerald */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Purple Orb */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-purple-600/15 blur-[160px]" 
        />
        {/* Sky-Blue Orb */}
        <motion.div 
          animate={{ scale: [1, 1.15, 1], rotate: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-sky-600/15 blur-[160px]" 
        />
        {/* Emerald Orb */}
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
              v2.0
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/pricing" className="text-sm font-medium text-slate-300 hover:text-sky-300 transition-colors">
              Pricing
            </Link>
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-purple-300 transition-colors">
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="px-4 py-2 bg-gradient-to-r from-purple-600 via-sky-600 to-emerald-600 hover:opacity-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-sky-500/20 transition-all"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 text-sky-300 text-xs font-mono mb-6 shadow-sm shadow-sky-500/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Autonomous Multichannel Analytics for High-Growth E-Commerce
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
        >
          Stop writing SQL. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-sky-400 to-emerald-400">
            Talk directly to your store data.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Connect Amazon, Shopify, and Flipkart in 60 seconds. Spot fee leakage, forecast inventory stockouts, and audit marketplace payouts with local in-memory DuckDB speed.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 via-sky-600 to-emerald-600 hover:from-purple-500 hover:via-sky-500 hover:to-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2"
          >
            Start Analyzing Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#090D14] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all"
          >
            Launch Interactive Demo
          </Link>
        </motion.div>

        {/* Live Interactive Mock Preview Card (Purple-Blue-Green) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="p-6 rounded-3xl bg-[#090D14]/90 border border-slate-800 shadow-2xl text-left relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-sky-500 to-emerald-400" />
          
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-500 ml-2">datagem://session/multichannel-reconciliation</span>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              DuckDB 42ms Live
            </span>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {sampleMetrics.map((m, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#05070A] border border-slate-800/80 hover:border-sky-500/30 transition-colors">
                <div className="text-[11px] font-mono text-slate-400">{m.label}</div>
                <div className="text-xl font-extrabold text-white mt-1">{m.value}</div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] font-mono text-emerald-400">{m.change}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">{m.badge}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sample Chat Prompt */}
          <div className="p-4 rounded-2xl bg-[#05070A] border border-purple-500/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
              💬
            </div>
            <div className="text-xs font-mono text-slate-300">
              <span className="text-purple-400 font-bold">Prompt:</span> "Show me our top 3 SKUs by revenue and calculate Amazon vs Shopify fee leakage."
              <p className="text-slate-400 mt-1">
                <span className="text-emerald-400 font-semibold">Answer:</span> ELEC-W-EARBUDS generated ₹1,24,950 GMV with 15.4% Amazon fee leakage, while Shopify D2C retained 97.1% net payout.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Core Platform Capabilities */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-mono mb-3">
            <Sparkles className="w-3 h-3 text-sky-400" /> Platform Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Engineered for High-Velocity Operators</h2>
          <p className="text-sm text-slate-400 mt-2">Zero infrastructure management. Zero complex BI setup.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div key={i} className={`p-6 rounded-2xl bg-[#090D14] border bg-gradient-to-br ${f.accent} hover:border-slate-700 transition-colors`}>
              <div className="p-2.5 rounded-xl bg-[#05070A] border border-slate-800 w-fit mb-4">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono mb-3">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Transparent Tiers
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Compare Plans &amp; Capabilities</h2>
          <p className="text-sm text-slate-400 mt-2">Scale seamlessly from individual exploration to multi-brand enterprise ops.</p>
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
