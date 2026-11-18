import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../services/api';

export default function WatchdogModal({ isOpen, onClose, onOpenCheckout }) {
  const [scheduleDays, setScheduleDays] = useState(['Monday', 'Thursday']);
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [targetEmail, setTargetEmail] = useState('');
  const [isPaid, setIsPaid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [rules, setRules] = useState([
    { id: 'rule_01', name: 'Amazon FBA Return Rate Watchdog', metric: 'return_rate', threshold: 12.0, active: true },
    { id: 'rule_02', name: 'Marketplace Commission Overcharge Leakage', metric: 'fee_leakage', threshold: 22.0, active: true },
    { id: 'rule_03', name: 'SaaS Net Dollar Retention (NDR) Dip', metric: 'ndr_dip', threshold: 105.0, active: true }
  ]);

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/watchdog/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsPaid(data.is_paid);
        if (data.settings) {
          setScheduleDays(data.settings.schedule_days || ['Monday', 'Thursday']);
          setScheduleTime(data.settings.schedule_time || '08:00');
          setTimezone(data.settings.timezone || 'Asia/Kolkata');
          setTargetEmail(data.settings.target_email || '');
        }
      }
    } catch (e) {
      console.error('Error fetching watchdog settings:', e);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setStatusMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/watchdog/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          schedule_days: scheduleDays,
          schedule_time: scheduleTime,
          timezone: timezone,
          target_email: targetEmail,
          active: true
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`✓ Schedule saved: ${scheduleDays.join(' & ')} at ${scheduleTime} (${timezone})`);
      } else {
        setStatusMessage(`❌ ${data.detail || 'Failed to update schedule'}`);
      }
    } catch (e) {
      setStatusMessage(`❌ Error: ${e.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTriggerTest = async () => {
    setLoading(true);
    setStatusMessage('Compiling executive brief and dispatching via Resend API...');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/watchdog/send-alert-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          metric: 'fee_leakage',
          value: 24.8,
          threshold: 18.0,
          target_email: targetEmail || 'aakshitmalik@gmail.com'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`✓ Executive Briefing successfully dispatched to ${data.recipient}! Check your inbox.`);
      } else {
        setStatusMessage(`❌ ${data.detail || 'Failed to dispatch test alert'}`);
      }
    } catch (e) {
      setStatusMessage(`❌ Compilation error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#090D14] border border-slate-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-black flex items-center justify-center font-bold text-base shadow-lg shadow-emerald-500/20">
              🛡️
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                Autonomous Executive Watchdog Sentinel
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                  {scheduleDays.join(' & ')} {scheduleTime}
                </span>
              </h2>
              <p className="text-xs font-mono text-slate-400">Continuous anomaly detection &amp; executive briefing digest</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Free Plan Lock Screen */}
        {!isPaid ? (
          <div className="my-8 p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0A101D] border border-amber-500/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-xl">
              🔒
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Paid Plan Feature</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                Automated Monday &amp; Thursday anomaly scans, fee leakage alerts, and instant dispute generation are reserved for <strong>Pro Growth ($29/mo)</strong> and <strong>Autonomous Operator</strong> tiers.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenCheckout) onOpenCheckout('pro');
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
              >
                Upgrade to Pro Growth ($29/mo) &rarr;
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Status Feedback Banner */}
            {statusMessage && (
              <div className="my-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs font-mono text-emerald-300">
                {statusMessage}
              </div>
            )}

            {/* Timing Preferences Selector */}
            <div className="my-5 p-4 rounded-2xl bg-[#0C121E] border border-slate-800 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold flex items-center justify-between">
                <span>⏱️ Scanning Schedule &amp; Timing Preferences</span>
                <span className="text-[10px] text-slate-500 normal-case">Customizable for your timezone</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {/* Cadence Selection */}
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Scanning Days</label>
                  <select
                    value={scheduleDays.join(',')}
                    onChange={(e) => setScheduleDays(e.target.value.split(','))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-sky-500 outline-none"
                  >
                    <option value="Monday,Thursday">Mon &amp; Thu 8 AM (Recommended)</option>
                    <option value="Monday">Monday 8 AM Only</option>
                    <option value="Thursday">Thursday 8 AM Only</option>
                    <option value="Monday,Wednesday,Friday">Mon, Wed &amp; Fri</option>
                    <option value="Daily">Daily Morning Digest</option>
                  </select>
                </div>

                {/* Delivery Time Selection */}
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Briefing Time</label>
                  <select
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-sky-500 outline-none"
                  >
                    <option value="08:00">08:00 AM (Pre-Market)</option>
                    <option value="09:00">09:00 AM (Workday Start)</option>
                    <option value="12:00">12:00 PM (Noon Digest)</option>
                    <option value="18:00">06:00 PM (Evening Summary)</option>
                  </select>
                </div>

                {/* Timezone Selection */}
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-sky-500 outline-none"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="UTC">UTC Standard</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  disabled={savingSettings}
                  onClick={handleSaveSettings}
                  className="px-4 py-1.5 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-300 font-mono text-xs hover:bg-sky-500/30 transition-colors disabled:opacity-50"
                >
                  {savingSettings ? 'Saving...' : 'Save Timing Preferences'}
                </button>
              </div>
            </div>

            {/* Active Alert Rules */}
            <div className="space-y-2.5 my-5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Active Anomaly Detection Rules ({scheduleDays.join(' & ')} {scheduleTime})
              </h3>
              {rules.map((rule) => (
                <div key={rule.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white block">{rule.name}</span>
                    <span className="text-xs font-mono text-slate-400">
                      Trigger alert if metric &gt; {rule.threshold}% · Evaluated {scheduleDays.join(' & ')} at {scheduleTime}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>

            {/* Live Test Dispatch */}
            <div className="p-4 rounded-2xl bg-[#0B1524] border border-sky-500/30 space-y-3">
              <label className="text-xs font-mono text-sky-400 block font-semibold">
                Dispatch Immediate Test Briefing via Resend
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="recipient@company.com"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-sky-500 outline-none"
                />
                <button
                  disabled={loading}
                  onClick={handleTriggerTest}
                  className="px-4 py-2 bg-gradient-to-r from-sky-400 to-emerald-400 text-black font-bold font-mono text-xs rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Evaluating...' : 'Dispatch Live Briefing →'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500 mt-6">
          <span>Bi-Weekly Execution · Option A Linear Clean Delivery</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
