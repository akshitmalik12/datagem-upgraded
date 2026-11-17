import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function MarketplaceConnectorsModal({ isOpen, onClose, onSyncComplete }) {
  const [loading, setLoading] = useState(false);
  const [connectors, setConnectors] = useState({
    amazon: { connected: true, seller_id: 'A3V5TESTSELLER', channel_health: 'OPTIMAL' },
    flipkart: { connected: true, seller_id: 'FK_ALPHA_ENTERPRISE', channel_health: 'OPTIMAL' },
    shopify: { connected: true, shop_domain: 'datagem-demo.myshopify.com', channel_health: 'OPTIMAL' },
    woocommerce: { connected: true, store_url: 'https://store.datagem.ai', channel_health: 'OPTIMAL' }
  });
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      api.get('/ecommerce/connectors/status')
        .then(res => {
          if (res.data) setConnectors(res.data);
        })
        .catch(err => console.error("Error loading connectors", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSync = async (channel) => {
    setLoading(true);
    setSyncStatus(`Syncing live telemetry from ${channel.toUpperCase()}...`);
    try {
      const res = await api.post(`/ecommerce/connectors/${channel}/sync`);
      const data = res.data;
      setSyncStatus(`✓ Successfully synced ${data.synced_records} records from ${data.channel}! Gross GMV: ₹${data.gross_gmv.toLocaleString()}, Net Settlement: ₹${data.net_payout.toLocaleString()}`);
      if (onSyncComplete && data.records) {
        onSyncComplete(data.records);
      }
    } catch (e) {
      setSyncStatus(`❌ Sync failed: ${e.response?.data?.detail || e.message}`);
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
        className="w-full max-w-3xl bg-[#090D14] border border-slate-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              ⚡
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                Live E-Commerce Connectors
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                  ENTERPRISE
                </span>
              </h2>
              <p className="text-xs font-mono text-slate-400">Zero-token automated ingestion into DuckDB vector memory</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
            ✕
          </button>
        </div>

        {syncStatus && (
          <div className="my-4 p-3 rounded-xl bg-indigo-950/60 border border-indigo-800 text-xs font-mono text-indigo-300">
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
              <p className="text-xs text-slate-400 font-mono">Seller ID: {connectors.amazon?.seller_id || 'A3V5TESTSELLER'}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">Settlement, MTR &amp; FBA Fee Audit</p>
            </div>

            <button
              disabled={loading}
              onClick={() => handleSync('amazon')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-sky-500/40 text-sky-400 hover:text-white rounded-xl text-xs font-mono font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'Syncing...' : 'Sync Live Amazon Orders →'}
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
              <p className="text-xs text-slate-400 font-mono">App: {connectors.flipkart?.seller_id || 'FK_ALPHA_ENTERPRISE'}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">Commission, Logistics &amp; Returns</p>
            </div>

            <button
              disabled={loading}
              onClick={() => handleSync('flipkart')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 hover:text-white rounded-xl text-xs font-mono font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'Syncing...' : 'Sync Live Flipkart Orders →'}
            </button>
          </div>

          {/* Shopify D2C Card */}
          <div className="p-5 rounded-2xl bg-[#14120B] border border-amber-500/30 flex flex-col justify-between h-[180px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span>🛍️</span> Shopify Store API
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Domain: {connectors.shopify?.shop_domain || 'datagem-demo.myshopify.com'}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">D2C Orders, Product SKUs &amp; Gateways</p>
            </div>

            <button
              disabled={loading}
              onClick={() => handleSync('shopify')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-400 hover:text-white rounded-xl text-xs font-mono font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'Syncing...' : 'Sync Live Shopify Store →'}
            </button>
          </div>

          {/* WooCommerce Card */}
          <div className="p-5 rounded-2xl bg-[#150E1B] border border-purple-500/30 flex flex-col justify-between h-[180px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span>🌐</span> WooCommerce REST API
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Store: {connectors.woocommerce?.store_url || 'https://store.datagem.ai'}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">Custom E-Commerce &amp; Gateway Fees</p>
            </div>

            <button
              disabled={loading}
              onClick={() => handleSync('woocommerce')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-400 hover:text-white rounded-xl text-xs font-mono font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'Syncing...' : 'Sync WooCommerce Orders →'}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Vectorized directly into DuckDB session memory</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">Close</button>
        </div>
      </motion.div>
    </div>
  );
}
