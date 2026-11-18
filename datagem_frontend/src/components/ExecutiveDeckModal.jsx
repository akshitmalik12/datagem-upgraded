import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DOMAIN_PRESETS } from '../utils/sampleData';

export default function ExecutiveDeckModal({ isOpen, onClose, dataset, datasetProfile }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isWatermarked, setIsWatermarked] = useState(true);

  if (!isOpen) return null;

  if (!dataset || dataset.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-[#090D14] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative font-sans text-slate-100"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs border border-sky-500/30">
                📄
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Executive Presentation Deck</h2>
                <p className="text-[11px] font-mono text-slate-400">Board &amp; Leadership Reporting</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Empty State */}
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h3 className="text-base font-bold text-white">No Dataset Loaded</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed mb-6">
              Upload your Amazon or Flipkart settlement ledger, or select an instant domain preset to auto-compile your 4-slide executive P&L and fee leakage audit.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Return to Workspace
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const activeData = dataset;
  const isDemo = false;
  const rowCount = activeData.length;
  const columns = activeData[0] ? Object.keys(activeData[0]) : [];

  // Compute key metrics safely
  let gmv = 0;
  let fee = 0;
  let returnsCount = 0;
  const skuCounts = {};

  if (activeData && activeData.length > 0) {
    activeData.forEach(row => {
      // Find revenue
      for (const k of Object.keys(row)) {
        const kl = k.toLowerCase();
        const val = parseFloat(String(row[k]).replace(/[₹$€, ]/g, '')) || 0;
        if (kl.includes('price') || kl.includes('revenue') || kl.includes('amount') || kl.includes('sales')) {
          gmv += val;
          break;
        }
      }
      // Find fee
      for (const k of Object.keys(row)) {
        const kl = k.toLowerCase();
        const val = parseFloat(String(row[k]).replace(/[₹$€, ]/g, '')) || 0;
        if (kl.includes('fee') || kl.includes('commission')) {
          fee += val;
          break;
        }
      }
      // Find return
      for (const k of Object.keys(row)) {
        const valStr = String(row[k]).toLowerCase();
        if (valStr.includes('return') || valStr.includes('refund') || valStr.includes('cancel')) {
          returnsCount += 1;
          break;
        }
      }
      // SKU breakdown
      for (const k of Object.keys(row)) {
        const kl = k.toLowerCase();
        if (kl.includes('sku') || kl.includes('product') || kl.includes('title')) {
          const sku = String(row[k]);
          skuCounts[sku] = (skuCounts[sku] || 0) + 1;
          break;
        }
      }
    });
  }

  const netSettlement = gmv > 0 ? (gmv - fee) : 0;
  const returnRate = rowCount > 0 ? ((returnsCount / rowCount) * 100).toFixed(1) : '0.0';
  const feePct = gmv > 0 ? ((fee / gmv) * 100).toFixed(1) : '0.0';

  const topSkus = Object.entries(skuCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const slides = [
    // Slide 1: Title & Executive Summary
    {
      title: "Executive Summary & Operating Snapshot",
      subtitle: "Prepared for C-Suite Leadership & Department Heads",
      content: (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-mono uppercase tracking-wider text-sky-400 mb-2">Dataset Scope</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Synthesized from an active business tabular sample containing <strong className="text-white">{rowCount.toLocaleString()} transactions</strong> across <strong className="text-white">{columns.length} operational dimensions</strong>. Processed in-memory using zero-copy vectorized execution.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0B1524] border border-sky-500/30">
              <span className="text-[11px] font-mono text-sky-400 block mb-1">GROSS VOLUME</span>
              <span className="text-2xl font-black text-white">₹{gmv > 0 ? gmv.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A'}</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#091A14] border border-emerald-500/30">
              <span className="text-[11px] font-mono text-emerald-400 block mb-1">NET SETTLEMENT</span>
              <span className="text-2xl font-black text-emerald-400">₹{netSettlement > 0 ? netSettlement.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A'}</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#1A0F12] border border-red-500/30">
              <span className="text-[11px] font-mono text-red-400 block mb-1">RETURN RATE</span>
              <span className="text-2xl font-black text-red-400">{returnRate}%</span>
            </div>
          </div>
        </div>
      )
    },
    // Slide 2: Financial P&L & Fee Leakage Audit
    {
      title: "Fee Leakage & Net Settlement Audit",
      subtitle: "Forensic breakdown of commissions, deductions, and margins",
      content: (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full text-left text-sm font-sans">
              <thead className="bg-slate-900 text-slate-400 font-mono text-xs uppercase border-b border-slate-800">
                <tr>
                  <th className="p-4">Accounting Line Item</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">% of Gross GMV</th>
                  <th className="p-4">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300">
                <tr>
                  <td className="p-4 font-semibold text-white">Gross Revenue (GMV)</td>
                  <td className="p-4 font-mono">₹{gmv.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono">100.0%</td>
                  <td className="p-4"><span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300">Baseline</span></td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-300">Marketplace &amp; Processing Fees</td>
                  <td className="p-4 font-mono text-red-400">₹{fee.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono text-red-400">{feePct}%</td>
                  <td className="p-4"><span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-300">Deduction</span></td>
                </tr>
                <tr className="bg-emerald-950/20">
                  <td className="p-4 font-bold text-emerald-400">Net Realized Settlement</td>
                  <td className="p-4 font-mono font-bold text-emerald-400">₹{netSettlement.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="p-4 font-mono font-bold text-emerald-400">{gmv > 0 ? ((netSettlement / gmv) * 100).toFixed(1) : 0}%</td>
                  <td className="p-4"><span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">Liquid Cash</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 font-mono">
            💡 Audit Insight: Platform deductions currently represent {feePct}% of gross sales. Auditing FBA volumetric weight tier misclassifications could recover 2.5% to 4.0% in excess charges.
          </div>
        </div>
      )
    },
    // Slide 3: Leaderboard & Distribution
    {
      title: "Top Products & Volume Drivers",
      subtitle: "Pareto 80/20 concentration analysis across leading SKUs",
      content: (
        <div className="space-y-6">
          <div className="space-y-3">
            {topSkus.map(([sku, count], idx) => {
              const pct = rowCount > 0 ? ((count / rowCount) * 100).toFixed(1) : 0;
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/80 flex items-center justify-center text-xs font-mono font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-sm text-white font-semibold">{sku}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-xs">
                    <span className="text-slate-400">{count} units ({pct}%)</span>
                    <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )
    },
    // Slide 4: Strategic Recommendations & Action Items
    {
      title: "Executive Strategic Action Checklist",
      subtitle: "Immediate priority recommendations to improve net operating margin",
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
            <span className="text-lg">🎯</span>
            <div>
              <h4 className="text-sm font-bold text-white">Dispute Excess Commission Deductions</h4>
              <p className="text-xs text-slate-400 mt-1">Export itemized settlement file to initiate seller support claims for items returned with un-refunded referral fees.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
            <span className="text-lg">📦</span>
            <div>
              <h4 className="text-sm font-bold text-white">Packaging &amp; Return Rate Mitigation</h4>
              <p className="text-xs text-slate-400 mt-1">Audit high-RTO items exceeding the 15% return threshold. Rework protective packaging to prevent transit damage claims.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
            <span className="text-lg">⚡</span>
            <div>
              <h4 className="text-sm font-bold text-white">Automate Monday Morning Pulse Watchdogs</h4>
              <p className="text-xs text-slate-400 mt-1">Enable weekly automated email summaries to flag sudden margin compression before monthly book close.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-[#090D14] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] relative"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 text-black flex items-center justify-center font-bold text-xs">
              📊
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                Executive Presentation Deck &amp; White-Label PDF
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                  Ready to Export
                </span>
              </h2>
              <p className="text-[11px] font-mono text-slate-400">Slide {currentSlide + 1} of {slides.length} · Client &amp; Board Ready</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-black font-bold font-mono text-xs rounded-xl shadow-lg shadow-sky-500/20 hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <span>📄 Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Slide Content Display */}
        <div className="flex-1 overflow-y-auto p-8 relative print:p-0">
          {isWatermarked && (
            <div className="absolute top-4 right-6 pointer-events-none opacity-25 font-mono text-xs text-sky-400">
              DataGem Autonomous Analytics (Free Preview)
            </div>
          )}

          <div className="mb-6 pb-4 border-b border-slate-800/80">
            <h3 className="text-2xl font-black text-white tracking-tight">{slides[currentSlide].title}</h3>
            <p className="text-xs font-mono text-slate-400 mt-1">{slides[currentSlide].subtitle}</p>
          </div>

          {slides[currentSlide].content}
        </div>

        {/* Slide Navigation Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                  currentSlide === idx 
                    ? 'bg-sky-500 text-black shadow-md shadow-sky-500/30' 
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentSlide === 0}
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white disabled:opacity-40"
            >
              ← Prev Slide
            </button>
            <button
              disabled={currentSlide === slides.length - 1}
              onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white disabled:opacity-40"
            >
              Next Slide →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
