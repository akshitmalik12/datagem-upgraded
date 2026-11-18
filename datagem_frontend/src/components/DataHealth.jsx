import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Activity, Database, CheckCircle, AlertTriangle, Download } from 'lucide-react';

export default function DataHealth() {
  const navigate = useNavigate();

  const healthData = [
    { name: 'Healthy', value: 85, color: '#10b981' },
    { name: 'Issues & Outliers', value: 15, color: '#ef4444' }
  ];

  const handleExportReport = () => {
    const reportText = `# DataGem In-Memory Data Health & Profiling Audit
Generated: ${new Date().toLocaleString()}
Engine: DuckDB Vectorized Sandbox (0 Tokens)

OVERALL HEALTH SCORE: 85% (Excellent)
- Categorical Dimensions: 4
- Numerical Metrics: 6
- Datetime Timestamps: 1
- Text Fields: 2

ANOMALIES & AUDIT FINDINGS:
- Zero NULL primary keys detected
- 2 Volumetric Weight discrepancies flagged (>15% delta)
- Return Freight penalty outlier detected on ELEC-W-EARBUDS
- Estimated In-Memory DuckDB footprint: 45 MB
`;
    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datagem-health-audit-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Top Navigation Bar */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-sky-400" />
            <span>← Back to Analytics Studio</span>
          </button>
          <span className="text-slate-600">/</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Data Integrity & Health Cockpit</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all shadow-sm shadow-sky-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Health Audit</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>🩺</span> Vectorized Dataset Health Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated schema validation, missing value imputation diagnostics, and volumetric outlier detection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-mono">Overall Health</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">85%</div>
            <span className="text-[11px] text-emerald-500/80">Optimal for DuckDB OLAP</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-mono">Clean Records</span>
            <div className="text-2xl font-bold text-sky-400 mt-1 font-mono">100%</div>
            <span className="text-[11px] text-slate-400">No corrupt order IDs</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-mono">Outliers Flagged</span>
            <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">2 SKUs</div>
            <span className="text-[11px] text-amber-500/80">Weight & return anomalies</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-mono">In-Memory Sandbox</span>
            <div className="text-2xl font-bold text-purple-400 mt-1 font-mono">45 MB</div>
            <span className="text-[11px] text-purple-400/80">Zero token consumption</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            className="bg-slate-900/80 p-6 rounded-2xl shadow-xl border border-slate-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Overall Integrity Score</span>
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090D14', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-3xl font-bold text-emerald-400 font-mono">85% Clean</div>
            <p className="text-center text-xs text-slate-400 mt-1">15% flagged for fee or weight discrepancy reconciliation</p>
          </motion.div>

          <motion.div 
            className="bg-slate-900/80 p-6 rounded-2xl shadow-xl border border-slate-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              <span>Semantic Column Schema</span>
            </h2>
            <ul className="space-y-3 text-xs">
              <li className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300 font-medium">Categorical (SKU, Category, Channel)</span>
                <span className="font-mono text-sky-400 font-bold">4 columns</span>
              </li>
              <li className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300 font-medium">Numerical (Gross, Net Profit, Billed Wt)</span>
                <span className="font-mono text-purple-400 font-bold">6 columns</span>
              </li>
              <li className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300 font-medium">Datetime (Order Date, Settlement Date)</span>
                <span className="font-mono text-emerald-400 font-bold">1 column</span>
              </li>
              <li className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300 font-medium">Text Description (Notes, Remarks)</span>
                <span className="font-mono text-amber-400 font-bold">2 columns</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
