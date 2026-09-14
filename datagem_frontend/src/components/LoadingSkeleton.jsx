import { motion, AnimatePresence } from 'framer-motion';

export function MessageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start mb-6"
    >
      <div className="max-w-3xl bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 shadow-sm border border-gray-200 dark:border-gray-700 w-full">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CodeBlockSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900"
    >
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="p-4 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${80 + Math.random() * 20}%` }} />
        ))}
      </div>
    </motion.div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full border border-gray-300 dark:border-gray-600 text-sm">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-2 border-b border-gray-300 dark:border-gray-600">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mx-auto" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: cols }).map((_, colIdx) => (
                <td key={colIdx} className="px-4 py-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



export function ProgressIndicator({ steps, currentStep }) {
  const currentAction = steps[currentStep] || "Processing";
  
  // Custom text for better UX
  let displayAction = "Thinking...";
  if (currentAction.toLowerCase().includes("analyz")) displayAction = "Analyzing your data...";
  if (currentAction.toLowerCase().includes("execut")) displayAction = "Running Python analysis...";
  if (currentAction.toLowerCase().includes("summariz")) displayAction = "Formatting insights...";

  return (
    <div className="flex items-center gap-4 mb-4 p-4 rounded-xl border border-accent-500/20 bg-accent-500/5 dark:bg-accent-500/10 max-w-md w-full">
      <div className="relative flex items-center justify-center w-5 h-5">
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-accent-500 rounded-full blur-sm"
        />
        <div className="relative w-2 h-2 bg-accent-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
      </div>
      <AnimatePresence mode="wait">
        <motion.span
          key={displayAction}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="text-sm font-semibold tracking-wide text-accent-700 dark:text-accent-300"
        >
          {displayAction}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

