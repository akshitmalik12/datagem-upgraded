import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Terminal, 
  FileSpreadsheet, 
  Globe, 
  Plus, 
  Sparkles, 
  Zap, 
  Database,
  ArrowRight
} from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, onAction }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
        else onAction('open');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onAction]);

  if (!isOpen) return null;

  const actions = [
    { id: 'new_chat', title: 'Start New Analytical Session', icon: Plus, shortcut: 'N' },
    { id: 'upload_csv', title: 'Ingest Local Dataset (CSV/Parquet)', icon: FileSpreadsheet, shortcut: 'U' },
    { id: 'import_web', title: 'Live Google Sheets / Web Import', icon: Globe, shortcut: 'I' },
    { id: 'run_sql', title: 'Open DuckDB Vectorized SQL Runner', icon: Terminal, shortcut: 'S' },
  ];

  const filtered = actions.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/75 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -10 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#090D14] rounded-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden border border-slate-800"
      >
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800/80 bg-slate-950/40">
          <Search className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to metric... (⌘K)"
            className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-slate-100 placeholder-slate-500"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
            Commands & Workflows
          </div>
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { onAction(item.id); onClose(); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-200 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-mono text-slate-300 group-hover:text-slate-100">{item.title}</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-mono text-slate-500">Run</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>DataGem Raycast Engine</span>
          <span className="text-slate-400">↑↓ to navigate · ↵ to select</span>
        </div>
      </motion.div>
    </div>
  );
}
