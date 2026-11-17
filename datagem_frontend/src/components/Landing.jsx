import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Zap, BarChart3, Database, Layers, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  const sampleMetrics = [
    { label: "Gross Marketplace GMV", value: "₹4,82,400", change: "+18.4%", positive: true },
    { label: "Net Payout Settlement", value: "₹3,91,220", change: "+14.2%", positive: true },
    { label: "Fulfillment Fee Leakage", value: "₹91,180", change: "-4.6%", positive: true },
    { label: "Avg Query Latency", value: "42 ms", change: "DuckDB Vectorized", positive: true },
  ];

  const features = [
    {
      icon: <Database className="w-5 h-5 text-indigo-400" />,
      title: "In-Memory DuckDB Engine",
      description: "Analyze multi-gigabyte CSVs, Parquet, and Excel sheets in milliseconds with zero cloud compute bloat."
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      title: "Zero-Token Multichannel Sync",
      description: "Native connectors for Amazon SP-API, Shopify D2C, Flipkart Hub, and WooCommerce with automated MTR reconciliation."
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-emerald-400" />,
      title: "Instant Plotly Visualizations",
      description: "Ask natural language questions and get publication-ready interactive charts, bar breakdowns, and scatter plots."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
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
    <div className="min-h-screen bg-[#070A10] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/15 blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/15 blur-[160px]" />
      </div>

      {/* Sticky Header / Navbar */}
      <nav className="relative z-50 border-b border-slate-800/80 bg-[#070A10]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              💎
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
              DataGem
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-400 font-semibold ml-1">
              v2.0
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
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
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-xs font-mono mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Autonomous AI Analytics for High-Growth E-Commerce Brands
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
        >
          Stop writing SQL. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
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
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            Start Analyzing Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all"
          >
            Launch Interactive Demo
          </Link>
        </motion.div>

        {/* Live Interactive Mock Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="p-6 rounded-3xl bg-[#0C121E]/90 border border-slate-800 shadow-2xl text-left"
        >
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs font-mono text-slate-500 ml-2">datagem://session/multichannel-reconciliation</span>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              ● DuckDB 42ms Live
            </span>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {sampleMetrics.map((m, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#080D15] border border-slate-800/80">
                <div className="text-[11px] font-mono text-slate-400">{m.label}</div>
                <div className="text-xl font-extrabold text-white mt-1">{m.value}</div>
                <div className="text-[10px] font-mono text-emerald-400 mt-1">{m.change}</div>
              </div>
            ))}
          </div>

          {/* Sample Chat Prompt */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/50 flex items-start gap-3">
            <span className="text-lg">💬</span>
            <div className="text-xs font-mono text-slate-300">
              <span className="text-indigo-400 font-bold">Prompt:</span> "Show me our top 3 SKUs by revenue and calculate Amazon vs Shopify fee leakage."
              <p className="text-slate-400 mt-1">
                <span className="text-emerald-400">Answer:</span> ELEC-W-EARBUDS generated ₹1,24,950 GMV with 15.4% Amazon fee leakage, while Shopify D2C retained 97.1% net payout.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Core Platform Capabilities */}
      <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Engineered for High-Velocity Operators</h2>
          <p className="text-sm text-slate-400 mt-2">Zero infrastructure management. Zero complex BI setup.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl bg-[#0B101A] border border-slate-800/80 hover:border-indigo-500/40 transition-colors">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 w-fit mb-4">
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Compare Plans &amp; Capabilities</h2>
          <p className="text-sm text-slate-400 mt-2">Scale seamlessly from individual exploration to multi-brand enterprise ops.</p>
        </div>

        <div className="bg-[#0B101A] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Capability</th>
                  <th className="px-6 py-4">Starter (Free)</th>
                  <th className="px-6 py-4 text-indigo-400">Pro ($15/mo)</th>
                  <th className="px-6 py-4 text-purple-400">Enterprise ($49/mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-200">{row.feature}</td>
                    <td className="px-6 py-4 text-slate-400">{row.free}</td>
                    <td className="px-6 py-4 text-indigo-300 font-semibold">{row.pro}</td>
                    <td className="px-6 py-4 text-purple-300 font-semibold">{row.ent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="relative z-10 py-16 px-6 max-w-4xl mx-auto text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-800/50 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">Start Auditing Your E-Commerce Data Today</h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto mb-8">
            Deploy DataGem in under 60 seconds. Unlock clear insights into true product margins and fee leakages.
          </p>
          <Link
            to="/signup"
            className="px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-900 text-sm font-bold rounded-xl shadow-lg transition-all"
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
