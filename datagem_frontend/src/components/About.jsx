import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Database, 
  Receipt, 
  AlertTriangle, 
  Sliders, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function About() {
  const architectures = [
    {
      title: "1. Vectorized In-Memory DuckDB",
      icon: <Database className="w-5 h-5 text-sky-400" />,
      badge: "Sub-50ms Execution",
      desc: "Unlike standard AI wrappers that send full tables over expensive LLM API calls, DataGem loads your store transactions into a native DuckDB vectorized column-store. Aggregations, fee sums, and dimensional grouping happen locally in ~42 milliseconds with mathematically proven accuracy."
    },
    {
      title: "2. Autonomous Clawback Dispute Engine",
      icon: <Receipt className="w-5 h-5 text-emerald-400" />,
      badge: "Direct Cash ROI",
      desc: "Amazon and Flipkart systematically miscalculate volumetric weights, logistics fees, and customer return credits. DataGem audits every order ID against your master catalog specifications, generates concrete overcharge calculations, and outputs ready-to-submit reimbursement tickets."
    },
    {
      title: "3. Contribution Margin (CM3) & Bleeders Audit",
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
      badge: "True Bankable Cash",
      desc: "High top-line GMV often hides catastrophic SKU losses. DataGem factors in COGS, marketplace commissions, reverse logistics penalties, and payment gateway splits to reveal which products actually add cash to your bank account."
    },
    {
      title: "4. Dynamic Price Elasticity Modeling",
      icon: <Sliders className="w-5 h-5 text-purple-400" />,
      badge: "Margin Expansion",
      desc: "Using historical demand response, DataGem models the trade-off between price increases and unit volume. Operators can simulate price adjustments to discover the sweet spot where net bankable cash is maximized."
    }
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 font-sans tracking-tight selection:bg-emerald-500 selection:text-black relative overflow-hidden py-16 px-6">
      
      {/* Tri-Tone Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/15 blur-[160px]" />
        <div className="absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-sky-600/15 blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-emerald-600/12 blur-[170px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-16 pb-6 border-b border-slate-800">
          <Link to="/chat" className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>← Back to CRM Chat</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-mono">
            <Link to="/pricing" className="text-slate-400 hover:text-sky-300">Pricing</Link>
            <Link to="/chat" className="text-slate-400 hover:text-emerald-300">Studio</Link>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 text-sky-300 text-xs font-mono mb-4">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Technology &amp; Competitive Moat
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Why DataGem is <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-sky-400 to-emerald-400">
              Not Another AI Wrapper
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Standard AI wrappers send customer data to cloud APIs and hallucinate simple arithmetic. DataGem combines deterministic in-memory C++ execution with autonomous e-commerce profit recovery.
          </p>
        </div>

        {/* Deep Dive Cards */}
        <div className="space-y-6 mb-16">
          {architectures.map((arch, idx) => (
            <div key={idx} className="p-6 md:p-8 rounded-2xl bg-[#090D14] border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#05070A] rounded-xl border border-slate-800">
                    {arch.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white">{arch.title}</h3>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
                  {arch.badge}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans mt-2">
                {arch.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-950/40 via-sky-950/30 to-emerald-950/20 border border-slate-800 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-sky-500 to-emerald-400" />
          <h3 className="text-xl font-bold text-white mb-2">Ready to run an autonomous profit audit?</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">Connect your store or drop in a settlement CSV in under 60 seconds.</p>
          <Link
            to="/signup"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 via-sky-600 to-emerald-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg transition-all inline-block"
          >
            Start Free Audit →
          </Link>
        </div>

      </div>
    </div>
  );
}
