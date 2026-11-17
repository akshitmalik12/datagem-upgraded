import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Check, X, ShieldAlert, FileText, BarChart3 } from 'lucide-react';

export const TOUR_STEPS = [
  {
    step: 1,
    title: "1. Executive KPI Stats & Health Bar",
    badge: "Day-1 Clarity",
    description: "Instant high-level visibility across Gross GMV, Net Bankable CM3 Cash, Fee Leakage, and Reclaimable Overcharges computed in under 30ms.",
    targetId: "tour-kpi-bar",
    tip: "Look at the 'Hidden Bleeders' tile to immediately see SKUs losing you money."
  },
  {
    step: 2,
    title: "2. The CRM Smart Ledger & Inline AI",
    badge: "Deep Transaction Drilldown",
    description: "Every SKU and order is tracked with true margins. Click '[Ask AI Drilldown]' on any row to send that exact SKU into the co-pilot without typing.",
    targetId: "tour-crm-table",
    tip: "Notice the status badges: 🟢 Star Performer, 🔴 Hidden Bleeder, and 🔵 Healthy."
  },
  {
    step: 3,
    title: "3. Autonomous 1-Click Dispute Tickets",
    badge: "Direct Cash Recovery",
    description: "When DataGem catches Amazon or Flipkart overcharging weight slabs, click '[Draft Ticket]' to copy a formatted Seller Support reimbursement claim.",
    targetId: "tour-dispute-action",
    tip: "Paste directly into Amazon Seller Support to reclaim actual cash leaks."
  }
];

export default function GuidedTourModal({ isOpen, onClose, onStepChange }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStepIndex + 1);
    }
  }, [currentStepIndex, onStepChange]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none flex items-end sm:items-center justify-center p-4">
        {/* Soft Backdrop Dimming */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
        />

        {/* Floating Interactive Spotlight Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.96 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-md bg-[#090D14] border border-sky-500/50 rounded-2xl p-6 shadow-2xl shadow-sky-500/10 pointer-events-auto font-sans z-50 text-slate-100 overflow-hidden"
        >
          {/* Top Decorative Sky Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400" />

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-sky-950 border border-sky-800 text-sky-400 font-bold text-xs flex items-center justify-center font-mono">
                {currentStep.step}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                {currentStep.badge}
              </span>
            </div>

            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Close Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Body */}
          <h3 className="text-base font-bold text-white mb-2 font-sans tracking-tight">
            {currentStep.title}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {currentStep.description}
          </p>

          {/* Pro Tip Box */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 font-sans mb-5 flex items-start gap-2">
            <span className="text-emerald-400 text-sm leading-none mt-0.5">💡</span>
            <div>
              <strong className="text-slate-200">Pro Tip:</strong> {currentStep.tip}
            </div>
          </div>

          {/* Footer Controls & Progress Dots */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStepIndex 
                      ? 'w-5 bg-sky-400' 
                      : 'w-1.5 bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Prev
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/30 transition-all flex items-center gap-1.5"
              >
                {isLast ? (
                  <>
                    <span>Start Analyzing</span>
                    <Check className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
