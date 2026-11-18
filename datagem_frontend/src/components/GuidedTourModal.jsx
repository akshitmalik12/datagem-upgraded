import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Check, X } from 'lucide-react';

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
    description: "Every SKU and order is tracked with true margins. Click '[Ask AI]' on any row to send that exact SKU into the co-pilot without typing.",
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
  const [targetRect, setTargetRect] = useState(null);
  const cardRef = useRef(null);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  // Track target element position and scroll it into view
  useEffect(() => {
    if (!isOpen) return;

    if (onStepChange) {
      onStepChange(currentStepIndex + 1);
    }

    const updatePosition = () => {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        const r = el.getBoundingClientRect();
        setTargetRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
          bottom: r.bottom,
          right: r.right
        });
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    const timer = setTimeout(updatePosition, 300);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [currentStepIndex, isOpen, currentStep.targetId, onStepChange]);

  if (!isOpen) return null;

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

  // Compute card positioning relative to target
  let cardStyle = {};
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (targetRect && !isMobile) {
    const cardWidth = 420;
    const cardHeight = 280;

    if (currentStep.targetId === 'tour-kpi-bar') {
      // Anchored directly below the KPI bar
      cardStyle = {
        position: 'fixed',
        top: Math.min(window.innerHeight - cardHeight - 24, targetRect.bottom + 16),
        left: Math.max(24, Math.min(window.innerWidth - cardWidth - 24, targetRect.left + 24))
      };
    } else if (currentStep.targetId === 'tour-crm-table') {
      // Anchored over the top section of the table
      cardStyle = {
        position: 'fixed',
        top: Math.max(100, Math.min(window.innerHeight - cardHeight - 24, targetRect.top + 36)),
        left: Math.max(24, Math.min(window.innerWidth - cardWidth - 24, targetRect.left + 36))
      };
    } else if (currentStep.targetId === 'tour-dispute-action') {
      // Anchored to the left of the button or above it
      const fitsLeft = targetRect.left - cardWidth - 24 > 20;
      if (fitsLeft) {
        cardStyle = {
          position: 'fixed',
          top: Math.max(90, Math.min(window.innerHeight - cardHeight - 24, targetRect.top - 40)),
          left: targetRect.left - cardWidth - 16
        };
      } else {
        cardStyle = {
          position: 'fixed',
          top: Math.max(90, targetRect.top - cardHeight - 16),
          left: Math.max(24, targetRect.left - 100)
        };
      }
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Subtle Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/20 pointer-events-auto"
        />

        {/* Dynamic Target Spotlight Ring */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
            }}
            className="rounded-2xl border-2 border-sky-400 ring-4 ring-sky-500/30 shadow-[0_0_35px_rgba(56,189,248,0.4)] pointer-events-none z-40 transition-all duration-300"
          />
        )}

        {/* Floating Interactive Spotlight Card */}
        <div 
          className={!targetRect || isMobile ? "fixed inset-0 flex items-end sm:items-center justify-center p-4" : ""}
        >
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={cardStyle}
            className="w-full max-w-md bg-white dark:bg-[#090D14] border border-slate-200 dark:border-sky-500/50 rounded-2xl p-6 shadow-2xl shadow-slate-300/50 dark:shadow-sky-500/10 pointer-events-auto font-sans z-50 text-slate-800 dark:text-slate-100 overflow-hidden"
          >
            {/* Top Decorative Sky Gradient Accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400" />

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 font-bold text-xs flex items-center justify-center font-mono">
                  {currentStep.step}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/20">
                  {currentStep.badge}
                </span>
              </div>

              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close Tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Body */}
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 font-sans tracking-tight">
              {currentStep.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              {currentStep.description}
            </p>

            {/* Pro Tip Box */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-sans mb-4 flex items-start gap-2">
              <span className="text-emerald-500 text-sm leading-none mt-0.5">💡</span>
              <div>
                <strong className="text-slate-800 dark:text-slate-200">Pro Tip:</strong> {currentStep.tip}
              </div>
            </div>

            {/* Footer Controls & Progress Dots */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              {/* Step Indicators */}
              <div className="flex items-center gap-1.5">
                {TOUR_STEPS.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentStepIndex 
                        ? 'w-5 bg-sky-500' 
                        : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <button
                    onClick={handlePrev}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center gap-1"
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
      </div>
    </AnimatePresence>
  );
}
