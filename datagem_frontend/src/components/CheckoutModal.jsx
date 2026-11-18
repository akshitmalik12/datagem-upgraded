import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, Zap, CreditCard, Sparkles, X, ArrowRight } from 'lucide-react';
import { billingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function CheckoutModal({ isOpen, onClose, selectedPlan, onUpgradeSuccess }) {
  const { user } = useAuth();
  const [provider, setProvider] = useState('razorpay'); // 'razorpay' | 'stripe'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !selectedPlan) return null;

  const handleActivate = async () => {
    setLoading(true);
    setError(null);
    try {
      const email = user?.email || 'operator@datagem.app';
      const planId = selectedPlan.id;
      const res = await billingAPI.simulateUpgrade(planId, email, provider);
      
      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          if (onUpgradeSuccess) onUpgradeSuccess(planId);
          onClose();
        }, 1800);
      } else {
        setError('Failed to activate subscription. Please try again.');
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      setError(err.response?.data?.detail || 'Error activating plan. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          className="relative w-full max-w-lg bg-[#090D14] border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden font-sans"
        >
          {/* Subtle Top Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Subscription Activated!</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Welcome to DataGem <span className="text-emerald-400 font-semibold">{selectedPlan.name}</span>. Your workspace capabilities have been upgraded immediately.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Commercial Upgrade</span>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {selectedPlan.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedPlan.description}
                </p>
              </div>

              {/* Price Pill */}
              <div className="bg-[#05070A] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between mb-6">
                <div>
                  <span className="text-[11px] font-mono uppercase text-slate-500 block">Plan Billing</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-extrabold text-white font-mono">
                      {selectedPlan.price_monthly_inr || selectedPlan.price_monthly_usd || '₹2,499'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">/ month</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    Instant Setup
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">Cancel anytime</span>
                </div>
              </div>

              {/* Included Features */}
              <div className="space-y-2 mb-6">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  Unlocked Capabilities:
                </span>
                {(selectedPlan.features || []).slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* Payment Gateway Selector */}
              <div className="mb-6">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block font-semibold mb-2">
                  Select Payment Route:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProvider('razorpay')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      provider === 'razorpay'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm'
                        : 'border-slate-800 bg-[#05070A] text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                      ₹
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Razorpay</div>
                      <div className="text-[10px] text-slate-500">UPI, Cards, NetBanking</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProvider('stripe')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      provider === 'stripe'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm'
                        : 'border-slate-800 bg-[#05070A] text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Stripe</div>
                      <div className="text-[10px] text-slate-500">International Visa/MC</div>
                    </div>
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleActivate}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Activating Subscription...</span>
                  ) : (
                    <>
                      <span>Confirm & Activate {selectedPlan.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono mt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-Bit Encrypted • Instant Provisioning • 30-Day Money-Back Guarantee</span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
