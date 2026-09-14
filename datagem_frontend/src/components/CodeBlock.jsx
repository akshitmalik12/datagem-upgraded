import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../contexts/ThemeContext';

export default function CodeBlock({ code, language = 'python', tool, onRunCode }) {
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const { theme } = useTheme();
  const codeStyle = theme === 'dark' ? vscDarkPlus : vs;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="relative rounded-xl overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/50 shadow-glass dark:shadow-glass-dark group"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-500/0 via-accent-500/0 to-accent-500/0 group-hover:from-accent-500/10 group-hover:via-accent-500/10 group-hover:to-accent-500/10 transition-all duration-500 pointer-events-none rounded-xl" />
      
      {/* Toolbar */}
      <div className="relative flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50/90 to-gray-100/90 dark:from-gray-800/90 dark:to-gray-850/90 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/30">
        <div className="flex items-center gap-3">
          {tool && (
            <span className="text-xs font-semibold text-accent-600 dark:text-accent-400">
              🔧 {tool}
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
            {language}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {code.split('\n').length} lines
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.8)' : 'rgba(229, 231, 235, 0.8)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="p-1.5 rounded-lg backdrop-blur-sm bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 border border-white/20 dark:border-gray-600/30"
            title={showLineNumbers ? 'Hide line numbers' : 'Show line numbers'}
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
          {onRunCode && (
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onRunCode}
              className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg backdrop-blur-sm"
              title="Re-run code"
            >
              ▶ Run
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.8)' : 'rgba(229, 231, 235, 0.8)' }}
            whileTap={{ scale: 0.9 }}
            onClick={copyToClipboard}
            className="p-1.5 rounded-lg backdrop-blur-sm bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 border border-white/20 dark:border-gray-600/30 relative"
            title="Copy code"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.svg
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-4 h-4 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-4 h-4 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative overflow-x-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <SyntaxHighlighter
          language={language}
          style={codeStyle}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            background: theme === 'dark' 
              ? 'rgba(30, 30, 30, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          }}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1.5em',
            color: theme === 'dark' ? '#6e7681' : '#9ca3af',
            userSelect: 'none',
            opacity: 0.7,
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </motion.div>
  );
}

