import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  Brush,
  ReferenceLine,
  ComposedChart,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

const CHART_TYPES = {
  line: LineChart,
  bar: BarChart,
  area: AreaChart,
  pie: PieChart,
  scatter: ScatterChart,
  composed: ComposedChart,
};

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
  '#f97316', '#06b6d4', '#84cc16', '#a855f7',
];

const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-lg shadow-sm border ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <p className={`font-semibold mb-2 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
        }`}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {`${entry.name}: ${typeof entry.value === 'number' 
              ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function InteractiveChart({ imageSrc, data, chartType = 'auto', title }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentChartType, setCurrentChartType] = useState(chartType === 'auto' ? 'line' : chartType);
  const [isHovered, setIsHovered] = useState(false);
  const [hiddenSeries, setHiddenSeries] = useState(new Set());
  const [brushData, setBrushData] = useState(null);
  const { theme } = useTheme();

  // Auto-detect chart type from data
  const detectedChartType = useMemo(() => {
    if (!data || data.length === 0) return 'line';
    const firstRow = data[0];
    const keys = Object.keys(firstRow).filter(k => k !== 'name');
    
    if (keys.length === 1) {
      // Single series - good for bar or line
      return 'bar';
    } else if (keys.length > 3) {
      // Many series - better for line
      return 'line';
    }
    return 'line';
  }, [data]);

  const finalChartType = currentChartType === 'auto' ? detectedChartType : currentChartType;

  // Get available data keys
  const dataKeys = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0] || {}).filter(key => key !== 'name');
  }, [data]);

  const toggleSeries = (key) => {
    setHiddenSeries(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const downloadChart = () => {
    if (imageSrc) {
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = `chart-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    }
  };

  // If no data provided, just show the image
  if (!data && imageSrc) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
        className="relative group rounded-xl overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/50 shadow-glass dark:shadow-glass-dark"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 group-hover:group-hover:group-hover:transition-all duration-500 pointer-events-none rounded-xl z-0" />
        
        {title && (
          <div className="relative px-4 py-3 dark:dark:dark:backdrop-blur-sm border-b border-white/20 dark:border-gray-700/30">
            <h3 className="text-lg font-semibold dark:dark:bg-clip-text text-transparent">{title}</h3>
          </div>
        )}
        <img
          src={imageSrc}
          alt="Visualization"
          className="w-full h-auto"
        />
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-2 right-2 flex gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={downloadChart}
                className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
                title="Download chart"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsFullscreen(true)}
                className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
                title="View fullscreen"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No chart data available
      </div>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data: brushData || data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    switch (finalChartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="name" 
              stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
              tick={{ fill: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
            />
            <YAxis 
              stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
              tick={{ fill: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
            />
            <Tooltip content={<CustomTooltip theme={theme} />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              onClick={(e) => toggleSeries(e.dataKey)}
              formatter={(value, entry) => (
                <span style={{ 
                  opacity: hiddenSeries.has(entry.dataKey) ? 0.3 : 1,
                  cursor: 'pointer',
                  textDecoration: hiddenSeries.has(entry.dataKey) ? 'line-through' : 'none'
                }}>
                  {value}
                </span>
              )}
            />
            {dataKeys.map((key, index) => (
              !hiddenSeries.has(key) && (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: COLORS[index % COLORS.length] }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                  animationDuration={500}
                />
              )
            ))}
            <Brush 
              dataKey="name" 
              height={30}
              stroke={theme === 'dark' ? '#4b5563' : '#9ca3af'}
              onChange={(brushData) => setBrushData(brushData?.activePayload?.[0]?.payload ? data.slice(brushData.startIndex, brushData.endIndex + 1) : null)}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="name" 
              stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
              tick={{ fill: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
            />
            <YAxis 
              stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
              tick={{ fill: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
            />
            <Tooltip content={<CustomTooltip theme={theme} />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              onClick={(e) => toggleSeries(e.dataKey)}
              formatter={(value, entry) => (
                <span style={{ 
                  opacity: hiddenSeries.has(entry.dataKey) ? 0.3 : 1,
                  cursor: 'pointer',
                  textDecoration: hiddenSeries.has(entry.dataKey) ? 'line-through' : 'none'
                }}>
                  {value}
                </span>
              )}
            />
            {dataKeys.map((key, index) => (
              !hiddenSeries.has(key) && (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={COLORS[index % COLORS.length]}
                  radius={[8, 8, 0, 0]}
                  animationDuration={500}
                />
              )
            ))}
            <Brush 
              dataKey="name" 
              height={30}
              stroke={theme === 'dark' ? '#4b5563' : '#9ca3af'}
            />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              {dataKeys.map((key, index) => (
                <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="name" 
              stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
              tick={{ fill: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
            />
            <YAxis 
              stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
              tick={{ fill: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
            />
            <Tooltip content={<CustomTooltip theme={theme} />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              onClick={(e) => toggleSeries(e.dataKey)}
              formatter={(value, entry) => (
                <span style={{ 
                  opacity: hiddenSeries.has(entry.dataKey) ? 0.3 : 1,
                  cursor: 'pointer',
                  textDecoration: hiddenSeries.has(entry.dataKey) ? 'line-through' : 'none'
                }}>
                  {value}
                </span>
              )}
            />
            {dataKeys.map((key, index) => (
              !hiddenSeries.has(key) && (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  fill={`url(#color${key})`}
                  strokeWidth={2}
                  animationDuration={500}
                />
              )
            ))}
            <Brush 
              dataKey="name" 
              height={30}
              stroke={theme === 'dark' ? '#4b5563' : '#9ca3af'}
            />
          </AreaChart>
        );

      case 'pie':
        if (dataKeys.length === 0) return null;
        const pieData = data.map(item => ({
          name: item.name || item[dataKeys[0]],
          value: item[dataKeys[0]],
        }));
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              animationDuration={500}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip theme={theme} />} />
            <Legend />
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey={dataKeys[0] || 'x'} 
              stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
              tick={{ fill: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
            />
            <YAxis 
              dataKey={dataKeys[1] || 'y'} 
              stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
              tick={{ fill: theme === 'dark' ? '#d1d5db' : '#4b5563' }}
            />
            <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter 
              dataKey={dataKeys[1] || 'y'} 
              fill={COLORS[0]}
              animationDuration={500}
            />
          </ScatterChart>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
        className="relative group rounded-xl overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/50 shadow-glass dark:shadow-glass-dark p-4"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 group-hover:group-hover:group-hover:transition-all duration-500 pointer-events-none rounded-xl z-0" />
        
        {/* Header */}
        <div className="relative flex items-center justify-between mb-4 z-10">
          {title && (
            <h3 className="text-lg font-semibold dark:dark:bg-clip-text text-transparent">
              {title}
            </h3>
          )}
          <div className="flex items-center gap-2">
            {/* Chart Type Selector */}
            <div className="flex gap-1 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-lg p-1 border border-white/20 dark:border-gray-700/30">
              {['line', 'bar', 'area', 'pie', 'scatter'].filter(type => 
                type !== 'pie' || dataKeys.length === 1
              ).map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCurrentChartType(type);
                    setBrushData(null);
                  }}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                    finalChartType === type
                      ? 'bg-accent-600 hover:bg-accent-700 text-white border-accent-600 shadow-sm shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80'
                  }`}
                  title={`Switch to ${type} chart`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </motion.button>
              ))}
            </div>
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex gap-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={downloadChart}
                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Download chart"
                  >
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsFullscreen(true)}
                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="View fullscreen"
                  >
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>

        {/* Stats Summary */}
        {dataKeys.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {dataKeys.slice(0, 4).map((key, index) => {
                const values = data.map(d => d[key]).filter(v => typeof v === 'number');
                const sum = values.reduce((a, b) => a + b, 0);
                const avg = sum / values.length;
                const max = Math.max(...values);
                const min = Math.min(...values);
                return (
                  <div key={key} className="dark:dark:rounded-lg p-3 border border-gray-300 dark:border-gray-700 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{key}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100 dark:text-gray-900 dark:text-gray-100">{avg.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Range: {min.toFixed(1)} - {max.toFixed(1)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title || 'Chart View'}</h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              {imageSrc ? (
                <img src={imageSrc} alt="Fullscreen chart" className="w-full h-auto rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height={600}>
                  {renderChart()}
                </ResponsiveContainer>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
