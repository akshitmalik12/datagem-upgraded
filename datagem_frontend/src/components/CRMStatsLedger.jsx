import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Search, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  ShoppingBag, 
  Download, 
  MessageSquare,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function CRMStatsLedger({ 
  dataset, 
  onAskAI, 
  activeDomain = 'ecom', 
  onSimulatePrice, 
  onViewDispute 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Derive CRM rows based on active dataset or fallback domain ledger
  const rawRows = dataset && dataset.length > 0 ? dataset : [
    { order_id: "OD-4081-1", sku: "ELEC-W-EARBUDS", product_name: "Wireless ANC Earbuds", category: "Electronics", billed_weight_kg: 1.25, actual_weight_kg: 0.38, gross_sales: 2499.0, cogs: 850.0, net_profit: -142.0, status: "BLEEDER" },
    { order_id: "OD-4081-2", sku: "FAST-CHARGER-65W", product_name: "GaN Fast Charger 65W", category: "Mobile Accessories", billed_weight_kg: 0.45, actual_weight_kg: 0.42, gross_sales: 1899.0, cogs: 520.0, net_profit: 1264.0, status: "STAR" },
    { order_id: "OD-4081-3", sku: "ELEC-W-EARBUDS", product_name: "Wireless ANC Earbuds", category: "Electronics", billed_weight_kg: 1.25, actual_weight_kg: 0.38, gross_sales: 2499.0, cogs: 850.0, net_profit: -284.0, status: "RETURN_LEAK" },
    { order_id: "OD-4081-4", sku: "MAG-POWERBANK-10K", product_name: "MagSafe PowerBank 10k", category: "Mobile Accessories", billed_weight_kg: 0.65, actual_weight_kg: 0.60, gross_sales: 3299.0, cogs: 1400.0, net_profit: 1195.0, status: "HEALTHY" },
    { order_id: "OD-4081-5", sku: "FAST-CHARGER-65W", product_name: "GaN Fast Charger 65W", category: "Mobile Accessories", billed_weight_kg: 0.45, actual_weight_kg: 0.42, gross_sales: 1899.0, cogs: 520.0, net_profit: 1264.0, status: "STAR" }
  ];

  // Aggregated CRM Metrics
  const totalRevenue = rawRows.reduce((acc, r) => acc + (Number(r.gross_sales || r.amount || r.revenue || 0)), 0);
  const totalOrders = rawRows.length;
  const bleedersCount = rawRows.filter(r => (r.status === 'BLEEDER' || r.status === 'RETURN_LEAK' || Number(r.net_profit || 0) < 0)).length;
  const avgOrderVal = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  // Filtered rows for the CRM data table
  const filteredRows = rawRows.filter(r => {
    const textMatch = (r.sku || r.customer_id || r.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (r.category || r.plan || '').toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === 'ALL' || (r.status || 'HEALTHY').toUpperCase() === statusFilter;
    return textMatch && statusMatch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#05070A] font-sans selection:bg-sky-500/20 selection:text-sky-300">
      
      {/* TOP CRM STATS BANNER */}
      <div className="p-6 border-b border-slate-800/80 bg-[#090D14]/90 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                {activeDomain === 'ecom' ? 'E-Commerce Profit & Order CRM' : activeDomain === 'saas' ? 'SaaS Retention & Churn CRM' : 'Data Operations Ledger'}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold font-mono rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                LIVE DUCKDB SYNC
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              High-density transaction ledger with inline AI diagnostics and fee leakage detection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAskAI("Summarize key trends and highlight highest risk outliers across this ledger")}
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold font-sans shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full AI Audit</span>
            </button>
          </div>
        </div>

        {/* 4 HIGH-IMPACT KPI STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#05070A] border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Sales (GMV)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1.5 font-sans">
              ₹{Math.round(totalRevenue).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1 font-sans">
              <ArrowUpRight className="w-3 h-3" />
              <span>+18.4% from last period</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#05070A] border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Orders / Records</span>
              <ShoppingBag className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1.5 font-sans">
              {totalOrders.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-sans">
              Avg Value: ₹{Math.round(avgOrderVal).toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#05070A] border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Hidden Bleeders</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400 mt-1.5 font-sans">
              {bleedersCount} SKU{bleedersCount === 1 ? '' : 's'}
            </div>
            <div className="text-[11px] text-rose-400/80 mt-1 font-sans">
              Negative CM3 margin detected
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#05070A] border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Recoverable Overcharges</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-1.5 font-sans">
              ₹42,500
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-sans">
              Ready for 1-click dispute ticket
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH, FILTER & ACTION TOOLBAR */}
      <div className="px-6 py-3 border-b border-slate-800/80 bg-[#090D14]/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU, customer ID, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-sky-500 font-sans"
          >
            <option value="ALL">All Statuses</option>
            <option value="STAR">Star Performers (High CM3)</option>
            <option value="BLEEDER">Hidden Bleeders</option>
            <option value="HEALTHY">Healthy</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAskAI("Find all weight handling overcharges where Amazon billed more than actual weight")}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium font-sans transition-colors flex items-center gap-1.5"
          >
            <span>⚖️</span>
            <span>Check Weight Discrepancies</span>
          </button>

          <button
            onClick={() => onAskAI("Which products have return rate higher than 15%?")}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium font-sans transition-colors flex items-center gap-1.5"
          >
            <span>📉</span>
            <span>Audit Return Rate Leakage</span>
          </button>
        </div>
      </div>

      {/* CRM DATA TABLE */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-[#090D14] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="px-5 py-3">Order / SKU</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Weight (Billed / Real)</th>
                <th className="px-5 py-3">Gross GMV</th>
                <th className="px-5 py-3">Est. Net Profit</th>
                <th className="px-5 py-3">Health Status</th>
                <th className="px-5 py-3 text-right">Inline AI Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-500 font-sans">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const skuCode = row.sku || row.customer_id || `SKU-${idx + 1}`;
                  const isBleeder = row.status === 'BLEEDER' || row.status === 'RETURN_LEAK' || Number(row.net_profit || 0) < 0;
                  const isStar = row.status === 'STAR' || Number(row.net_profit || 0) > 1000;
                  
                  return (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-200">{skuCode}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{row.order_id || row.product_name || 'Standard Unit'}</div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-300">
                        {row.category || row.plan || 'General'}
                      </td>

                      <td className="px-5 py-3.5 text-slate-300 font-mono">
                        {row.billed_weight_kg ? (
                          <span className={row.billed_weight_kg > row.actual_weight_kg ? 'text-rose-400 font-semibold' : ''}>
                            {row.billed_weight_kg}kg / {row.actual_weight_kg}kg
                          </span>
                        ) : '—'}
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-slate-200 font-sans">
                        ₹{Number(row.gross_sales || row.amount || row.mrr || 0).toLocaleString()}
                      </td>

                      <td className={`px-5 py-3.5 font-bold font-sans ${isBleeder ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {row.net_profit !== undefined ? (
                          `${row.net_profit >= 0 ? '+' : ''}₹${Number(row.net_profit).toLocaleString()}`
                        ) : (
                          `+₹${Math.round(Number(row.gross_sales || 1000) * 0.38).toLocaleString()}`
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        {isBleeder ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/60 text-rose-400 border border-rose-800/80">
                            🔴 Hidden Bleeder
                          </span>
                        ) : isStar ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
                            🟢 Star Performer
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-950/60 text-sky-400 border border-sky-800/80">
                            🔵 Healthy
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => onAskAI(`Analyze profit contribution, commission leakage, and return rate for ${skuCode}`)}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-sky-500 text-sky-400 hover:text-white text-xs font-medium transition-all"
                        >
                          Ask AI Drilldown
                        </button>

                        {row.billed_weight_kg > row.actual_weight_kg && (
                          <button
                            onClick={() => onAskAI(`Draft an Amazon Seller Support dispute ticket for SKU ${skuCode} with billed weight ${row.billed_weight_kg}kg vs actual weight ${row.actual_weight_kg}kg`)}
                            className="px-2 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 text-xs font-semibold transition-colors"
                          >
                            Draft Ticket
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
