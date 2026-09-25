import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function CommandPalette({ isOpen, onClose, onAction }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const actions = [
    { id: 'new_chat', label: 'New Chat', icon: '💬', handler: () => { onAction('new_chat'); onClose(); } },
    { id: 'focus_chat', label: 'Focus Chat Input (Cmd + /)', icon: '⌨️', handler: () => { onAction('focus_chat'); onClose(); } },
    { id: 'toggle_theme', label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, icon: theme === 'dark' ? '☀️' : '🌙', handler: () => { toggleTheme(); onClose(); } },
    { id: 'go_admin', label: 'Admin Dashboard', icon: '🛡️', handler: () => { navigate('/admin'); onClose(); } },
    { id: 'go_billing', label: 'Upgrade to Pro / Billing', icon: '⭐', handler: () => { navigate('/pricing'); onClose(); } },
    { id: 'upload_csv', label: 'Upload CSV Dataset', icon: '📊', handler: () => { onAction('upload_csv'); onClose(); } },
    { id: 'import_web', label: 'Import from Web', icon: '🌐', handler: () => { onAction('import_web'); onClose(); } },
  ];

  const filteredActions = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredActions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].handler();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, filteredActions, selectedIndex]);

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[20vh] bg-black/40 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="flex items-center px-4 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none outline-none px-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg"
          />
          <kbd className="hidden sm:inline-block px-2.5 py-1 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            ESC
          </kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredActions.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Quick Actions
              </div>
              {filteredActions.map((action, idx) => (
                <button
                  key={action.id}
                  onClick={action.handler}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-4 group ${
                    selectedIndex === idx ? 'bg-gray-100 dark:bg-gray-800 shadow-sm' : 'hover:bg-gray-100/80 dark:hover:bg-gray-800/80'
                  } text-gray-900 dark:text-gray-100`}
                >
                  <span className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:scale-110 transition-transform shadow-sm">
                    {action.icon}
                  </span>
                  <span className="font-medium text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              No results found for "{query}"
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
