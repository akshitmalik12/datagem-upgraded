import React from 'react';

export default function InspectorPanel({ activeTab, setActiveTab, generatedCode, activePlot }) {
  return (
    <aside className="w-80 bg-slate-950/70 border-l border-slate-800/80 p-4 flex flex-col justify-between select-none">
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Audit & Inspector</span>
          <div className="flex gap-1 bg-slate-900 p-0.5 rounded-md border border-slate-800">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-2 py-1 text-[11px] font-mono rounded ${
                activeTab === 'code' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Formula
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`px-2 py-1 text-[11px] font-mono rounded ${
                activeTab === 'export' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Export
            </button>
          </div>
        </div>

        {activeTab === 'code' ? (
          <div className="flex-1 overflow-y-auto font-mono text-[11px] bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-slate-300">
            <div className="text-slate-500 mb-2 font-sans font-medium text-xs">Verified Logic (Python/DuckDB):</div>
            <pre className="whitespace-pre-wrap break-all leading-relaxed text-cyan-200/90">
              {generatedCode || "# Execute an analysis to inspect verified execution code and math."}
            </pre>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <button
              onClick={() => alert("Exporting dataset to CSV...")}
              className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-left flex items-center justify-between transition-all"
            >
              <span>Download Cleaned CSV</span>
              <span className="text-slate-500 font-mono text-[10px]">.csv</span>
            </button>

            <button
              onClick={() => alert("Exporting chart image...")}
              className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-left flex items-center justify-between transition-all"
            >
              <span>Export High-Res Chart</span>
              <span className="text-slate-500 font-mono text-[10px]">.png</span>
            </button>

            <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg mt-4">
              <span className="text-[11px] font-medium text-cyan-300 block mb-1">Weekly Executive Briefing</span>
              <p className="text-[10px] text-slate-400 leading-normal">
                Upgrade to Pro to schedule this analysis directly to your team's Slack or email every Monday at 8 AM.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
          <span>🔒 Zero-Trust Sandbox Protected</span>
        </div>
      </div>
    </aside>
  );
}
