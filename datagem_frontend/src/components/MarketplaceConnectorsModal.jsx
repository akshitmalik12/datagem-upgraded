import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketplaceConnectorsModal({ isOpen, onClose, onSyncComplete }) {
  const [loading, setLoading] = useState(false);
  const [connectors, setConnectors] = useState({
    amazon: { connected: true, seller_id: 'A3V5TESTSELLER', last_synced: '2026-11-17T06:30:00Z', channel_health: 'OPTIMAL' },
    flipkart: { connected: true, seller_id: 'FK_ALPHA_ENTERPRISE', last_synced: '2026-11-17T05:15:00Z', channel_health: 'OPTIMAL' }
  });
  const [syncStatus, setSyncStatus] = useState(null);

  if (!isOpen) return null;

  const handleSync = async (channel) => {
    setLoading(true);
    setSyncStatus(`Syncing live telemetry from ${channel === 'amazon' ? 'Amazon SP-API' : 'Flipkart Hub'}...`);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8001/ecommerce/connectors/${channel}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setSyncStatus(`✓ Successfully synced ${data.synced_records} records! Gross GMV: ₹${data.gross_gmv.toLocaleString()}, Net Settlement: ₹${data.net_payout.toLocaleString()}`);
      if (onSyncComplete) {
        onSyncComplete(data);
      }
    } catch (e) {
      setSyncStatus(`❌ Sync failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#090D14] border border-slate-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-sky-500 text-black flex items-center justify-center font-bold text-sm">
              ⚡
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                Marketplace Seller Connectors
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                  PRO TIER
                </span>
              </h2>
              <p className="text-xs font-mono text-slate-400">Direct zero-token telemetry &amp; live settlement syncing</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
            ✕
          </button>
        </div>

        {syncStatus && (
          <div className="my-4 p-3 rounded-xl bg-sky-950/60 border border-sky-800 text-xs font-mono text-sky-300">
            {syncStatus}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {/* Amazon SP-API Card */}
          <div className="p-5 rounded-2xl bg-[#0B121C] border border-sky-500/30 flex flex-col justify-between h-[180px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span>📦</span> Amazon SP-API
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Seller ID: {connectors.amazon.seller_id}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">Settlement, MTR, FBA Commission</p>
            </div>

            <button
              disabled={loading}
              onClick={() => handleSync('amazon')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-sky-500/40 text-sky-400 hover:text-white rounded-xl text-xs font-mono font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'Syncing...' : 'Sync Live Amazon Telemetry →'}
            </button>
          </div>

          {/* Flipkart Seller Hub Card */}
          <div className="p-5 rounded-2xl bg-[#0C1518] border border-emerald-500/30 flex flex-col justify-between h-[180px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span>🛒</span> Flipkart Seller Hub
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">App: {connectors.flipkart.seller_id}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">Discounts, Logistics &amp; Payouts</p>
            </div>

            <button
              disabled={loading}
              onClick={() => handleSync('flipkart')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 hover:text-white rounded-xl text-xs font-mono font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'Syncing...' : 'Sync Live Flipkart Telemetry →'}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Encrypted via AES-256 in local DuckDB session</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white">Close</button>
        </div>
      </motion.div>
    </div>
  );
}
