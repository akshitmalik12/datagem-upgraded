import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function SharedDashboard() {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-white p-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              DataGem Dashboard
            </h1>
            <p className="text-gray-500 mt-2">Shared View: #{id}</p>
          </div>
          <button onClick={() => window.location.href='/signup'} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg">
            Create Your Own
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p>This is a read-only snapshot of a DataGem analysis session.</p>
            {/* In production, map over the Chat History JSON fetched from the backend for this share ID */}
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl mt-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-2">Q: Show me the revenue trends</h3>
                <p className="text-gray-600 dark:text-gray-400">A: Based on the dataset, revenue has grown consistently at 12% MoM.</p>
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mt-4 flex items-center justify-center">
                    <span className="text-gray-500">[ Interactive Chart Placeholder ]</span>
                </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
