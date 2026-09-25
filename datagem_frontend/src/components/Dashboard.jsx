import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Plot from 'react-plotly.js';
import { dashboardApi } from '../services/api';

export default function Dashboard() {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCharts();
  }, []);

  const loadCharts = async () => {
    try {
      const response = await dashboardApi.getCharts();
      setCharts(response.data);
    } catch (error) {
      console.error("Failed to load dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteChart = async (id) => {
    if (!window.confirm("Are you sure you want to remove this chart?")) return;
    try {
      await dashboardApi.deleteChart(id);
      setCharts(charts.filter(c => c.id !== id));
    } catch (e) {
      alert("Failed to delete chart");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 p-8 font-sans relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-2">My <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Dashboard.</span></h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Your saved visualizations and insights.</p>
          </div>
          <button onClick={() => navigate('/chat')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Chat
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : charts.length === 0 ? (
          <div className="text-center py-32 bg-white/50 dark:bg-gray-800/30 backdrop-blur-md rounded-[3rem] border border-gray-200 dark:border-gray-700/50 shadow-xl">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No charts saved yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">When you generate interesting visualizations in the chat, click "Save to Dashboard" to pin them here.</p>
            <button onClick={() => navigate('/chat')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors inline-block">
              Start Analyzing Data
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.map((chart) => {
              const plotData = JSON.parse(chart.plotly_json);
              
              // Apply theme to plot
              const isDark = document.documentElement.classList.contains('dark');
              const textColor = isDark ? '#e5e7eb' : '#374151'; 
              const gridColor = isDark ? '#374151' : '#e5e7eb';
              
              const themedLayout = {
                ...plotData.layout,
                autosize: true,
                paper_bgcolor: 'transparent', 
                plot_bgcolor: 'transparent',
                font: { ...plotData.layout?.font, color: textColor },
                xaxis: { ...plotData.layout?.xaxis, gridcolor: gridColor, zerolinecolor: gridColor, tickfont: { color: textColor }, titlefont: { color: textColor } },
                yaxis: { ...plotData.layout?.yaxis, gridcolor: gridColor, zerolinecolor: gridColor, tickfont: { color: textColor }, titlefont: { color: textColor } },
                legend: { ...plotData.layout?.legend, font: { color: textColor } },
                title: { text: chart.title, font: { color: textColor } }
              };

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={chart.id} 
                  className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-gray-700/50 shadow-xl overflow-hidden flex flex-col group hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-500"
                >
                  <div className="p-5 border-b border-gray-200 dark:border-gray-700/50 flex items-center justify-between bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={chart.title}>
                        {chart.title && chart.title.text ? chart.title.text : chart.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Saved on {new Date(chart.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => deleteChart(chart.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove from Dashboard"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <div className="p-4 flex-grow relative z-0 h-[400px]">
                    <Plot
                      data={plotData.data || []}
                      layout={themedLayout}
                      config={{ responsive: true, displayModeBar: false }}
                      style={{ width: '100%', height: '100%' }}
                      useResizeHandler={true}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
