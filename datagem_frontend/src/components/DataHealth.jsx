import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function DataHealth() {
  const healthData = [
    { name: 'Healthy', value: 85, color: '#10b981' },
    { name: 'Issues', value: 15, color: '#ef4444' }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Data Health Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Overall Health Score</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {healthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-3xl font-bold text-green-400">85%</div>
        </motion.div>

        <motion.div 
          className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Semantic Data Types</h2>
          <ul className="space-y-3">
            <li className="flex justify-between items-center"><span className="text-gray-400">Categorical</span> <span className="font-mono text-blue-400">4</span></li>
            <li className="flex justify-between items-center"><span className="text-gray-400">Numerical</span> <span className="font-mono text-purple-400">6</span></li>
            <li className="flex justify-between items-center"><span className="text-gray-400">Datetime</span> <span className="font-mono text-green-400">1</span></li>
            <li className="flex justify-between items-center"><span className="text-gray-400">Text</span> <span className="font-mono text-yellow-400">2</span></li>
          </ul>
        </motion.div>

        <motion.div 
          className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Cost & Memory</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1"><span className="text-sm text-gray-400">Memory Usage</span><span className="text-sm text-gray-200">45 MB</span></div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span className="text-sm text-gray-400">Storage Cost (Est.)</span><span className="text-sm text-gray-200">$0.02 / mo</span></div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Column Quality (Sparklines)</h2>
          <div className="space-y-4">
            {['Age', 'Salary', 'Score'].map((col) => (
              <div key={col} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 w-1/3">{col}</span>
                <div className="w-2/3 h-6 flex items-end space-x-1">
                  {[...Array(10)].map((_, i) => (
                    <div 
                      key={i} 
                      className="bg-blue-400 w-full rounded-t-sm opacity-80" 
                      style={{ height: `${Math.max(20, Math.random() * 100)}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
