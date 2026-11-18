import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Terminal, 
  Layers, 
  Zap, 
  Database, 
  FileSpreadsheet, 
  Download, 
  Copy, 
  Check, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import SourcePanel from './SourcePanel';
import InspectorPanel from './InspectorPanel';
import { SAMPLE_ECOMMERCE_DATA, SAMPLE_PROMPTS } from '../../utils/sampleData';

export default function StudioWorkspace() {
  const [activeSource, setActiveSource] = useState('file');
  const [isSampleLoaded, setIsSampleLoaded] = useState(false);
  const [queryInput, setQueryInput] = useState('');
  const [activeTab, setActiveTab] = useState('code');
  const [copied, setCopied] = useState(false);
  
  // Sample initial state
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: "Welcome to DataGem 2.0 Studio. Connect a dataset or click 'Load Shopify Sample' to inspect instant cohort performance, ad spend anomalies, and verified profit margins.",
      timestamp: 'Just now',
      code: null,
      metrics: null
    }
  ]);

  const handleLoadSample = () => {
    setIsSampleLoaded(true);
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'assistant',
        text: "⚡ Shopify & Meta Ads sample dataset connected! 10 orders loaded across 4 SKUs with tracked ad spend and customer cohorts.",
        timestamp: 'Just now',
        metrics: [
          { label: 'Total Revenue', value: '$830.00', trend: '+14.2%' },
          { label: 'Blended ROAS', value: '3.92x', trend: 'Strong' },
          { label: 'Refund Rate', value: '12.8%', trend: '-2.1%' }
        ],
        code: `# DuckDB Stream Analysis\nimport duckdb\ncon = duckdb.connect(':memory:')\ncon.execute("CREATE VIEW orders AS SELECT * FROM read_json_auto('dataset.json')")\nprint(con.execute("SELECT sku, SUM(revenue) as rev, SUM(ad_spend) as ads FROM orders GROUP BY sku").fetchdf())`
      }
    ]);
  };

  const handlePromptClick = (prompt) => {
    setQueryInput(prompt);
  };

  const handleCopyCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen w-screen bg-[#07090E] text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Studio Bar */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-mono font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            DG
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight text-sm text-slate-100">DataGem Studio</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/60 text-cyan-300">
              v2.0 Pro
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Zero-Trust MicroVM Active</span>
          </div>
          <button 
            onClick={() => alert("Upgrade to Pro: ₹9,999/month for unlimited scheduled briefings & live Postgres.")}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            Upgrade Plan
          </button>
        </div>
      </header>

      {/* 3-Pane Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Sources & Connectors */}
        <SourcePanel 
          activeSource={activeSource}
          onSelectSource={setActiveSource}
          onLoadSample={handleLoadSample}
          isSampleLoaded={isSampleLoaded}
        />

        {/* Center Canvas: Chat & Analysis Feed */}
        <main className="flex-1 flex flex-col bg-gradient-to-b from-[#090D16] to-[#06080D] relative overflow-hidden">
          {/* Messages Timeline */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex flex-col max-w-3xl ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-mono text-slate-400">
                      {msg.sender === 'user' ? 'You' : 'DataGem Copilot'}
                    </span>
                    <span className="text-[10px] text-slate-600">{msg.timestamp}</span>
                  </div>

                  <div className="p-4 rounded-xl border bg-slate-900/70 border-slate-800/80 text-sm text-slate-200 leading-relaxed shadow-lg backdrop-blur-sm">
                    {msg.text}

                    {/* Render Metric Cards if present */}
                    {msg.metrics && (
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        {msg.metrics.map((m, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                            <span className="text-[10px] font-mono uppercase text-slate-500 block">{m.label}</span>
                            <div className="flex items-baseline justify-between mt-1">
                              <span className="text-base font-bold text-slate-100">{m.value}</span>
                              <span className="text-[10px] font-mono text-emerald-400">{m.trend}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Render Verified Code block if attached */}
                    {msg.code && (
                      <div className="mt-4 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden">
                        <div className="px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1.5">
                            <Terminal className="w-3 h-3" /> Verified Math & Python Logic
                          </span>
                          <button 
                            onClick={() => handleCopyCode(msg.code)}
                            className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                          >
                            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="p-3 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                          {msg.code}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Prompt Shortcuts */}
          <div className="px-6 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-800/40">
            <span className="text-[10px] uppercase font-mono text-slate-500 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Suggested:
            </span>
            {SAMPLE_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(p)}
                className="text-xs text-slate-400 hover:text-cyan-300 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 px-3 py-1 rounded-full whitespace-nowrap transition-all flex items-center gap-1"
              >
                <span>{p}</span>
                <ChevronRight className="w-3 h-3 opacity-50" />
              </button>
            ))}
          </div>

          {/* Bottom Input Composer */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!queryInput.trim()) return;
                const newMsg = {
                  id: Date.now(),
                  sender: 'user',
                  text: queryInput,
                  timestamp: 'Just now'
                };
                setMessages(prev => [...prev, newMsg]);
                setQueryInput('');
              }}
              className="relative flex items-center max-w-4xl mx-auto"
            >
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Ask about SKU profitability, cohort churn, or ad spend anomalies..."
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all pr-24 shadow-inner font-sans"
              />
              <button
                type="submit"
                className="absolute right-2 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              >
                <span>Query</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </main>

        {/* Right Pane: Inspector, Verified Formula & Exports */}
        <InspectorPanel 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          generatedCode={messages[messages.length - 1]?.code}
        />
      </div>
    </div>
  );
}
