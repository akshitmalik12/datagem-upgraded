import React from 'react';

export default function SourcePanel({ activeSource, onSelectSource, onLoadSample, isSampleLoaded }) {
  return (
    <aside className="w-64 bg-slate-950/70 border-r border-slate-800/80 p-4 flex flex-col justify-between select-none">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Data Sources</span>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => onSelectSource('file')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
              activeSource === 'file'
                ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <span>📁 Uploaded Dataset</span>
            <span className="text-[10px] text-slate-500">CSV/JSON</span>
          </button>

          <button
            onClick={() => onSelectSource('sheets')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
              activeSource === 'sheets'
                ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-300'
                : 'text-slate-400 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <span>📊 Google Sheets</span>
            <span className="text-[10px] text-emerald-400">Live</span>
          </button>

          <button
            onClick={() => onSelectSource('postgres')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
              activeSource === 'postgres'
                ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-300'
                : 'text-slate-400 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <span>🛢️ PostgreSQL / Supabase</span>
            <span className="text-[10px] text-indigo-400">Pro</span>
          </button>
        </div>

        <div className="mt-8 border-t border-slate-800/80 pt-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-3">Instant Demo</span>
          <button
            onClick={onLoadSample}
            className={`w-full py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center ${
              isSampleLoaded
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:border-cyan-500/50'
            }`}
          >
            {isSampleLoaded ? '✓ E-Comm Data Active' : '⚡ Load Shopify Sample'}
          </button>
        </div>
      </div>

      <div className="border-t border-slate-800/80 pt-4">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Engine: DuckDB + Gemini</span>
          <span className="text-emerald-400">Online</span>
        </div>
      </div>
    </aside>
  );
}
