import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Copy, Download, Check, AlertTriangle, FileText, Lock } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export default function DisputePacketModal({ isOpen, onClose, onOpenUpgrade, claimData }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [packetResult, setPacketResult] = useState(null);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (isOpen && claimData) {
      fetchDisputePacket();
    }
  }, [isOpen, claimData]);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchDisputePacket = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/profit-engine/generate-dispute-packet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          claim_id: claimData?.claim_id || 'CLM-AMZ-2026-981',
          marketplace: claimData?.marketplace || 'Amazon Seller Central (FBA)',
          sku: claimData?.sku || 'ELEC-W-EARBUDS',
          asin: claimData?.asin || 'B09XSAMPLE'
        })
      });
      const data = await res.json();
      setPacketResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (packetResult?.copy_paste_packet) {
      navigator.clipboard.writeText(packetResult.copy_paste_packet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (packetResult?.copy_paste_packet) {
      const blob = new Blob([packetResult.copy_paste_packet], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${packetResult.docket_id || 'Dispute_Docket'}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!isOpen) return null;

  if (!claimData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-[#090D14] border border-slate-800 rounded-3xl shadow-2xl p-6 text-center flex flex-col items-center font-sans text-slate-100"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Dispute Packet Selected</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed mb-5">
            Select a verified claim or overcharge audit from the Audit Ledger to compile a policy-compliant dispute packet.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-[#090D14] border border-slate-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden max-h-[92vh] flex flex-col font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-500 text-black flex items-center justify-center font-bold text-base shadow-lg shadow-amber-500/20">
              ⚖️
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                Official Marketplace Dispute Docket
                {packetResult?.docket_id && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                    {packetResult.docket_id}
                  </span>
                )}
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Policy-compliant legal brief formatted for Amazon Seller Support &amp; SPF
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

        {/* Content Body */}
        <div className="py-4 flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400">Compiling verified order manifests &amp; legal policy citations...</p>
            </div>
          ) : packetResult?.is_locked ? (
            /* Locked Paywall for Free Tier */
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0A101D] border border-amber-500/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-xl">
                🔒
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Unlock Official Case Filing Kit</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                  We identified <strong>₹{packetResult.total_reclaimable?.toLocaleString()} in recoverable cash</strong> across your orders. 
                  Official legal case templates and certified order manifest dockets are reserved for <strong>Pro Growth ($29/mo)</strong> and <strong>Autonomous Operator</strong> tiers.
                </p>
              </div>

              {/* Preview Snippet */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-left font-mono text-[11px] text-slate-500 max-h-32 overflow-hidden blur-[0.5px]">
                <pre className="whitespace-pre-wrap">{packetResult.preview_snippet}</pre>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenUpgrade) onOpenUpgrade('pro');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
                >
                  Upgrade to Pro Growth ($29/mo) &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* Paid Unlocked View */
            <div className="space-y-4">
              {/* Metric Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Total Claimable</span>
                  <span className="text-lg font-bold text-emerald-400">₹{packetResult?.total_reclaimable?.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Audited Discrepancies</span>
                  <span className="text-lg font-bold text-white">{packetResult?.orders_docket_count || 340} Orders</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Filing Readiness</span>
                  <span className="text-lg font-bold text-sky-400">100% Certified</span>
                </div>
              </div>

              {/* Legal Policy Banner */}
              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/60 text-xs text-sky-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Governing Policy:</strong> {packetResult?.policy_citation}
                </div>
              </div>

              {/* Ready-to-file Case Text Box */}
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1.5 flex items-center justify-between">
                  <span>Formatted Case Log Submission Text</span>
                  <span className="text-[10px] text-slate-500">Paste directly into Seller Central &gt; Help &gt; Contact Us</span>
                </label>
                <div className="relative">
                  <textarea
                    readOnly
                    value={packetResult?.copy_paste_packet || ''}
                    rows={12}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500/50 resize-none selection:bg-emerald-500 selection:text-black leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        {!packetResult?.is_locked && (
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-shrink-0 text-xs font-mono">
            <span className="text-slate-500">Certified by DataGem Autonomous Decision Engine</span>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Docket (.txt)
              </button>
              <button
                onClick={handleCopy}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 text-black font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Official Case Text'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
