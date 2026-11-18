import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const PROMPT_CATEGORIES = {
  clawback: {
    name: 'Cash Recovery',
    icon: '💰',
    badge: 'Clawbacks & SPF',
    shape: 'rounded-xl',
    size: 'px-4 py-2.5',
    prompts: [
      'Audit all weight handling overcharges and calculate reclaimable cash',
      'Identify Flipkart return freight penalties eligible for SPF reimbursement',
      'Generate 1-click Amazon dispute docket for volumetric overbilling',
      'Audit marketplace commission discrepancies against agreed fee schedule',
      'Extract all RTO (Return to Origin) shipping fee deductions for clawback',
    ],
  },
  bleeders: {
    name: 'Margin Bleeders',
    icon: '📉',
    badge: 'CM3 Loss Prevention',
    shape: 'rounded-xl',
    size: 'px-4 py-2.5',
    prompts: [
      'Which SKUs are bleeding net cash after accounting for returns and commissions?',
      'Pinpoint high-volume products where return rate exceeds 20% and CM3 is negative',
      'Calculate blended ROAS vs break-even ad cost per SKU',
      'Summarize fee deductions and net seller payout vs gross sales',
      'Rank top 5 products by true contribution margin (CM3)',
    ],
  },
  modeling: {
    name: 'Profit Modeling',
    icon: '🧪',
    badge: 'What-If Scenarios',
    shape: 'rounded-xl',
    size: 'px-4 py-2.5',
    prompts: [
      'Model demand elasticity vs margin expansion (+5% to +15% price hike)',
      'Run Buy Box price match simulation and check net contribution margin',
      'Simulate EBITDA impact if return rate drops by 3% across top SKUs',
      'Forecast 12-month cash flow and runway under 15% GMV growth',
      'Sensitivity analysis: Ad spend reduction vs order volume impact',
    ],
  },
  reporting: {
    name: 'Board Reports',
    icon: '📊',
    badge: 'CFO Summaries',
    shape: 'rounded-xl',
    size: 'px-4 py-2.5',
    prompts: [
      'Compile Monday 8 AM Executive P&L Briefing',
      'Generate monthly CFO reconciliation report with Plotly visuals',
      'Compare store performance vs industry web benchmarks',
      'Generate a comprehensive data profiling and integrity audit',
      'Plot daily GMV timeline trend vs net contribution margin',
    ],
  },
};

export default function PromptSuggestions({ dataset, onSelectPrompt }) {
  const [activeCategory, setActiveCategory] = useState('clawback');
  const [recentPrompts, setRecentPrompts] = useState([]);
  const [favoritePrompts, setFavoritePrompts] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const { theme } = useTheme();

  // Load recent and favorite prompts from localStorage
  useEffect(() => {
    try {
      const savedRecent = localStorage.getItem('datagem_recent_prompts');
      const savedFavorites = localStorage.getItem('datagem_favorite_prompts');
      if (savedRecent) {
        setRecentPrompts(JSON.parse(savedRecent));
      }
      if (savedFavorites) {
        setFavoritePrompts(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading prompt history:', error);
    }
  }, []);

  // Save recent prompts to localStorage
  const saveRecentPrompt = (prompt) => {
    const updated = [prompt, ...recentPrompts.filter(p => p !== prompt)].slice(0, 10);
    setRecentPrompts(updated);
    localStorage.setItem('datagem_recent_prompts', JSON.stringify(updated));
  };

  // Toggle favorite prompt
  const toggleFavorite = (prompt, e) => {
    e.stopPropagation();
    const updated = favoritePrompts.includes(prompt)
      ? favoritePrompts.filter(p => p !== prompt)
      : [...favoritePrompts, prompt];
    setFavoritePrompts(updated);
    localStorage.setItem('datagem_favorite_prompts', JSON.stringify(updated));
  };

  const handlePromptClick = (prompt) => {
    saveRecentPrompt(prompt);
    onSelectPrompt(prompt);
  };

  const getDynamicPrompts = () => {
    const basePrompts = PROMPT_CATEGORIES[activeCategory]?.prompts || [];
    if (!dataset) return basePrompts;
    
    // Extract columns whether dataset is an array of rows or a metadata profile
    let rawCols = [];
    if (Array.isArray(dataset) && dataset.length > 0) {
      rawCols = Object.keys(dataset[0]);
    } else if (dataset.columns && Array.isArray(dataset.columns)) {
      rawCols = dataset.columns.map(c => typeof c === 'string' ? c : (c.name || String(c)));
    }
    
    const lowerCols = rawCols.map(c => c.toLowerCase());
    const extra = [];

    if (activeCategory === 'clawback') {
      if (lowerCols.some(c => c.includes('weight'))) {
        extra.push('Audit billed vs actual volumetric weight deltas across all order rows');
      }
      if (lowerCols.some(c => c.includes('fee') || c.includes('commission'))) {
        extra.push('Calculate total marketplace fee overcharge in DuckDB (₹ and %)');
      }
    } else if (activeCategory === 'bleeders') {
      if (lowerCols.some(c => c.includes('return') || c.includes('rto'))) {
        extra.push('Which products have return rate > 18% with negative net profit?');
      }
    } else if (activeCategory === 'modeling') {
      if (lowerCols.some(c => c.includes('mrr') || c.includes('churn'))) {
        extra.push('Simulate ARR growth if net retention increases from 104% to 112%');
      }
    }

    return [...new Set([...extra, ...basePrompts])].slice(0, 6);
  };

  const displayPrompts = showFavorites 
    ? favoritePrompts 
    : getDynamicPrompts();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto mt-3"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
          {showFavorites ? 'Favorite Playbooks' : '⚡ Executive Decision Playbooks'}
        </p>
        <div className="flex items-center gap-2">
          {favoritePrompts.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFavorites(!showFavorites)}
              className={`px-3 py-1.5 text-xs rounded-xl backdrop-blur-xl transition-all duration-300 ${
                showFavorites
                  ? 'bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-400/40 shadow-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              Favorites ({favoritePrompts.length})
            </motion.button>
          )}
        </div>
      </div>

      {/* Outcome-Driven Playbook Category Tabs */}
      {!showFavorites && (
        <div className="flex flex-wrap gap-2.5 mb-4">
          {Object.entries(PROMPT_CATEGORIES).map(([key, category]) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveCategory(key)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 flex items-center gap-2 ${
                activeCategory === key
                  ? 'bg-sky-600 text-white border-sky-500 shadow-sm shadow-sky-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className="text-sm">{category.icon}</span>
              <span>{category.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                activeCategory === key 
                  ? 'bg-sky-700/60 text-sky-100' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                {category.badge}
              </span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Prompts Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + showFavorites}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-wrap gap-2"
        >
          {activeCategory === 'contextual' && !dataset ? (
            <div className="w-full py-8 text-center">
              <p className="text-gray-600 dark:text-white/60 text-sm mb-2">
                 Upload a CSV dataset to see contextual prompts
              </p>
              <p className="text-gray-500 dark:text-white/40 text-xs">
                Contextual prompts are generated based on your dataset's columns and structure
              </p>
            </div>
          ) : displayPrompts.length > 0 ? (
            displayPrompts.map((prompt, idx) => (
              <motion.div
                key={prompt}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                
                className="group relative inline-block"
              >
                <button
                  onClick={() => handlePromptClick(prompt)}
                  className="px-4 py-2 text-xs font-medium backdrop-blur-xl bg-white/30 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-white/50 dark:hover:bg-white/20 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-500 shadow-none hover:shadow-none whitespace-nowrap cursor-pointer"
                >
                  {prompt}
                </button>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => toggleFavorite(prompt, e)}
                  className={`absolute -top-1 -right-1 p-0.5 rounded-full transition-colors bg-white dark:bg-gray-800 ${
                    favoritePrompts.includes(prompt)
                      ? 'text-yellow-500'
                      : 'text-gray-400 opacity-0 group-hover:opacity-100'
                  }`}
                  title={favoritePrompts.includes(prompt) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </motion.button>
              </motion.div>
            ))
          ) : (
            <p className="text-xs text-gray-600 dark:text-white/60 italic">
              {showFavorites ? 'No favorite prompts yet. Click the star icon on any prompt to add it to favorites.' : 'No prompts available.'}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Recent Prompts */}
      {recentPrompts.length > 0 && !showFavorites && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 pt-4 border-t border-gray-900/10 dark:border-white/10"
        >
          <p className="text-xs font-medium text-gray-700 dark:text-white/80 mb-2">
            Recent Prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {recentPrompts.slice(0, 5).map((prompt, idx) => (
              <motion.button
                key={prompt + idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePromptClick(prompt)}
                className="px-3 py-1.5 text-xs backdrop-blur-xl bg-white/30 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-white/50 dark:hover:bg-white/20 transition-all duration-300 border border-gray-200 dark:border-gray-700 shadow-none whitespace-nowrap"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

