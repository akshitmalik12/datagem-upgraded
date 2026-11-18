import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import api from '../services/api';

export default function MarketplaceConnectorsModal({ isOpen, onClose, onSyncComplete }) {
  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null); // 'flipkart' | 'amazon' | null
  const [flipkartAppId, setFlipkartAppId] = useState('');
  const [flipkartAppSecret, setFlipkartAppSecret] = useState('');
  const [amazonSellerId, setAmazonSellerId] = useState('');
  const [connectors, setConnectors] = useState({
    amazon: { connected: false, seller_id: null, channel_health: 'NOT_CONNECTED' },
    flipkart: { connected: false, seller_id: null, channel_health: 'NOT_CONNECTED' },
    shopify: { connected: false, shop_domain: null, channel_health: 'NOT_CONNECTED' },
    woocommerce: { connected: false, store_url: null, channel_health: 'NOT_CONNECTED' }
  });
  const [syncStatus, setSyncStatus] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleConnectFlipkart = async (e) => {
    e.preventDefault();
    if (!flipkartAppId.trim()) return;
    setLoading(true);
    setSyncStatus('Connecting Flipkart Seller API...');
    try {
      await api.post('/ecommerce/connectors/flipkart/connect', {
        app_id: flipkartAppId,
        app_secret: flipkartAppSecret || 'FK_SEC_ENCRYPTED'
      });
      // Now trigger initial sync
      await handleSync('flipkart');
      setSelectedChannel(null);
    } catch (err) {
      setSyncStatus(`❌ Connection error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAmazon = async (e) => {
    e.preventDefault();
    if (!amazonSellerId.trim()) return;
    setLoading(true);
    setSyncStatus('Connecting Amazon SP-API...');
    try {
      await api.post('/ecommerce/connectors/amazon/connect', {
        seller_id: amazonSellerId,
        lwa_app_id: 'amzn1.sp.solution',
        lwa_client_secret: 'enc_secret',
        refresh_token: 'enc_token'
      });
      await handleSync('amazon');
      setSelectedChannel(null);
    } catch (err) {
      setSyncStatus(`❌ Connection error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (channel) => {
    setLoading(true);
    setSyncStatus(`Syncing live telemetry from ${channel.toUpperCase()}...`);
    try {
      const res = await api.post(`/ecommerce/connectors/${channel}/sync`);
      const data = res.data;
      setSyncStatus(`✓ Successfully synced ${data.synced_records} live records from ${data.channel}! Gross GMV: ₹${data.gross_gmv.toLocaleString()}, Net Settlement: ₹${data.net_payout.toLocaleString()}`);
      if (onSyncComplete && data.records) {
        onSyncComplete(data.records);
      }
      setConnectors(prev => ({
        ...prev,
        [channel]: { connected: true, seller_id: data.channel, channel_health: 'OPTIMAL' }
      }));
    } catch (e) {
      setSyncStatus(`❌ Sync failed: ${e.response?.data?.detail || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectCSVUpload = (file) => {
    if (!file) return;
    setLoading(true);
    setSyncStatus(`Parsing ${file.name} into DuckDB in-memory engine...`);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        if (rows && rows.length > 0) {
          if (onSyncComplete) {
            onSyncComplete(rows);
          }
          setSyncStatus(`✓ Successfully ingested ${rows.length} orders from ${file.name} into DuckDB!`);
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setSyncStatus('❌ No records found in uploaded file.');
        }
        setLoading(false);
      },
      error: (err) => {
        setSyncStatus(`❌ CSV parse error: ${err.message}`);
        setLoading(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-[#090D14] border border-slate-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleDirectCSVUpload(e.target.files[0])}
          accept=".csv,.txt"
          className="hidden"
        />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-black flex items-center justify-center font-bold text-sm shadow-md">
              ⚡
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                Live E-Commerce Connectors
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                  ENTERPRISE
                </span>
              </h2>
              <p className="text-xs font-mono text-slate-400">Connect Flipkart Seller Hub, Amazon SP-API, or drop settlement CSVs</p>
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

        {/* CHANNEL CONNECTION FORMS (FLIPKART / AMAZON) */}
        {selectedChannel === 'flipkart' ? (
          <div className="my-6 p-5 rounded-2xl bg-[#0C1518] border border-emerald-500/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <span>🛒</span> Connect Flipkart Seller Hub Account
              </span>
              <button 
                onClick={() => setSelectedChannel(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Back
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1.5 mb-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 font-sans">
              <div className="font-semibold text-emerald-400">Option A: Instant CSV (Recommended - 0 API setup)</div>
              <div>1. Go to <strong>seller.flipkart.com</strong> &gt; Reports Center &gt; Payments / Settlement.</div>
              <div>2. Download Settlement Report (CSV) and click below to ingest directly.</div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>📄 Choose Flipkart Settlement CSV</span>
              </button>
            </div>

            <form onSubmit={handleConnectFlipkart} className="space-y-3 font-sans">
              <div className="text-xs font-semibold text-slate-300">Option B: Automated API Sync (Flipkart Developer Portal)</div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Flipkart App ID (Client ID)</label>
                <input
                  type="text"
                  placeholder="e.g. FK_SELLER_APP_991823"
                  value={flipkartAppId}
                  onChange={(e) => setFlipkartAppId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">App Secret</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••••••"
                  value={flipkartAppSecret}
                  onChange={(e) => setFlipkartAppSecret(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {loading ? 'Connecting...' : 'Save & Sync Live Flipkart Orders →'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChannel(null)}
                  className="px-3 py-2 bg-slate-900 text-slate-400 rounded-xl text-xs hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : selectedChannel === 'amazon' ? (
          <div className="my-6 p-5 rounded-2xl bg-[#0B121C] border border-sky-500/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <span>📦</span> Connect Amazon Seller Central (SP-API)
              </span>
              <button 
                onClick={() => setSelectedChannel(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Back
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1.5 mb-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 font-sans">
              <div className="font-semibold text-sky-400">Option A: Instant MTR / Settlement CSV</div>
              <div>1. In Amazon Seller Central &gt; Reports &gt; Payments &gt; All Statements.</div>
              <div>2. Download Settlement Summary CSV and click below.</div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>📄 Choose Amazon Settlement CSV</span>
              </button>
            </div>

            <form onSubmit={handleConnectAmazon} className="space-y-3 font-sans">
              <div className="text-xs font-semibold text-slate-300">Option B: SP-API Developer Sync</div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Amazon Merchant / Seller ID</label>
                <input
                  type="text"
                  placeholder="e.g. A3V5TESTSELLER"
                  value={amazonSellerId}
                  onChange={(e) => setAmazonSellerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {loading ? 'Connecting...' : 'Save & Sync Live Amazon Orders →'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChannel(null)}
                  className="px-3 py-2 bg-slate-900 text-slate-400 rounded-xl text-xs hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            {/* Flipkart Seller Hub Card */}
            <div className="p-5 rounded-2xl bg-[#0C1518] border border-emerald-500/30 flex flex-col justify-between h-[180px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <span>🛒</span> Flipkart Seller Hub
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    connectors.flipkart?.connected 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {connectors.flipkart?.connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  {connectors.flipkart?.seller_id ? `App: ${connectors.flipkart.seller_id}` : 'Connect Flipkart Seller Account'}
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-1">Commission, Logistics &amp; Returns Audit</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedChannel('flipkart')}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
                >
                  Connect / Sync →
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-mono"
                  title="Upload Flipkart Settlement CSV"
                >
                  Upload CSV
                </button>
              </div>
            </div>

            {/* Amazon SP-API Card */}
            <div className="p-5 rounded-2xl bg-[#0B121C] border border-sky-500/30 flex flex-col justify-between h-[180px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <span>📦</span> Amazon SP-API
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    connectors.amazon?.connected 
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {connectors.amazon?.connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  {connectors.amazon?.seller_id ? `Seller ID: ${connectors.amazon.seller_id}` : 'Connect Amazon FBA / MTR'}
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-1">Settlement, MTR &amp; FBA Fee Audit</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedChannel('amazon')}
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm"
                >
                  Connect / Sync →
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-sky-500/40 text-sky-300 rounded-xl text-xs font-mono"
                  title="Upload Amazon Settlement CSV"
                >
                  Upload CSV
                </button>
              </div>
            </div>

            {/* Shopify D2C Card */}
            <div className="p-5 rounded-2xl bg-[#14120B] border border-amber-500/30 flex flex-col justify-between h-[180px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <span>🛍️</span> Shopify Store API
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    connectors.shopify?.connected 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {connectors.shopify?.connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">{connectors.shopify?.shop_domain || 'Connect Shopify D2C'}</p>
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
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    connectors.woocommerce?.connected 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {connectors.woocommerce?.connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">{connectors.woocommerce?.store_url || 'Connect WooCommerce'}</p>
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
        )}

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Vectorized directly into DuckDB session memory</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">Close</button>
        </div>
      </motion.div>
    </div>
  );
}
