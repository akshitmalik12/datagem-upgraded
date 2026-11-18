import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingDown, TrendingUp, Zap, Target, DollarSign, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export default function BuyBoxWarRoomModal({ isOpen, onClose }) {
  const [sku, setSku] = useState('FAST-CHARGER-65W');
  const [myPrice, setMyPrice] = useState(2499);
  const [competitorPrice, setCompetitorPrice] = useState(2299);
  const [competitorStock, setCompetitorStock] = useState(65);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      runSimulation();
    }
  }, [isOpen, myPrice, competitorPrice, competitorStock]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/profit-engine/buy-box-war-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sku: sku,
          my_price: Number(myPrice),
          competitor_price: Number(competitorPrice),
          cogs: 950.0,
          fba_fee: 380.0,
          monthly_category_demand: 1200,
          competitor_inventory_estimate: Number(competitorStock)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (e) {
      console.error('War room simulation error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-[#090D14] border border-slate-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden max-h-[92vh] overflow-y-auto font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-black flex items-center justify-center font-bold text-base shadow-lg shadow-rose-500/20">
              ⚔️
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                Buy Box &amp; Competitor Repricing War-Room
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300">
                  REAL-TIME SIMULATION
                </span>
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Stress-test competitor undercutting vs cash preservation floors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Input Parameters */}
        <div className="my-5 p-4 rounded-2xl bg-[#0C121E] border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Your Listing Price</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white">
              <span className="text-slate-500 mr-1">₹</span>
              <input
                type="number"
                value={myPrice}
                onChange={(e) => setMyPrice(e.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Competitor Undercut Price</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-rose-300">
              <span className="text-slate-500 mr-1">₹</span>
              <input
                type="number"
                value={competitorPrice}
                onChange={(e) => setCompetitorPrice(e.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Competitor Stock Estimate</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-300">
              <input
                type="number"
                value={competitorStock}
                onChange={(e) => setCompetitorStock(e.target.value)}
                className="w-full bg-transparent outline-none"
              />
              <span className="text-slate-500 ml-1">units</span>
            </div>
          </div>
        </div>

        {/* Executive Recommendation Banner */}
        {result?.executive_recommendation && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-sky-950/60 border border-emerald-800 text-xs text-emerald-200 leading-relaxed font-sans shadow-lg">
            <div className="font-bold flex items-center gap-2 mb-1 text-sm text-emerald-300">
              <Target className="w-4 h-4" />
              Autonomous Decision Strategy
            </div>
            {result.executive_recommendation}
          </div>
        )}

        {/* 3 Comparative Scenarios */}
        {result?.scenarios && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            {/* Scenario A: Hold Price */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Scenario A</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{result.scenarios.hold_price.label}</h4>
                <div className="mt-2 text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between"><span>Buy Box Share:</span> <span className="font-bold text-rose-400">{result.scenarios.hold_price.buy_box_share}</span></div>
                  <div className="flex justify-between"><span>Sales Volume:</span> <span>{result.scenarios.hold_price.projected_units} units</span></div>
                  <div className="flex justify-between"><span>Unit Margin:</span> <span>₹{result.scenarios.hold_price.unit_net_margin}</span></div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">Net Monthly Profit</span>
                <span className="text-base font-bold text-white">₹{result.scenarios.hold_price.monthly_net_profit?.toLocaleString()}</span>
              </div>
            </div>

            {/* Scenario B: Match Price */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Scenario B</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{result.scenarios.match_price.label}</h4>
                <div className="mt-2 text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between"><span>Buy Box Share:</span> <span className="font-bold text-sky-400">{result.scenarios.match_price.buy_box_share}</span></div>
                  <div className="flex justify-between"><span>Sales Volume:</span> <span>{result.scenarios.match_price.projected_units} units</span></div>
                  <div className="flex justify-between"><span>Unit Margin:</span> <span>₹{result.scenarios.match_price.unit_net_margin}</span></div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">Net Monthly Profit</span>
                <span className="text-base font-bold text-white">₹{result.scenarios.match_price.monthly_net_profit?.toLocaleString()}</span>
              </div>
            </div>

            {/* Scenario C: Strategic Outlast */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/80 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">Scenario C (Recommended)</span>
                <h4 className="text-sm font-bold text-emerald-300 mt-0.5">{result.scenarios.strategic_outlast.label}</h4>
                <div className="mt-2 text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between"><span>Buy Box Share:</span> <span className="font-bold text-emerald-400">{result.scenarios.strategic_outlast.buy_box_share}</span></div>
                  <div className="flex justify-between"><span>Sales Volume:</span> <span>{result.scenarios.strategic_outlast.projected_units} units</span></div>
                  <div className="flex justify-between"><span>Unit Margin:</span> <span>₹{result.scenarios.strategic_outlast.unit_net_margin}</span></div>
                </div>
              </div>
              <div className="pt-2 border-t border-emerald-900/60">
                <span className="text-[10px] font-mono text-emerald-400 block">Net Monthly Profit</span>
                <span className="text-base font-bold text-emerald-300">₹{result.scenarios.strategic_outlast.monthly_net_profit?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Break-even floor note */}
        {result?.cash_preservation_floor && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>🛡️ Hard Cash-Preservation Price Floor:</span>
            <span className="text-amber-300 font-bold">₹{result.cash_preservation_floor} (Never reprice below this floor)</span>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500 mt-5">
          <span>In-Memory Game-Theoretic Repricing Engine</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
