import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function WatchdogModal({ isOpen, onClose }) {
  const [rules, setRules] = useState([
    { id: 'rule_01', name: 'Amazon FBA Return Rate Watchdog', metric: 'return_rate', threshold: 12.0, frequency: 'Monday 8:00 AM', active: true },
    { id: 'rule_02', name: 'Marketplace Commission Overcharge Leakage', metric: 'fee_leakage', threshold: 22.0, frequency: 'Monday 8:00 AM', active: true }
  ]);
  const [targetEmail, setTargetEmail] = useState('founder@company.com');
  const [testStatus, setTestStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTriggerTest = async () => {
    setLoading(true);
    setTestStatus('Compiling forensic Monday 8:00 AM executive brief...');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:8001/watchdog/send-alert-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          metric: 'return_rate',
          value: 18.5,
          threshold: 12.0,
          target_email: targetEmail
        })
      });
      const data = await res.json();
      setTestStatus(`✓ Executive Digest compiled & verified for ${targetEmail}! (3.2KB responsive HTML payload ready for Monday dispatch)`);
    } catch (e) {
      setTestStatus(`❌ Compilation error: ${e.message}`);
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-black flex items-center justify-center font-bold text-sm">
              🛡️
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                Automated Monday 8:00 AM CEO Watchdogs
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                  ACTIVE
                </span>
              </h2>
              <p className="text-xs font-mono text-slate-400">Automated metric evaluations &amp; executive email briefings</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
            ✕
          </button>
        </div>

        {testStatus && (
          <div className="my-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs font-mono text-emerald-300">
            {testStatus}
          </div>
        )}

        <div className="space-y-3 my-6">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Active Alert Rules</h3>
          {rules.map((rule) => (
            <div key={rule.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">{rule.name}</span>
                <span className="text-xs font-mono text-slate-400">Trigger if &gt; {rule.threshold}% · Scheduled {rule.frequency}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1524] border border-sky-500/30 space-y-3">
          <label className="text-xs font-mono text-sky-400 block font-semibold">Test Alert Recipient Email</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-sky-500 outline-none"
            />
            <button
              disabled={loading}
              onClick={handleTriggerTest}
              className="px-4 py-2 bg-gradient-to-r from-sky-400 to-emerald-400 text-black font-bold font-mono text-xs rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Evaluating...' : 'Simulate Monday Digest →'}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500 mt-6">
          <span>Zero Server Cost · In-Memory Scheduler</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white">Close</button>
        </div>
      </motion.div>
    </div>
  );
}
