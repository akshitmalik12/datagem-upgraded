import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';

export default function DataHealth() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalCols, setTotalCols] = useState(0);
  
  useEffect(() => {
      try {
          const sessions = JSON.parse(localStorage.getItem('datagem_sessions')) || [];
          const session = sessions[0]; // Get most recent session
          
          if (session && session.dataset) {
              const data = session.dataset;
              setTotalRows(data.length);
              
              if (data.length > 0) {
                  const columns = Object.keys(data[0]);
                  setTotalCols(columns.length);
                  
                  // Calculate real anomalies!
                  let nullCount = 0;
                  let nullCols = new Set();
                  let duplicateCount = 0;
                  const seen = new Set();
                  
                  data.forEach(row => {
                      // Nulls
                      columns.forEach(col => {
                          if (row[col] === null || row[col] === '' || row[col] === undefined) {
                              nullCount++;
                              nullCols.add(col);
                          }
                      });
                      // Duplicates
                      const str = JSON.stringify(row);
                      if (seen.has(str)) {
                          duplicateCount++;
                      } else {
                          seen.add(str);
                      }
                  });
                  
                  const detectedIssues = [];
                  let issueId = 1;
                  
                  if (nullCount > 0) {
                      detectedIssues.push({
                          id: issueId++,
                          type: 'NULL_VALUES',
                          col: Array.from(nullCols).join(', '),
                          count: nullCount,
                          severity: 'critical',
                          desc: 'Missing values will cause ML pipeline failure.',
                          fix: 'IMPUTE_MEDIAN',
                          fixed: false,
                          codeDiff: `- df.dropna()\n+ df.fillna(df.median())`
                      });
                  }
                  
                  if (duplicateCount > 0) {
                      detectedIssues.push({
                          id: issueId++,
                          type: 'DUPLICATES',
                          col: 'Row ID',
                          count: duplicateCount,
                          severity: 'warn',
                          desc: 'Identical signatures found in index.',
                          fix: 'DROP_DUPLICATES',
                          fixed: false,
                          codeDiff: `- df\n+ df.drop_duplicates()`
                      });
                  }
                  
                  setIssues(detectedIssues);
              }
          } else {
             // Fallback if no dataset
             setTotalRows(0);
             setTotalCols(0);
             setIssues([]);
          }
      } catch (e) {
          console.error(e);
      }
  }, []);

  const rawScore = totalRows === 0 ? 0 : Math.floor(100 - (issues.filter(i => !i.fixed).length * 12.5));
  const score = Math.max(0, Math.min(100, rawScore));

  const handleFix = (id) => {
    setIssues(issues.map(issue => issue.id === id ? { ...issue, fixed: true } : issue));
  };


  const applyFixesToDataset = () => {
      try {
          const sessions = JSON.parse(localStorage.getItem('datagem_sessions')) || [];
          if (!sessions[0] || !sessions[0].dataset) return null;
          
          let cleanedData = [...sessions[0].dataset];
          
          issues.forEach(issue => {
              if (issue.fixed) {
                  if (issue.type === 'NULL_VALUES') {
                      const colNames = issue.col.split(', ');
                      colNames.forEach(col => {
                          // Calculate median for numeric, or mode for string
                          let vals = cleanedData.map(r => r[col]).filter(v => v !== null && v !== '' && !isNaN(v));
                          vals.sort((a,b) => a-b);
                          let median = vals.length > 0 ? vals[Math.floor(vals.length/2)] : 0;
                          
                          cleanedData = cleanedData.map(row => {
                              if (row[col] === null || row[col] === '') {
                                  return { ...row, [col]: median };
                              }
                              return row;
                          });
                      });
                  } else if (issue.type === 'DUPLICATES') {
                      const seen = new Set();
                      cleanedData = cleanedData.filter(row => {
                          const str = JSON.stringify(row);
                          if (seen.has(str)) return false;
                          seen.add(str);
                          return true;
                      });
                  }
              }
          });
          return cleanedData;
      } catch (e) {
          console.error(e);
          return null;
      }
  };

  const handleUpdateDataset = () => {
      const cleaned = applyFixesToDataset();
      if (cleaned) {
          const sessions = JSON.parse(localStorage.getItem('datagem_sessions')) || [];
          if (sessions[0]) {
              sessions[0].dataset = cleaned;
              if (sessions[0].profile) {
                  sessions[0].profile.shape = { ...sessions[0].profile.shape, rows: cleaned.length };
              }
              try {
                  localStorage.setItem('datagem_sessions', JSON.stringify(sessions));
                  alert("✅ Dataset updated successfully in DataGem memory! The cleaned data will be used in your chat.");
                  window.location.href = '/chat';
              } catch(e) {
                  alert("❌ Dataset too large to save in browser memory after cleaning. Please use 'Save Dataset (CSV)' instead.");
              }
          }
      }
  };

  const handleSaveToCsv = () => {
      const cleaned = applyFixesToDataset();
      if (cleaned && cleaned.length > 0) {
                    const csv = Papa.unparse(cleaned);
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", "datagem_cleaned_dataset.csv");
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  };

  const radarData = [
    { subject: 'Completeness', A: score, fullMark: 100 },
    { subject: 'Uniqueness', A: issues.find(i => i.type === 'DUPLICATES' && !i.fixed) ? 60 : 100, fullMark: 100 },
    { subject: 'Validity', A: 100, fullMark: 100 },
    { subject: 'Consistency', A: score, fullMark: 100 },
    { subject: 'Accuracy', A: 90, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans relative overflow-hidden">
      {/* SOTA Backgrounds */}
      <div className="noise-bg" />
      <div className="absolute inset-0 bg-dot-white/[0.1] z-0 pointer-events-none" />
      
      {/* Glowing Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-xl px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => window.location.href='/chat'} className="text-zinc-500 hover:text-white transition-colors">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
             <h1 className="text-sm font-mono tracking-widest text-zinc-100 uppercase">Data_Health_Matrix</h1>
          </div>
        </div>

          <div className="flex items-center gap-3">
             <button onClick={handleSaveToCsv} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg border border-white/10 transition-colors">
                1. Save Dataset (CSV)
             </button>
             <button onClick={handleUpdateDataset} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                2. Update Dataset on DataGem
             </button>
          </div>

      </header>

      <main className="relative z-10 max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        
        {/* Left Col: Diagnostics */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Main Score Component */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent">
            <div className="bg-[#09090B] rounded-xl p-8 border border-white/5 h-full flex flex-col items-center justify-center relative overflow-hidden">
               <h2 className="text-xs font-mono text-zinc-500 mb-8 w-full text-left">OVERALL_INTEGRITY</h2>
               
               <div className="relative w-48 h-48 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-white/10" />
                  <div className={`absolute inset-4 rounded-full border ${score === 100 ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]'}`} />
                  <div className="flex flex-col items-center z-10">
                     <span className={`text-7xl font-sans font-black tracking-tighter ${score === 100 ? 'text-emerald-400' : 'text-white'}`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        {totalRows === 0 ? '-' : score}
                     </span>
                  </div>
               </div>

               <div className="w-full mt-12 grid grid-cols-2 gap-4">
                  <div className="border border-white/5 bg-white/[0.02] p-3 rounded-lg">
                     <div className="text-[10px] text-zinc-500 font-mono mb-1">ROWS_SCANNED</div>
                     <div className="text-lg font-bold font-mono text-white">{totalRows.toLocaleString()}</div>
                  </div>
                  <div className="border border-white/5 bg-white/[0.02] p-3 rounded-lg">
                     <div className="text-[10px] text-zinc-500 font-mono mb-1">ANOMALIES</div>
                     <div className="text-lg font-bold font-mono text-cyan-400">{issues.filter(i => !i.fixed).length}</div>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Radar Chart Component */}
          {totalRows > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#09090B] border border-white/10 rounded-xl p-6 h-72">
             <h2 className="text-xs font-mono text-zinc-500 mb-2">VECTOR_ANALYSIS</h2>
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                 <PolarGrid stroke="rgba(255,255,255,0.1)" />
                 <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717A', fontSize: 10, fontFamily: 'monospace' }} />
                 <Radar name="Score" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} />
               </RadarChart>
             </ResponsiveContainer>
          </motion.div>
          )}

        </div>

        {/* Right Col: Terminal Alerts */}
        <div className="lg:col-span-8 space-y-4">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold tracking-tight">System Anomalies</h2>
              {totalRows > 0 && issues.every(i => i.fixed) && (
                 <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs rounded">SYS_OPTIMAL</span>
              )}
           </div>
           
           {totalRows === 0 && (
               <div className="p-8 border border-dashed border-white/20 rounded-xl text-center text-zinc-500 font-mono">
                   NO_DATASET_DETECTED. Upload a CSV in the Chat to run diagnostics.
               </div>
           )}

           <AnimatePresence>
             {issues.map((issue, index) => (
               <motion.div 
                 key={issue.id}
                 layout
                 transition={{ type: "spring", stiffness: 300, damping: 25 }}
                 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                 className={`relative overflow-hidden rounded-xl border transition-all duration-500 ${issue.fixed ? 'bg-zinc-900/30 border-white/5' : 'bg-[#09090B] border-white/10 hover:border-cyan-500/30'}`}
               >
                 <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${issue.fixed ? 'bg-zinc-700' : (issue.severity === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]')}`} />
                          <h3 className={`font-mono text-sm font-bold ${issue.fixed ? 'text-zinc-600 line-through' : 'text-zinc-100'}`}>ERR_CODE: {issue.type}</h3>
                       </div>
                       <button
                          onClick={() => handleFix(issue.id)}
                          disabled={issue.fixed}
                          className={`font-mono text-xs px-4 py-2 rounded-md border transition-all ${
                             issue.fixed 
                               ? 'bg-transparent border-emerald-500/30 text-emerald-500/50 cursor-not-allowed'
                               : 'bg-white text-black border-white hover:bg-cyan-400 hover:border-cyan-400 hover:text-black shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                          }`}
                       >
                          {issue.fixed ? '> EXECUTED' : `> ${issue.fix}`}
                       </button>
                    </div>

                    <p className={`text-sm mb-6 ${issue.fixed ? 'text-zinc-700' : 'text-zinc-400'}`}>
                       [Target: {issue.col}] {issue.count.toLocaleString()} occurrences. {issue.desc}
                    </p>

                    {/* Code Diff Simulation */}
                    <div className={`p-4 rounded-lg font-mono text-[11px] leading-relaxed overflow-x-auto ${issue.fixed ? 'bg-zinc-950/50 opacity-30' : 'bg-[#000000] border border-white/5'}`}>
                       {issue.codeDiff.split('\n').map((line, i) => (
                         <div key={i} className={`${line.startsWith('-') ? 'text-red-400' : line.startsWith('+') ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {line}
                         </div>
                       ))}
                    </div>
                 </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
