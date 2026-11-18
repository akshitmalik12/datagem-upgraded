import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink,
  Printer
} from 'lucide-react';

export default function DisputeTicketModal({ isOpen, onClose, disputeData }) {
  const [copied, setCopied] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('amazon');

  if (!isOpen) return null;

  if (!disputeData || !disputeData.sku) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-white dark:bg-[#090D14] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-center flex flex-col items-center font-sans text-slate-800 dark:text-slate-100"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Dispute Case Selected</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed mb-5">
            Identify an overcharge or weight discrepancy in the Audit Ledger or AI Co-Pilot to automatically generate a formal carrier dispute ticket.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Return to Ledger
          </button>
        </motion.div>
      </div>
    );
  }

  const sku = disputeData.sku;
  const productName = disputeData?.product_name || 'Wireless ANC Earbuds';
  const billedWeight = disputeData?.billed_weight_kg || 1.25;
  const actualWeight = disputeData?.actual_weight_kg || 0.38;
  const ordersCount = disputeData?.affected_orders_count || 48;
  const overchargePerUnit = disputeData?.overcharge_per_unit || 61.0;
  const totalReclaimable = disputeData?.total_reclaimable_cash || (ordersCount * overchargePerUnit);
  const claimId = disputeData?.claim_id || `CLM-${selectedChannel.toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const disputeTicketBody = selectedChannel === 'amazon' 
? `CASE SUBJECT: Reimbursement Request: Volumetric Weight Handling Discrepancy for SKU ${sku} (Claim ID: ${claimId})

Dear Amazon Seller Support & FBA Inbound Team,

We are writing to officially contest the FBA Weight Handling Fee overcharges assessed against our account for the following ASIN / SKU:

1. Product Identifier: ${sku} (${productName})
2. Package Specification Weight (Catalog): ${Math.round(actualWeight * 1000)}g (${actualWeight} kg)
3. Currently Billed Weight Slab: ${Math.round(billedWeight * 1000)}g (${billedWeight} kg)
4. Total Audited Affected Orders: ${ordersCount} Units
5. Discrepancy Differential: ₹${overchargePerUnit.toFixed(2)} per order
6. Total Overcharge Claim Amount: ₹${totalReclaimable.toLocaleString()}

Forensic Summary:
Our warehouse dimensional verification and manufacturer spec sheet confirm the packaged item weight is strictly ${Math.round(actualWeight * 1000)}g. FBA fulfillment centers have improperly categorized shipments under the heavier slab (>1.0kg), resulting in recurring systematic overbilling.

Required Action:
1. Schedule a prompt Cubiscan re-measurement at the active fulfillment center.
2. Update the package dimensions and weight tier in the ASIN fee preview.
3. Issue an immediate cash reimbursement of ₹${totalReclaimable.toLocaleString()} to our seller settlement ledger.

Attached:
- Automated settlement audit manifest exported via DataGem Autonomous OLAP Engine.

Thank you,
Finance & Operations Team
Authorized Amazon Seller Central Merchant`
: `CASE SUBJECT: Urgent Fee Dispute: Weight Slab & Logistics Overcharge for FSN/SKU ${sku} (Claim ID: ${claimId})

Dear Flipkart Marketplace Merchant Support,

Upon reconciliation of our commission and logistics deduction statements, we have identified an erroneous weight tier classification for SKU: ${sku} (${productName}).

- Actual Volumetric Weight: ${actualWeight} kg (${Math.round(actualWeight * 1000)} grams)
- Billed Logistics Weight: ${billedWeight} kg (${Math.round(billedWeight * 1000)} grams)
- Number of affected shipments: ${ordersCount}
- Claimable Logistics Surcharge: ₹${totalReclaimable.toLocaleString()}

Please re-audit the shipping pass through weight and credit the disputed ₹${totalReclaimable.toLocaleString()} directly to our next disbursement cycle.

Sincerely,
Operations Lead · DataGem Verified Merchant`;

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(disputeTicketBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>DataGem Formal Dispute Claim - ${claimId}</title>
        <style>
          @page { size: A4 portrait; margin: 20mm; }
          body { font-family: 'Inter', Arial, sans-serif; color: #0f172a; line-height: 1.5; font-size: 13px; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
          .brand { font-size: 20px; font-weight: 800; color: #0284c7; }
          .badge { background: #fef2f2; color: #ef4444; border: 1px solid #f87171; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 11px; }
          .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 20px 0; background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; }
          .meta-item label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; display: block; }
          .meta-item value { font-size: 14px; font-weight: 700; color: #0f172a; }
          .ticket-text { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 11px; white-space: pre-wrap; line-height: 1.6; }
          .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">⚡ DataGem Autonomous Dispute Claim</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Official Fee & Weight Reconciliation Audit</div>
          </div>
          <span class="badge">REIMBURSEMENT CLAIM · ${claimId}</span>
        </div>

        <div class="meta-grid">
          <div class="meta-item"><label>Marketplace</label><value>${selectedChannel === 'amazon' ? 'Amazon Seller Central (FBA)' : 'Flipkart Marketplace'}</value></div>
          <div class="meta-item"><label>Claimed Amount</label><value style="color: #059669;">₹${totalReclaimable.toLocaleString()}</value></div>
          <div class="meta-item"><label>SKU / ASIN</label><value>${sku}</value></div>
          <div class="meta-item"><label>Weight Differential</label><value style="color: #dc2626;">Billed ${billedWeight}kg vs Actual ${actualWeight}kg</value></div>
        </div>

        <h3>Formal Support Ticket Submission Draft:</h3>
        <div class="ticket-text">${disputeTicketBody}</div>

        <div class="footer">
          Digitally generated by DataGem Autonomous OLAP Engine · Zero-Token Verified Reconciliation
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-[#090D14] border border-slate-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-black flex items-center justify-center font-bold text-lg shadow-md">
              ⚖️
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                1-Click Marketplace Dispute Exporter
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                  READY TO FILE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Recover unearned weight and commission overcharges from Amazon &amp; Flipkart
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

        {/* Channel Selector Pills */}
        <div className="flex items-center justify-between mt-4 mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedChannel('amazon')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedChannel === 'amazon'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <span>🛒</span> Amazon FBA Claim
            </button>
            <button
              onClick={() => setSelectedChannel('flipkart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedChannel === 'flipkart'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <span>⚡</span> Flipkart Assured Claim
            </button>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-mono block">Recoverable Amount</span>
            <span className="text-base font-bold text-emerald-400 font-mono">₹{totalReclaimable.toLocaleString()}</span>
          </div>
        </div>

        {/* Claim Overview Box */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 mb-4 text-xs font-sans">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono block">Disputed SKU</span>
            <span className="font-bold text-white font-mono mt-0.5 block">{sku}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono block">Weight Discrepancy</span>
            <span className="font-semibold text-rose-400 font-mono mt-0.5 block">
              {billedWeight}kg <span className="text-slate-500">vs</span> {actualWeight}kg
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono block">Case Ticket ID</span>
            <span className="font-bold text-sky-400 font-mono mt-0.5 block">{claimId}</span>
          </div>
        </div>

        {/* Ticket Copyable Body */}
        <div className="flex-1 overflow-auto rounded-xl bg-[#06090F] border border-slate-800 p-4 font-mono text-xs text-slate-300 leading-relaxed relative">
          <pre className="whitespace-pre-wrap font-mono text-xs">{disputeTicketBody}</pre>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-sans">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Formatted to comply with Seller Central Case Guidelines</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPDF}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold font-sans transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>Export PDF Claim</span>
            </button>

            <button
              onClick={handleCopyTicket}
              className={`px-5 py-2 rounded-xl text-xs font-bold font-sans shadow-lg transition-all flex items-center gap-2 ${
                copied
                  ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-sky-600 via-cyan-600 to-emerald-600 hover:opacity-95 text-white shadow-sky-600/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Ticket Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Ticket Draft</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
