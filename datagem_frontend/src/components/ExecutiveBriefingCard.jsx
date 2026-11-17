import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  ShoppingBag, 
  AlertTriangle, 
  ArrowRight, 
  Zap,
  DollarSign,
  Package,
  Layers
} from 'lucide-react';

export default function ExecutiveBriefingCard({ briefing, onSelectPrompt }) {
  if (!briefing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl my-4 p-6 rounded-3xl bg-[#080C14]/95 border-2 border-sky-500/40 shadow-[0_20px_50px_rgba(2,132,199,0.25)] backdrop-blur-2xl relative overflow-hidden font-sans"
    >
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sm font-bold text-sky-300">
            💎
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-100 tracking-tight">Executive Dataset Briefing</span>
              <span 
                className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold"
                style={{ 
                  backgroundColor: `${briefing.badgeColor}22`, 
                  borderColor: briefing.badgeColor,
                  color: briefing.badgeColor 
                }}
              >
                {briefing.channelLabel}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono mt-0.5 block">{briefing.filename} • {briefing.totalRows?.toLocaleString()} rows profiled</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>DuckDB Zero-Copy Ingested</span>
        </div>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-sky-400" /> Gross Revenue
          </span>
          <div className="text-xl font-extrabold text-white tracking-tight">{briefing.totalGrossFormatted}</div>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">{briefing.totalUnits?.toLocaleString()} units sold</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Net Settlement
          </span>
          <div className="text-xl font-extrabold text-emerald-400 tracking-tight">{briefing.netPayoutFormatted || briefing.totalGrossFormatted}</div>
          <span className="text-[10px] font-mono text-emerald-500 mt-0.5 block">Estimated Bank Payout</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Fee Leakage
          </span>
          <div className="text-xl font-extrabold text-rose-400 tracking-tight">{briefing.totalFeesFormatted || '₹0'}</div>
          <span className="text-[10px] font-mono text-rose-400/80 mt-0.5 block">{briefing.feeTakeRatePct ? `${briefing.feeTakeRatePct}% Commission Take` : 'Direct Channel'}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5 mb-1">
            <ShoppingBag className="w-3.5 h-3.5 text-purple-400" /> Average Order
          </span>
          <div className="text-xl font-extrabold text-purple-300 tracking-tight">{briefing.aovFormatted || 'N/A'}</div>
          <span className="text-[10px] font-mono text-purple-400/80 mt-0.5 block">AOV per Order</span>
        </div>
      </div>

      {/* Top SKUs Leaderboard */}
      {briefing.topSkus && briefing.topSkus.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/60">
            <span className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-sky-400" /> Top SKUs by Revenue Contribution
            </span>
            <span className="text-[10px] font-mono text-slate-500">Live Breakdown</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {briefing.topSkus.map((sku, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                  <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950 px-1.5 py-0.5 rounded border border-sky-800/60">#{idx + 1}</span>
                  <span className="text-slate-200 font-medium truncate" title={sku.sku}>{sku.sku}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-emerald-400 block">{sku.revenueFormatted}</span>
                  <span className="text-[10px] font-mono text-slate-500 block">{sku.units} units</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended 1-Click Insight Prompts */}
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Recommended Follow-up Queries (1-Click Run)
        </span>
        <div className="flex flex-wrap gap-2">
          {briefing.recommendedPrompts.map((promptText, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02, borderColor: '#10b981' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectPrompt && onSelectPrompt(promptText)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500 text-xs text-slate-200 font-medium flex items-center gap-2 transition-colors shadow-sm group text-left"
            >
              <span>{promptText}</span>
              <ArrowRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
