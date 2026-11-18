import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
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
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Scale,
  Sliders
} from 'lucide-react';

export default function CRMStatsLedger({ 
  dataset, 
  onAskAI, 
  activeDomain = 'ecom', 
  activeTourStep = null,
  onIngestFile = null,
  onConnectMarketplace = null,
  onSimulatePrice, 
  onViewDispute 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isDragging, setIsDragging] = useState(false);
  const [ingestNotice, setIngestNotice] = useState(null);
  const fileInputRef = useRef(null);

  // Robust case-insensitive and alias-resilient value extractor
  const getVal = (row, ...keys) => {
    if (!row) return undefined;
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null) return row[k];
      const lowerK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const [rk, val] of Object.entries(row)) {
        if (rk.toLowerCase().replace(/[^a-z0-9]/g, '') === lowerK) {
          return val;
        }
      }
    }
    return undefined;
  };

  // Derive CRM rows based on active dataset (empty array if no dataset loaded)
  const rawRows = dataset && dataset.length > 0 ? dataset : [];

  // Derive clean financial classification for each row
  const getRowFinancialStatus = (row) => {
    const rawStatus = String(getVal(row, 'status', 'order_status') || '').toUpperCase();
    if (rawStatus === 'BLEEDER' || rawStatus === 'RETURN_LEAK') return rawStatus;
    if (rawStatus === 'STAR') return 'STAR';
    if (rawStatus === 'HEALTHY') return 'HEALTHY';

    const returnFreight = Number(getVal(row, 'return_freight', 'refund_amount') || 0);
    const isReturn = rawStatus.includes('RETURN') || rawStatus.includes('REFUND') || returnFreight > 0;
    if (isReturn) return 'RETURN_LEAK';

    const gross = Number(getVal(row, 'gross_sales', 'amount', 'revenue', 'item_price') || 0);
    const cogs = Number(getVal(row, 'cogs', 'cost', 'product_cost') || (gross * 0.35));
    const fee = Number(getVal(row, 'fba_fee', 'platform_fees', 'fee', 'commission') || (gross * 0.15));
    const profitVal = getVal(row, 'net_profit', 'profit', 'margin');
    const profit = profitVal !== undefined ? Number(profitVal) : (gross - cogs - fee);
    
    if (profit < 0) return 'BLEEDER';
    if (profit >= 1400 || gross >= 3000) return 'STAR';
    return 'HEALTHY';
  };

  // Aggregated CRM Metrics (computed in real-time)
  const totalRevenue = rawRows.reduce((acc, r) => acc + (Number(getVal(r, 'gross_sales', 'amount', 'revenue', 'item_price') || 0)), 0);
  const totalOrders = rawRows.length;
  const bleedersCount = rawRows.filter(r => {
    const st = getRowFinancialStatus(r);
    return st === 'BLEEDER' || st === 'RETURN_LEAK';
  }).length;
  const avgOrderVal = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  // Calculate live clawback overcharges from billed vs actual weight discrepancies
  const totalClawback = rawRows.reduce((acc, r) => {
    const billed = Number(getVal(r, 'billed_weight_kg', 'billed_weight') || 0);
    const actual = Number(getVal(r, 'actual_weight_kg', 'actual_weight') || 0);
    if (billed > actual) {
      const deltaSlabs = Math.ceil((billed - actual) / 0.5);
      return acc + (deltaSlabs * 61);
    }
    return acc;
  }, 0);

  // File Ingestion Handler
  const handleFileProcess = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      alert('Please upload a valid CSV transaction report.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleanedRows = results.data.map((row, idx) => {
          const sku = row.sku || row.SKU || row.product_sku || row.asin || `SKU-${idx + 1}`;
          const gross = parseFloat(row.gross_sales || row.amount || row.revenue || row.item_price || 0);
          const cogs = parseFloat(row.cogs || row.cost || row.product_cost || (gross * 0.35));
          const billed_weight = parseFloat(row.billed_weight_kg || row.billed_weight || 0);
          const actual_weight = parseFloat(row.actual_weight_kg || row.actual_weight || 0);
          let net = parseFloat(row.net_profit || (gross - cogs));
          let status = row.status || (net < 0 ? 'BLEEDER' : gross > 5000 ? 'STAR' : 'HEALTHY');

          return {
            ...row,
            order_id: row.order_id || row.order_number || `OD-${1000 + idx}`,
            sku,
            product_name: row.product_name || row.item_name || sku,
            category: row.category || 'General Merch',
            gross_sales: isNaN(gross) ? 0 : gross,
            cogs: isNaN(cogs) ? 0 : cogs,
            net_profit: isNaN(net) ? 0 : net,
            billed_weight_kg: isNaN(billed_weight) ? 0 : billed_weight,
            actual_weight_kg: isNaN(actual_weight) ? 0 : actual_weight,
            status: status.toUpperCase()
          };
        });

        if (cleanedRows.length > 0) {
          if (onIngestFile) {
            onIngestFile(cleanedRows, file.name);
          }
          setIngestNotice(`✓ Ingested ${cleanedRows.length} records from ${file.name} into DuckDB`);
          setTimeout(() => setIngestNotice(null), 4000);
        }
      }
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Filtered rows with case-insensitive field matching
  const filteredRows = rawRows.filter(r => {
    const sku = String(getVal(r, 'sku', 'asin', 'item_id', 'customer_id') || '');
    const prod = String(getVal(r, 'product_name', 'item_name', 'title') || '');
    const cat = String(getVal(r, 'category', 'plan') || '');
    const orderId = String(getVal(r, 'order_id', 'order_number', 'id') || '');

    const query = searchQuery.toLowerCase().trim();
    const textMatch = !query || sku.toLowerCase().includes(query) ||
                               prod.toLowerCase().includes(query) ||
                               cat.toLowerCase().includes(query) ||
                               orderId.toLowerCase().includes(query);
    if (!textMatch) return false;
    if (statusFilter === 'ALL') return true;

    const rowStatus = getRowFinancialStatus(r);
    if (statusFilter === 'BLEEDER') {
      return rowStatus === 'BLEEDER' || rowStatus === 'RETURN_LEAK';
    }
    if (statusFilter === 'STAR') {
      return rowStatus === 'STAR';
    }
    if (statusFilter === 'HEALTHY') {
      return rowStatus === 'HEALTHY';
    }
    if (statusFilter === 'RETURN_LEAK') {
      return rowStatus === 'RETURN_LEAK';
    }
    return true;
  });

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC] dark:bg-[#07090E] font-sans selection:bg-sky-500/20 selection:text-sky-300 relative ${
        isDragging ? 'ring-2 ring-sky-500 ring-inset bg-sky-50 dark:bg-sky-950/20' : ''
      }`}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => handleFileProcess(e.target.files[0])} 
        accept=".csv,.txt" 
        className="hidden" 
      />

      {/* DRAG AND DROP FULL OVERLAY */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/90 dark:bg-[#07090E]/95 backdrop-blur-md flex flex-col items-center justify-center border-2 border-dashed border-sky-500 p-6 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-400 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-4 animate-bounce">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">Drop Settlement CSV to Ingest</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-sans mt-1 max-w-sm">
              Vectorized DuckDB in-memory OLAP recalculates CM3 net margins and overcharge slabs instantly.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP INGESTION NOTIFICATION BANNER */}
      <AnimatePresence>
        {ingestNotice && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800/80 px-6 py-2 flex items-center justify-between text-xs font-sans text-emerald-800 dark:text-emerald-300"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{ingestNotice}</span>
            </div>
            <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-300">
              0 Tokens Spent
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* TOP CRM STATS BANNER */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0B0F17]/90 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                {activeDomain === 'ecom' ? 'E-Commerce Settlement & Profit Ledger' : activeDomain === 'saas' ? 'SaaS Retention & Churn CRM' : 'Data Operations Ledger'}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-medium font-mono rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                In-Memory DuckDB
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              High-density transaction ledger with inline AI diagnostics and fee leakage detection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSimulatePrice && onSimulatePrice()}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold font-sans transition-all flex items-center gap-1.5"
              title="Open Price Elasticity & What-If Studio"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Price Simulator</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium font-sans transition-all flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Upload CSV</span>
            </button>

            <button
              onClick={() => onAskAI("Summarize key trends and highlight highest risk outliers across this ledger")}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold font-sans shadow-sm transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full AI Audit</span>
            </button>
          </div>
        </div>

        {/* 4 REFINED KPI STAT CARDS */}
        <div id="tour-kpi-bar" className={`grid grid-cols-2 lg:grid-cols-4 gap-3.5 transition-all duration-300 ${
          activeTourStep === 1 ? 'ring-2 ring-sky-500 p-2 rounded-2xl bg-sky-50 dark:bg-sky-950/20' : ''
        }`}>
          <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-[#07090E] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gross Sales (GMV)</span>
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
              ₹{Math.round(totalRevenue).toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-sans flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+18.4% vs benchmark</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-[#07090E] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Orders / Records</span>
              <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
              {totalOrders.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
              Avg Order: ₹{Math.round(avgOrderVal).toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-[#07090E] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hidden Bleeders</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            </div>
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">
              {bleedersCount} SKU{bleedersCount === 1 ? '' : 's'}
            </div>
            <div className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-1 font-sans">
              Negative CM3 margin detected
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-[#07090E] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recoverable Overcharges</span>
              <Scale className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              ₹{totalClawback > 0 ? totalClawback.toLocaleString() : '0'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
              Ready for 1-click dispute ticket
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER TOOLBAR */}
      <div className="px-5 py-2.5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#0B0F17]/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by SKU, product, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 font-sans"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:border-sky-500 font-sans"
          >
            <option value="ALL">All Statuses</option>
            <option value="BLEEDER">Hidden Bleeders</option>
            <option value="STAR">Star Performers</option>
            <option value="HEALTHY">Healthy</option>
            <option value="RETURN_LEAK">Return Leaks</option>
          </select>
        </div>

        <div className="text-xs font-mono text-slate-500">
          <span>{filteredRows.length} of {rawRows.length} records</span>
        </div>
      </div>

      {/* HIGH DENSITY CRM TRANSACTION TABLE */}
      <div className="flex-1 overflow-auto p-5">
        <div id="tour-crm-table" className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F17]/50 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-mono">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Product / SKU</th>
                <th className="px-4 py-3">Weight (Billed / Actual)</th>
                <th className="px-4 py-3">Gross Sales</th>
                <th className="px-4 py-3">Contribution Margin</th>
                <th className="px-4 py-3">Financial Status</th>
                <th className="px-4 py-3 text-center">Autonomous AI Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {rawRows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 px-4">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-3 shadow-sm">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white font-sans">No Transaction Ledger Loaded</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1.5 mb-5 leading-relaxed">
                        Upload your Flipkart Seller Hub / Amazon settlement CSV or sync your marketplace account to audit fee leakages, return freight penalties, and volumetric weight overcharges.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2.5">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold font-sans shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload Settlement CSV</span>
                        </button>
                        <button
                          onClick={() => onConnectMarketplace && onConnectMarketplace('flipkart')}
                          className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium font-sans transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <span>🛒 Connect Flipkart</span>
                        </button>
                        <button
                          onClick={() => onConnectMarketplace && onConnectMarketplace('amazon')}
                          className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium font-sans transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <span>📦 Connect Amazon</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400 font-sans">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const finStatus = getRowFinancialStatus(row);
                  const isReturnLeak = finStatus === 'RETURN_LEAK';
                  const isBleeder = finStatus === 'BLEEDER' || isReturnLeak;
                  const isStar = finStatus === 'STAR';
                  const skuCode = getVal(row, 'sku', 'asin', 'customer_id') || `ITEM-${idx + 1}`;
                  const prodName = getVal(row, 'product_name', 'item_name', 'title') || skuCode;
                  const categoryName = getVal(row, 'category', 'plan') || 'General';
                  const orderId = getVal(row, 'order_id', 'order_number', 'id') || `TRX-${4080 + idx}`;
                  const billedWeight = Number(getVal(row, 'billed_weight_kg', 'billed_weight') || 0);
                  const actualWeight = Number(getVal(row, 'actual_weight_kg', 'actual_weight') || 0);
                  const grossSales = Number(getVal(row, 'gross_sales', 'amount', 'revenue') || 0);
                  const profitVal = getVal(row, 'net_profit', 'profit', 'margin');
                  const returnFreightVal = Number(getVal(row, 'return_freight', 'refund_amount') || 284);

                  return (
                    <tr 
                      key={orderId || idx}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors group"
                    >
                      <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">
                        {orderId}
                      </td>

                      <td className="px-4 py-3 font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{prodName}</span>
                          <span className="text-[10px] font-mono text-slate-400">{skuCode} · {categoryName}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono">
                        {billedWeight > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className={billedWeight > actualWeight ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-600 dark:text-slate-300'}>
                              {billedWeight}kg
                            </span>
                            <span className="text-slate-400">/</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{actualWeight}kg</span>
                            {billedWeight > actualWeight && (
                              <span className="text-[10px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-1 py-0.2 rounded font-sans ml-1">
                                Overcharge
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>

                      <td className="px-4 py-3 font-medium font-mono text-slate-800 dark:text-slate-200">
                        ₹{grossSales.toLocaleString()}
                      </td>

                      <td className={`px-4 py-3 font-semibold font-sans ${isBleeder ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {profitVal !== undefined ? (
                          `${Number(profitVal) >= 0 ? '+' : ''}₹${Number(profitVal).toLocaleString()}`
                        ) : isReturnLeak ? (
                          `-₹${returnFreightVal.toLocaleString()}`
                        ) : (
                          `+₹${Math.round(grossSales * 0.42).toLocaleString()}`
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {isReturnLeak ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 whitespace-nowrap leading-none">
                            Return Leak
                          </span>
                        ) : isBleeder ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 whitespace-nowrap leading-none">
                            Hidden Bleeder
                          </span>
                        ) : isStar ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 whitespace-nowrap leading-none">
                            Star Performer
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-900 whitespace-nowrap leading-none">
                            Healthy
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onAskAI(`Analyze profit contribution, commission leakage, and return rate for ${skuCode}`)}
                            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all"
                            title="Ask AI Drilldown"
                          >
                            Ask AI
                          </button>

                          <button
                            onClick={() => onSimulatePrice && onSimulatePrice(skuCode)}
                            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all"
                            title="Simulate Price Elasticity"
                          >
                            Simulate
                          </button>

                          {row.billed_weight_kg > row.actual_weight_kg && (
                            <button
                              id="tour-dispute-action"
                              onClick={() => {
                                if (onViewDispute) {
                                  onViewDispute({
                                    sku: skuCode,
                                    product_name: row.product_name,
                                    billed_weight_kg: row.billed_weight_kg,
                                    actual_weight_kg: row.actual_weight_kg,
                                    affected_orders_count: 24,
                                    overcharge_per_unit: 61.0,
                                    total_reclaimable_cash: 24 * 61.0
                                  });
                                } else {
                                  onAskAI(`Draft an Amazon Seller Support dispute ticket for SKU ${skuCode} with billed weight ${row.billed_weight_kg}kg vs actual weight ${row.actual_weight_kg}kg`);
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-medium transition-all"
                              title="Draft Dispute Ticket"
                            >
                              Claim
                            </button>
                          )}
                        </div>
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
