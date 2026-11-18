import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  User, 
  LogOut, 
  Check, 
  X, 
  ExternalLink,
  Zap,
  Lock
} from 'lucide-react';
import { API_BASE_URL } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SettingsModal({ isOpen, onClose, onOpenUpgrade }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('subscription'); // 'subscription' | 'keys' | 'persona' | 'account'
  const [systemPrompt, setSystemPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // API keys
  const [groqKey, setGroqKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [openRouterKey, setOpenRouterKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Load custom keys from localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('datagem_custom_keys') || '{}');
        if (stored.groq) setGroqKey(stored.groq);
        if (stored.gemini) setGeminiKey(stored.gemini);
        if (stored.openrouter) setOpenRouterKey(stored.openrouter);
      } catch (e) {}

      // Fetch user profile and persona
      const fetchSettings = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.system_prompt) {
            setSystemPrompt(data.system_prompt);
          }
        } catch (e) {
          console.error('Error fetching settings:', e);
        }
      };
      fetchSettings();
    }
  }, [isOpen]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Save custom keys to local storage
      const keysObj = {
        groq: groqKey.trim(),
        gemini: geminiKey.trim(),
        openrouter: openRouterKey.trim()
      };
      localStorage.setItem('datagem_custom_keys', JSON.stringify(keysObj));

      // 2. Save persona to backend
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/me/prompt`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ system_prompt: systemPrompt })
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      alert("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentTier = user?.tier?.toLowerCase() || 'free';
  const tierDisplay = {
    free: { name: 'Starter Analyst', color: 'text-slate-400 bg-slate-800/80 border-slate-700' },
    pro: { name: 'Pro Growth', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    operator: { name: 'Autonomous Operator', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    enterprise: { name: 'Enterprise Scale', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  }[currentTier] || { name: 'Starter Analyst', color: 'text-slate-400 bg-slate-800 border-slate-700' };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative bg-white dark:bg-[#090D14] rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden font-sans flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">DataGem Settings</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage your subscription, free AI keys, and analytical persona.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-2 bg-slate-50/50 dark:bg-[#05070A]/50 text-xs font-mono">
            {[
              { id: 'subscription', label: 'Subscription Plan', icon: CreditCard },
              { id: 'keys', label: 'AI Provider Keys', icon: Key },
              { id: 'persona', label: 'Custom Persona', icon: Sparkles },
              { id: 'account', label: 'Account & Security', icon: User }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-3 border-b-2 font-medium flex items-center gap-2 transition-all ${
                    active
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">

            {/* TAB 1: SUBSCRIPTION */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#05070A] border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Current Active Tier</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${tierDisplay.color}`}>
                        {tierDisplay.name}
                      </span>
                      {currentTier === 'enterprise' && (
                        <span className="text-[11px] font-mono text-purple-400 font-semibold">★ Root Tier</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {currentTier === 'enterprise' 
                        ? 'Unlimited access to all In-Memory OLAP queries, marketplace connectors, and custom sandboxes.'
                        : 'Explore DataGem core capabilities with zero token consumption.'}
                    </p>
                  </div>

                  {currentTier !== 'enterprise' && (
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenUpgrade) {
                          onOpenUpgrade();
                        } else {
                          navigate('/pricing');
                        }
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:opacity-95 text-black font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
                    >
                      Upgrade Plan
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D14]">
                    <div className="text-xs text-slate-500 font-mono">Daily DuckDB Queries</div>
                    <div className="text-xl font-bold font-mono mt-1 text-slate-900 dark:text-white">
                      {currentTier === 'enterprise' || currentTier === 'operator' ? 'Unlimited' : (currentTier === 'pro' ? '150 / day' : '15 / day')}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D14]">
                    <div className="text-xs text-slate-500 font-mono">Max File Upload Size</div>
                    <div className="text-xl font-bold font-mono mt-1 text-slate-900 dark:text-white">
                      {currentTier === 'enterprise' ? '5 GB' : (currentTier === 'operator' ? '500 MB' : (currentTier === 'pro' ? '100 MB' : '10 MB'))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AI PROVIDER KEYS */}
            {activeTab === 'keys' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs text-sky-400 leading-relaxed">
                  💡 <strong>Zero Cost Guarantee:</strong> DataGem runs deterministic computations on our in-memory DuckDB sandbox with 0 tokens. To enable multi-turn AI reasoning and Groq Whisper audio, you can link your own 100% free keys below.
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Groq Cloud API Key (Llama 3.3 70B & Whisper Audio)
                    </label>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-500 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>Get Free Groq Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Google AI Studio Key (Gemini 2.0 Flash)
                    </label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-500 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>Get Free Gemini Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      OpenRouter Free Key (Emergency Fallback)
                    </label>
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-500 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>Get Free Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={openRouterKey}
                    onChange={(e) => setOpenRouterKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: CUSTOM PERSONA */}
            {activeTab === 'persona' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    Executive Persona Instructions
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Instruct DataGem on your preferred tone, currency format, or mathematical rigor.
                  </p>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="e.g. You are a Chief Revenue Officer. Always highlight SKU gross margin after returns, output figures in INR (₹), and flag volumetric weight overcharges first."
                    className="w-full h-36 p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: ACCOUNT & SECURITY */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#05070A] space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Authenticated Email:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Security Safeguard:</span>
                    <span className="text-emerald-500 font-medium">6-Hour Inactivity Auto-Logout (Active)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Session Status:</span>
                    <span className="text-slate-400">Authenticated via JWT Token</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                      navigate('/login');
                    }}
                    className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out of DataGem</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#05070A]/50 flex items-center justify-between">
            <div>
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Settings saved successfully!</span>
                </span>
              )}
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
