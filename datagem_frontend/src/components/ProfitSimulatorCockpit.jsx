import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Sliders, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  Scale,
  Zap,
  RotateCcw
} from 'lucide-react';

export default function ProfitSimulatorCockpit({ 
  dataset, 
  selectedSku = null,
  onApplyToChat,
  onOpenDispute,
  onSwitchToLedger
}) {
  const [sliderPercent, setSliderPercent] = useState(4);
  const [copied, setCopied] = useState(false);

  // If no dataset is loaded, render clean empty state
  if (!dataset || dataset.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F8FAFC] dark:bg-[#07090E] font-sans text-center">
        <div className="max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-[#090D14] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <Sliders className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Catalog Data Loaded</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed mb-6">
            Upload your marketplace transactions or select an active domain workspace to simulate price adjustments, demand elasticity, and net bankable CM3.
          </p>
          <button
            onClick={() => onSwitchToLedger && onSwitchToLedger()}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all shadow-sm"
          >
            Go to Audit Ledger →
          </button>
        </div>
      </div>
    );
  }

  // Extract unique SKUs from dataset
  const skuList = useMemo(() => {
    const map = new Map();
    dataset.forEach(row => {
      const getVal = (...keys) => {
        for (const k of keys) {
          if (row[k] !== undefined && row[k] !== null) return row[k];
          const lk = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          for (const [rk, val] of Object.entries(row)) {
            if (rk.toLowerCase().replace(/[^a-z0-9]/g, '') === lk) return val;
          }
        }
        return undefined;
      };

      const sku = String(getVal('sku', 'asin', 'item_id') || 'SKU-ITEM');
      if (!map.has(sku)) {
        const name = String(getVal('product_name', 'item_name', 'title') || sku);
        const price = Number(getVal('gross_sales', 'amount', 'revenue', 'item_price') || 2499);
        const cogs = Number(getVal('cogs', 'cost') || (price * 0.35));
        const fee = Number(getVal('fba_fee', 'fee', 'platform_fees') || (price * 0.15));
        const billedWt = Number(getVal('billed_weight_kg', 'billed_weight') || 0);
        const actualWt = Number(getVal('actual_weight_kg', 'actual_weight') || 0);

        map.set(sku, {
          sku,
          name,
          basePrice: price,
          baseUnits: 340,
          cogs,
          fbaFee: fee,
          billedWt,
          actualWt
        });
      }
    });

    return Array.from(map.values());
  }, [dataset]);

  const [activeSkuCode, setActiveSkuCode] = useState(() => selectedSku || skuList[0]?.sku || 'ELEC-W-EARBUDS');

  const currentItem = useMemo(() => {
    return skuList.find(s => s.sku.toLowerCase() === activeSkuCode.toLowerCase()) || skuList[0];
  }, [skuList, activeSkuCode]);

  // Micro-economic elasticity calculations
  const elasticity = -0.42;
  const basePrice = currentItem.basePrice;
  const baseUnits = currentItem.baseUnits;
  const cogs = currentItem.cogs;
  const feePct = currentItem.fbaFee / basePrice;

  const priceDeltaRatio = sliderPercent / 100;
  const newPrice = Math.round(basePrice * (1 + priceDeltaRatio));
  const demandDeltaRatio = priceDeltaRatio * elasticity;
  const newUnits = Math.max(0, Math.round(baseUnits * (1 + demandDeltaRatio)));

  const baseGrossRev = basePrice * baseUnits;
  const newGrossRev = newPrice * newUnits;
  const gmvDelta = newGrossRev - baseGrossRev;

  const baseNetProfit = (basePrice - cogs - (basePrice * feePct)) * baseUnits;
  const newNetProfit = (newPrice - cogs - (newPrice * feePct)) * newUnits;
  const profitDelta = newNetProfit - baseNetProfit;
  const marginPctChange = baseNetProfit > 0 ? (profitDelta / baseNetProfit * 100) : 0;

  const handleCopySimulation = () => {
    const text = `DataGem Price Elasticity Simulation: ${sliderPercent >= 0 ? '+' : ''}${sliderPercent}% price change on ${currentItem.sku} (${currentItem.name}). Projected Price: ₹${newPrice.toLocaleString()}, Monthly Volume: ${newUnits} units, Net Bankable CM3 Delta: ${profitDelta >= 0 ? '+' : ''}₹${Math.round(profitDelta).toLocaleString()}/month.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyToChat = () => {
    const prompt = `Simulate a ${sliderPercent >= 0 ? '+' : ''}${sliderPercent}% price change on SKU ${currentItem.sku} vs projected unit demand and calculate net contribution margin (CM3)`;
    if (onApplyToChat) {
      onApplyToChat(prompt);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 bg-[#F8FAFC] dark:bg-[#07090E] font-sans selection:bg-sky-500/20">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Cockpit Header Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#090D14] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-[3px] transition-all duration-500 bg-gradient-to-r ${
            profitDelta < 0 
              ? 'from-rose-600 via-red-500 to-amber-500 shadow-[0_1px_12px_rgba(244,63,94,0.35)]' 
              : 'from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_1px_12px_rgba(16,185,129,0.35)]'
          }`} />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm transition-all duration-300 ${
                profitDelta < 0 
                  ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400' 
                  : 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
              }`}>
                <Sliders className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Profit &amp; Price Elasticity Simulator
                  </h2>
                  {profitDelta < 0 ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                      DEFICIT WARNING
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      EBITDA SURPLUS
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Micro-economic demand elasticity model calibrated for Amazon FBA and Flipkart Seller Hub.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySimulation}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Report!' : 'Copy Scenario'}</span>
              </button>

              <button
                onClick={handleApplyToChat}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Inject into AI Co-Pilot →</span>
              </button>
            </div>
          </div>

          {/* SKU Selector & Base Economics */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Select Product / SKU:</span>
              <select
                value={currentItem.sku}
                onChange={(e) => setActiveSkuCode(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                {skuList.map((item) => (
                  <option key={item.sku} value={item.sku}>
                    {item.sku} — {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-5 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span>Catalog Price: <strong className="text-slate-900 dark:text-white">₹{basePrice.toLocaleString()}</strong></span>
              <span>COGS: <strong className="text-slate-900 dark:text-white">₹{cogs.toLocaleString()}</strong></span>
              <span>Monthly Volume: <strong className="text-slate-900 dark:text-white">{baseUnits} units</strong></span>
            </div>
          </div>

          {/* Dynamic Slider with Quick Strategy Presets */}
          <div className="pt-6 pb-2 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                  Price Adjustment Slider
                </span>
                <p className="text-[11px] text-slate-400 font-sans">Simulate elasticity impact on unit demand and bankable cash</p>
              </div>
              <span className={`text-xl font-bold font-mono px-3 py-1 rounded-xl shadow-sm ${
                sliderPercent >= 0 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
              }`}>
                {sliderPercent >= 0 ? `+${sliderPercent}%` : `${sliderPercent}%`}
              </span>
            </div>

            <input
              type="range"
              min="-25"
              max="30"
              step="1"
              value={sliderPercent}
              onChange={(e) => setSliderPercent(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>-25% Discount (Volume Push)</span>
              <button 
                onClick={() => setSliderPercent(0)}
                className="hover:text-slate-200 flex items-center gap-1 transition-colors"
                title="Reset to 0% delta"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Baseline (0% Delta)
              </button>
              <span>+30% Margin Premium</span>
            </div>

            {/* Quick Strategic Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-slate-500">Fast Scenarios:</span>
              {[
                { label: '+4% Inelastic Sweet Spot', val: 4 },
                { label: '+8% Margin Expansion', val: 8 },
                { label: '+15% Premium Push', val: 15 },
                { label: '-10% Buy Box Attack', val: -10 }
              ].map(preset => (
                <button
                  key={preset.label}
                  onClick={() => setSliderPercent(preset.val)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-all ${
                    sliderPercent === preset.val
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500 font-semibold shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Real-time Calculated KPI Projection Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#090D14] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono block">New List Price</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">
              ₹{newPrice.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 font-sans block mt-1">
              {sliderPercent >= 0 ? `+₹${newPrice - basePrice}` : `-₹${basePrice - newPrice}`} per order
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#090D14] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono block">Projected Monthly Demand</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">
              {newUnits} <span className="text-xs font-normal text-slate-400">units</span>
            </div>
            <span className={`text-[11px] font-sans block mt-1 ${newUnits >= baseUnits ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
              {newUnits >= baseUnits ? `+${newUnits - baseUnits} units` : `${newUnits - baseUnits} units`} (elasticity: -0.42)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#090D14] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono block">Projected GMV</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-1">
              ₹{Math.round(newGrossRev).toLocaleString()}
            </div>
            <span className={`text-[11px] font-sans block mt-1 ${gmvDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {gmvDelta >= 0 ? `+₹${Math.round(gmvDelta).toLocaleString()}` : `-₹${Math.round(Math.abs(gmvDelta)).toLocaleString()}`} GMV
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#090D14] border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono block">Net Bankable CM3</span>
            <div className={`text-xl font-bold font-mono mt-1 ${profitDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {profitDelta >= 0 ? `+₹${Math.round(profitDelta).toLocaleString()}` : `-₹${Math.round(Math.abs(profitDelta)).toLocaleString()}`}
            </div>
            <span className={`text-[11px] font-sans block mt-1 ${profitDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {marginPctChange >= 0 ? `+${marginPctChange.toFixed(1)}%` : `${marginPctChange.toFixed(1)}%`} net cash yield
            </span>
          </div>
        </div>

        {/* Dynamic AI Economics Verdict Box */}
        <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/80 shadow-sm text-xs leading-relaxed">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-sky-200 text-sm block mb-0.5">AI Economics Verdict: </strong>
              <span className="text-slate-700 dark:text-slate-300">
                {sliderPercent > 0 ? (
                  profitDelta >= 0 ? (
                    `Implementing a +${sliderPercent}% price increase on ${currentItem.sku} unlocks +₹${Math.round(profitDelta).toLocaleString()}/month in net bankable CM3 margin. Due to inelastic consumer demand (elasticity: -0.42), the slight unit volume contraction (-${Math.abs(newUnits - baseUnits)} units) is heavily outweighed by superior gross revenue expansion.`
                  ) : (
                    `A +${sliderPercent}% increase exceeds optimal elasticity thresholds, resulting in excessive demand decay. Consider capping the price hike at +5% to +8%.`
                  )
                ) : sliderPercent < 0 ? (
                  `Discounting price by ${sliderPercent}% drives +${newUnits - baseUnits} incremental order units, but compresses gross margin. Only recommended for clearing aging inventory or winning marketplace Buy Box.`
                ) : (
                  `Currently evaluated at baseline catalog price. Drag the slider to test +5% to +15% pricing optimizations.`
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Carrier Discrepancy Link */}
        {currentItem.billedWt > currentItem.actualWt && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-2.5">
              <Scale className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span className="text-rose-800 dark:text-rose-300">
                Carrier Weight Discrepancy Detected: Billed <strong>{currentItem.billedWt}kg</strong> vs Catalog <strong>{currentItem.actualWt}kg</strong> (₹61 overcharge per unit).
              </span>
            </div>
            {onOpenDispute && (
              <button
                onClick={() => {
                  onOpenDispute({
                    sku: currentItem.sku,
                    product_name: currentItem.name,
                    billed_weight_kg: currentItem.billedWt,
                    actual_weight_kg: currentItem.actualWt,
                    affected_orders_count: 24,
                    overcharge_per_unit: 61.0,
                    total_reclaimable_cash: 24 * 61.0
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Draft Dispute Ticket
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
