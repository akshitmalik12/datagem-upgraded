import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Sliders, 
  Receipt, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  DollarSign,
  TrendingUp,
  Zap
} from 'lucide-react';
import SEO from './SEO';

const PAGES_DATA = {
  'amazon-fba-fee-leakage': {
    title: 'Amazon FBA Fee Leakage Audit & Reimbursement Docket Generator | DataGem',
    metaTitle: 'Amazon FBA Fee Leakage Audit & Reimbursement Tool | DataGem',
    description: 'Detect volumetric weight overcharges, lost inventory refunds, and FBA fulfillment fee spikes automatically. Recover up to 3% of your Amazon GMV with 1-click formal dispute dockets.',
    heroBadge: 'Amazon FBA Autonomous Audit Engine',
    heroTitle: 'Stop Marketplace Fee Bleed: Audit FBA Overcharges in 60 Seconds',
    heroSubtitle: 'Amazon seller accounts lose an average of 1.5% to 3.2% of GMV to misclassified volumetric weight slabs and duplicate pick-and-pack surcharges. DataGem automates detection with 0 API tokens.',
    stats: [
      { label: 'Avg Fee Leakage Recovered', value: '₹42,500 / mo' },
      { label: 'Reconciliation Latency', value: '< 50ms' },
      { label: 'Claim Acceptance Rate', value: '94.2%' },
      { label: 'API Token Spend', value: '0 Tokens' }
    ],
    sampleDiscrepancy: {
      sku: 'ELEC-ANC-EARBUDS',
      asin: 'B09X4SAMPLE',
      actualWeight: '380g (Tier 1)',
      billedWeight: '1,250g (Tier 2 Heavy)',
      overchargePerOrder: '₹125.00',
      totalClaim: '₹42,500 across 340 orders'
    },
    actionPrompt: 'Audit Amazon Seller Settlement CSV'
  },
  'flipkart-return-penalty-calculator': {
    title: 'Flipkart Reverse Logistics & Commission Overcharge Calculator | DataGem',
    metaTitle: 'Flipkart Seller Fee & Return Deduction Audit | DataGem',
    description: 'Reconcile Flipkart marketplace settlement statements, fixed fee anomalies, reverse shipping surcharges, and customer return penalties with in-memory DuckDB analytics.',
    heroBadge: 'Flipkart Seller Hub Reconciliation',
    heroTitle: 'Calculate True Flipkart Payouts & Dispute Return Penalties',
    heroSubtitle: 'Verify every FSN against contractual rate cards. Pinpoint reverse shipping fee overcharges on returned orders and generate statutory claim dockets instantly.',
    stats: [
      { label: 'Reverse Shipping Recovered', value: '₹18,900 / mo' },
      { label: 'Rate Card Accuracy', value: '100% Deterministic' },
      { label: 'Supported Statements', value: 'All Settlement Sheets' },
      { label: 'Token Consumption', value: '0 Tokens' }
    ],
    sampleDiscrepancy: {
      sku: 'PWR-MAGSAFE-10K',
      asin: 'FSN: ACCGBX99120',
      actualWeight: '220g (Standard Slab)',
      billedWeight: '850g (Inflated Pass-through)',
      overchargePerOrder: '₹78.50',
      totalClaim: '₹18,900 across 240 returns'
    },
    actionPrompt: 'Audit Flipkart Settlement CSV'
  },
  'ecommerce-price-elasticity-simulator': {
    title: 'E-Commerce Price Elasticity & Contribution Margin (CM3) Simulator | DataGem',
    metaTitle: 'E-Commerce Price Elasticity & What-If Profit Simulator | DataGem',
    description: 'Simulate price adjustments on Amazon and Flipkart SKUs. Balance return rates, marketplace fees, and demand elasticity to maximize net cash contribution.',
    heroBadge: 'Algorithmic Pricing Engine',
    heroTitle: 'Simulate SKU Margin Impact Before Changing Live Prices',
    heroSubtitle: 'What happens to net bankable cash if you increase prices by 5% or drop them by 10%? DataGem calculates elasticity against historical return volume and Amazon FBA fee slabs.',
    stats: [
      { label: 'Average Net Margin Gain', value: '+14.6%' },
      { label: 'Mathematical Engine', value: 'DuckDB In-Memory OLAP' },
      { label: 'Pricing Scenarios', value: 'Infinite Multi-Variant' },
      { label: 'Data Privacy', value: 'Zero-Retention In-Memory' }
    ],
    sampleDiscrepancy: {
      sku: 'GAN-CHARGER-65W',
      asin: 'ASIN: B08Y55CHARGE',
      actualWeight: '180g (Lightweight)',
      billedWeight: '450g (Over-Tiered)',
      overchargePerOrder: '₹45.00',
      totalClaim: '₹14,850 projected margin delta'
    },
    actionPrompt: 'Launch Interactive Price Simulator'
  }
};

export default function ProgrammaticAuditPage() {
  const { slug } = useParams();
  const pageData = PAGES_DATA[slug] || PAGES_DATA['amazon-fba-fee-leakage'];

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black">
      <SEO
        title={pageData.title}
        description={pageData.description}
        path={`/audit/${slug}`}
      />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{pageData.heroBadge}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-4xl leading-tight">
          {pageData.heroTitle}
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mt-4 leading-relaxed font-sans">
          {pageData.heroSubtitle}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-4xl">
          {pageData.stats.map((stat, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#090D14] border border-slate-800">
              <span className="text-[11px] font-mono text-slate-500 uppercase">{stat.label}</span>
              <div className="text-xl font-extrabold font-mono text-emerald-400 mt-1">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Live Forensic Sample Showcase */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#090D14] border border-slate-800 max-w-4xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-800 gap-2">
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase">Live Forensic Reconciliation Proof</span>
              <h3 className="text-lg font-bold text-white font-mono mt-0.5">{pageData.sampleDiscrepancy.sku}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-bold">
              Detected Leakage: {pageData.sampleDiscrepancy.totalClaim}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-[#05070A] border border-slate-800/80">
              <span className="text-slate-500 block mb-1">Catalog Dimension Weight</span>
              <span className="text-slate-200 font-bold">{pageData.sampleDiscrepancy.actualWeight}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#05070A] border border-slate-800/80">
              <span className="text-slate-500 block mb-1">Marketplace Billed Weight</span>
              <span className="text-rose-400 font-bold">{pageData.sampleDiscrepancy.billedWeight}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#05070A] border border-slate-800/80">
              <span className="text-slate-500 block mb-1">Fee Discrepancy / Order</span>
              <span className="text-emerald-400 font-bold">{pageData.sampleDiscrepancy.overchargePerOrder}</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-sans">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Includes formal printable A4 PDF Dispute Docket for Seller Support</span>
            </div>

            <Link
              to="/chat?preset=ecom&simulate=price"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:opacity-95 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all font-sans"
            >
              <Zap className="w-4 h-4" />
              <span>{pageData.actionPrompt} →</span>
            </Link>
          </div>
        </div>

        {/* Security / FAQ Banner */}
        <div className="mt-16 text-center max-w-3xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-white font-sans">Zero-Retention Security by Design</h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            DataGem processes settlement reports in an isolated in-memory DuckDB sandbox. Your financial data is computed deterministically in volatile RAM and is never used to train public language models.
          </p>
          <div className="pt-4">
            <Link to="/pricing" className="text-xs text-sky-400 hover:underline font-mono">
              View transparent commercial pricing &amp; volume tiers →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
