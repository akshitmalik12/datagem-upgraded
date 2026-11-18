import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const PROMPT_CATEGORIES = {
  contextual: {
    name: 'Contextual',
    icon: '⚡',
    shape: 'rounded-xl',
    size: 'px-6 py-3',
    prompts: [],
  },
  analysis: {
    name: 'Analysis',
    icon: '🔍',
    shape: 'rounded-xl',
    size: 'px-6 py-3',
    prompts: [
      'Generate a comprehensive data profiling report',
      'Which SKUs are bleeding net cash after accounting for returns and commissions?',
      'Audit all weight handling overcharges and calculate reclaimable cash',
      'Compare store performance vs industry web benchmarks',
      'Identify top 5 products by gross sales',
      'Summarize fee deductions and net seller payout',
    ],
  },
  visualization: {
    name: 'Visualization',
    icon: '📊',
    shape: 'rounded-xl',
    size: 'px-6 py-3',
    prompts: [
      'Bar graph of sales by product',
      'Bar graph of items sold',
      'Distribution of billed vs actual weight discrepancies',
      'Plot net profit margin vs gross revenue',
      'Daily GMV timeline trend',
    ],
  },
};

export default function PromptSuggestions({ dataset, onSelectPrompt }) {
  const [activeCategory, setActiveCategory] = useState('contextual');
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

  const getContextualPrompts = () => {
    if (!dataset) {
      return [
        'Audit all weight handling overcharges and calculate reclaimable cash',
        'Which SKUs are bleeding net cash after accounting for returns and commissions?',
        'Bar graph of sales by product',
        'Generate a comprehensive data profiling report',
        'Compare store performance vs industry web benchmarks'
      ];
    }
    
    // Extract columns whether dataset is an array of rows or a metadata profile
    let rawCols = [];
    if (Array.isArray(dataset) && dataset.length > 0) {
      rawCols = Object.keys(dataset[0]);
    } else if (dataset.columns && Array.isArray(dataset.columns)) {
      rawCols = dataset.columns.map(c => typeof c === 'string' ? c : (c.name || String(c)));
    }
    
    const lowerCols = rawCols.map(c => c.toLowerCase());
    const prompts = [];

    // Check for E-commerce & Logistics dimensions
    if (lowerCols.some(c => c.includes('weight'))) {
      prompts.push('Audit all weight handling overcharges and calculate reclaimable cash');
    }
    if (lowerCols.some(c => c.includes('sku') || c.includes('product') || c.includes('item'))) {
      prompts.push('Which SKUs are bleeding net cash after accounting for returns and commissions?');
      prompts.push('Bar graph of sales by product');
      prompts.push('Bar graph of items sold');
      prompts.push('Analyze profit contribution, commission leakage, and return rate for ELEC-W-EARBUDS');
    }
    if (lowerCols.some(c => c.includes('revenue') || c.includes('sales') || c.includes('gross') || c.includes('amount'))) {
      prompts.push('Top 5 products by gross sales');
      prompts.push('Summarize fee deductions and net seller payout');
    }
    if (lowerCols.some(c => c.includes('churn') || c.includes('retention') || c.includes('mrr'))) {
      prompts.push('Calculate Monthly Recurring Revenue (MRR) and Net Dollar Retention (NDR)');
      prompts.push('Which customer subscription tier has the highest churn rate?');
    }

    prompts.push('Generate a comprehensive data profiling report');
    prompts.push('Compare store performance vs industry web benchmarks');

    return [...new Set(prompts)].slice(0, 6);
  };

  const displayPrompts = showFavorites 
    ? favoritePrompts 
    : activeCategory === 'contextual' 
      ? (dataset ? getContextualPrompts() : [])
      : PROMPT_CATEGORIES[activeCategory]?.prompts || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto mt-3"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-700 dark:text-white/80">
          {showFavorites ? 'Favorite Prompts' : 'Suggested Prompts'}
        </p>
        <div className="flex items-center gap-2">
          {favoritePrompts.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFavorites(!showFavorites)}
              className={`px-3 py-1.5 text-xs rounded-xl backdrop-blur-xl transition-all duration-300 ${
                showFavorites
                  ? 'bg-gray-900/10 dark:bg-white/20 text-gray-900 dark:text-white border border-gray-900/20 dark:border-white/30 shadow-none'
                  : 'bg-gray-900/5 dark:bg-white/10 text-gray-700 dark:text-white/80 border border-gray-900/10 dark:border-white/20 hover:bg-gray-900/10 dark:bg-white/15 hover:border-gray-900/20 dark:border-white/30'
              }`}
            >
              Favorites ({favoritePrompts.length})
            </motion.button>
          )}
        </div>
      </div>

      {/* Category Tabs - Bigger with Different Shapes */}
      {!showFavorites && (
        <div className="flex flex-wrap gap-3 mb-4">
          {/* Contextual button - always visible */}
            <motion.button
            
            whileTap={dataset ? { scale: 0.95 } : {}}
            onClick={() => dataset && setActiveCategory('contextual')}
            disabled={!dataset}
            className={`px-8 py-4 text-base font-bold rounded-full backdrop-blur-xl transition-all duration-300 ${
              !dataset
                ? 'bg-gray-900/5 dark:bg-white/5 text-gray-500 dark:text-white/40 border-2 border-gray-900/10 dark:border-white/10 cursor-not-allowed opacity-50'
                : activeCategory === 'contextual'
                ? 'bg-accent-600 hover:bg-accent-700 !text-white border-accent-600 shadow-sm border-2 border-accent-600 shadow-none '
                : 'bg-gray-900/5 dark:bg-white/10 text-gray-700 dark:text-white/80 border-2 border-gray-900/10 dark:border-white/20 hover:bg-gray-900/10 dark:bg-white/15 hover:border-gray-900/20 dark:border-white/30 shadow-none hover:shadow-none'
              }`}
            title={!dataset ? "Upload a dataset to enable contextual prompts" : "Contextual prompts based on your dataset"}
          >
            <span className="text-xl mr-2"></span>
            Contextual
            {!dataset && <span className="ml-2 text-xs">(requires dataset)</span>}
            </motion.button>
          {Object.entries(PROMPT_CATEGORIES).map(([key, category]) => (
            <motion.button
              key={key}
              
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(key)}
              className={`${category.size} text-base font-bold ${category.shape} backdrop-blur-xl transition-all duration-300 ${
                activeCategory === key
                  ? `bg-accent-600 hover:bg-accent-700 !text-white border-accent-600 shadow-sm border-2 border-accent-600 shadow-none `
                  : 'bg-gray-900/5 dark:bg-white/10 text-gray-700 dark:text-white/80 border-2 border-gray-900/10 dark:border-white/20 hover:bg-gray-900/10 dark:bg-white/15 hover:border-gray-900/20 dark:border-white/30 shadow-none hover:shadow-none'
              }`}
            >
              <span className="text-xl mr-2">{category.icon}</span>
              {category.name}
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

