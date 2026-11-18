import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // Defaults directly to User Control for quick tier assignment
  const navigate = useNavigate();

  // Component-level security guard: strictly allow only the designated super-admin email
  if (user && user.email?.trim().toLowerCase() !== 'aakshitmalik@gmail.com') {
    return <Navigate to="/chat" replace />;
  }

  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    tierBreakdown: { free: 0, pro: 0, enterprise: 0 },
    totalQueries: 0,
    savedCharts: 0,
    mrr: "$0.00",
    arr: "$0.00",
    storageUsed: "0 MB",
    uptimeHours: 0,
    clusterHealth: {
      cpu: 0,
      ram: 0,
      disk: 0,
      status: "Optimal"
    },
    aiMetrics: {
      estimatedTokens: "0",
      estimatedCostUsd: "$0.0000",
      rpmUsage: 0,
      engine: "Zero-Token DuckDB + Gemini Flash",
      avgLatencyMs: 28
    },
    intentClusters: {}
  });
  
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [actionMessage, setActionMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('all');

  // Direct quick tier upgrade input
  const [manualEmail, setManualEmail] = useState('');
  const [manualTier, setManualTier] = useState('Pro');

  const fetchTelemetry = async () => {
    try {
      setLoadingMetrics(true);
      const response = await api.get('/admin/telemetry');
      setMetrics(response.data);
    } catch (e) {
      console.error("Failed to fetch telemetry", e);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (e) {
      console.error("Failed to fetch users", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await api.get('/admin/system/audit-logs');
      setAuditLogs(response.data.events || []);
    } catch (e) {
      console.error("Failed to fetch audit logs", e);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchTelemetry();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const showNotification = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 4000);
  };

  const handleTierChange = async (email, newTier) => {
    try {
      await api.post('/admin/users/tier', { email, tier: newTier.toLowerCase() });
      setUsers(prev => prev.map(u => u.email === email ? { ...u, tier: newTier } : u));
      showNotification(`✓ Updated ${email} to ${newTier} plan`);
    } catch (err) {
      alert('Failed to change tier: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleManualTierSubmit = async (e) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;
    await handleTierChange(manualEmail.trim(), manualTier);
    setManualEmail('');
  };

  const handleToggleStatus = async (email, currentlyActive) => {
    try {
      const newStatus = currentlyActive ? 0 : 1;
      await api.post('/admin/users/status', { email, is_active: newStatus });
      setUsers(prev => prev.map(u => u.email === email ? { 
        ...u, 
        isActive: !currentlyActive, 
        status: !currentlyActive ? 'Active' : 'Suspended' 
      } : u));
      showNotification(`Account ${email} ${!currentlyActive ? 'Activated' : 'Suspended'}`);
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`Permanently remove access for ${email}?`)) return;
    try {
      await api.post('/admin/users/delete', { email });
      setUsers(prev => prev.filter(u => u.email !== email));
      showNotification(`User ${email} deleted`);
    } catch (err) {
      alert('Failed to delete user: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handlePurgeCache = async () => {
    try {
      showNotification('Purging memory & DuckDB session buffers...');
      await api.post('/admin/system/purge-cache');
      showNotification('✓ Engine memory buffers flushed cleanly');
      if (activeTab === 'overview') fetchTelemetry();
    } catch (err) {
      showNotification('✕ Cache purge failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === 'all' || u.tier.toLowerCase() === filterTier.toLowerCase();
    return matchesSearch && matchesTier;
  });

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-300">
      
      {/* Top Navbar */}
      <header className="bg-[#090D14] border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 font-bold shadow-inner">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-white">DataGem Admin Center</span>
              <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 rounded-md">
                Superuser
              </span>
            </div>
            <p className="text-xs text-slate-400">Account: <span className="text-slate-300 font-mono">aakshitmalik@gmail.com</span></p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {actionMessage && (
            <span className="text-xs font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/70 px-3 py-1 rounded-md animate-fade-in">
              {actionMessage}
            </span>
          )}

          <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded-md text-xs text-slate-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            CLUSTER ACTIVE
          </div>

          <button 
            onClick={() => navigate('/chat')} 
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>←</span> Back to Studio
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <aside className="w-60 bg-[#090D14]/80 border-r border-slate-800/80 flex flex-col p-4 space-y-1.5 shrink-0">
          <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-3 py-1">Management</div>

          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'users' 
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span>👥</span>
            <span>Users & Tier Access</span>
          </button>

          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'overview' 
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span>📊</span>
            <span>Telemetry & MRR</span>
          </button>

          <button 
            onClick={() => setActiveTab('ai_engine')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'ai_engine' 
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span>⚡</span>
            <span>Compute & Engine</span>
          </button>

          <button 
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'audit' 
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span>📜</span>
            <span>Audit Trail</span>
          </button>

          <div className="pt-6 border-t border-slate-800/80 mt-auto">
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 text-[11px] space-y-1">
              <div className="text-slate-400 font-medium">Stack Runtime</div>
              <div className="font-semibold text-slate-200 flex items-center justify-between">
                <span>FastAPI + DuckDB</span>
                <span className="text-emerald-400">Online</span>
              </div>
              <div className="text-slate-400 font-mono text-[10px]">Uptime: {metrics.uptimeHours || 24}h</div>
            </div>
          </div>
        </aside>

        {/* Dynamic View Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

          {/* TAB 1: USERS & TIER CONTROL (DEFAULT) */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-6xl">
              
              {/* Header & Quick Manual Grant */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                <div className="lg:col-span-2 bg-[#090D14] border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">User Plan & Permission Control</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Grant unlimited <span className="text-sky-400 font-semibold">Pro</span> or <span className="text-emerald-400 font-semibold">Enterprise</span> licenses to users instantly. Changes apply immediately in real-time.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-800">
                    <input
                      type="text"
                      placeholder="Filter by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-56"
                    />

                    <select
                      value={filterTier}
                      onChange={(e) => setFilterTier(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
                    >
                      <option value="all">All Tiers ({users.length})</option>
                      <option value="free">Free Users</option>
                      <option value="pro">Pro Users</option>
                      <option value="enterprise">Enterprise Users</option>
                    </select>

                    <button 
                      onClick={fetchUsers}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded-lg transition-colors"
                      title="Reload Users"
                    >
                      ↻ Refresh
                    </button>
                  </div>
                </div>

                {/* Quick 1-Click Upgrade Form */}
                <div className="bg-[#090D14] border border-slate-800/90 rounded-xl p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">⚡ Direct Grant Override</h3>
                  <p className="text-[11px] text-slate-400 mb-3">Type any email to elevate their tier instantly:</p>
                  
                  <form onSubmit={handleManualTierSubmit} className="space-y-2.5">
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />

                    <div className="flex gap-2">
                      <select
                        value={manualTier}
                        onChange={(e) => setManualTier(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 flex-1"
                      >
                        <option value="Free">Free</option>
                        <option value="Pro">Pro ($15)</option>
                        <option value="Enterprise">Enterprise ($49)</option>
                      </select>

                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                      >
                        Apply Grant
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* User Accounts Table */}
              <div className="bg-[#090D14] border border-slate-800/90 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                        <th className="px-5 py-3 font-semibold">User</th>
                        <th className="px-5 py-3 font-semibold">Plan Level</th>
                        <th className="px-5 py-3 font-semibold">1-Click Tier Override</th>
                        <th className="px-5 py-3 font-semibold">Status</th>
                        <th className="px-5 py-3 font-semibold">Queries</th>
                        <th className="px-5 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {loadingUsers ? (
                        <tr>
                          <td colSpan="6" className="px-5 py-8 text-center text-slate-500">Loading user accounts...</td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-5 py-8 text-center text-slate-500">No user accounts found matching query.</td>
                        </tr>
                      ) : (
                        filteredUsers.map(u => {
                          const isSuperAdmin = u.email === 'aakshitmalik@gmail.com';
                          const tier = (u.tier || 'free').toLowerCase();
                          return (
                            <tr key={u.id || u.email} className="hover:bg-slate-900/40 transition-colors">
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                                    {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                                      <span>{u.name || 'Anonymous'}</span>
                                      {isSuperAdmin && (
                                        <span className="px-1.5 py-0.2 text-[9px] bg-sky-950 text-sky-400 border border-sky-800 rounded font-mono">
                                          Super Admin
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-3">
                                {tier === 'enterprise' ? (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                                    Enterprise
                                  </span>
                                ) : tier === 'pro' ? (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-950/80 text-sky-400 border border-sky-800/80">
                                    Pro
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                    Free
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-3">
                                <div className="inline-flex rounded-md shadow-sm" role="group">
                                  <button
                                    onClick={() => handleTierChange(u.email, 'Free')}
                                    className={`px-2.5 py-1 text-[11px] font-medium border border-slate-700 rounded-l-md transition-colors ${
                                      tier === 'free' ? 'bg-slate-800 text-white font-bold' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                    }`}
                                  >
                                    Free
                                  </button>
                                  <button
                                    onClick={() => handleTierChange(u.email, 'Pro')}
                                    className={`px-2.5 py-1 text-[11px] font-medium border-t border-b border-slate-700 transition-colors ${
                                      tier === 'pro' ? 'bg-sky-950 text-sky-300 font-bold border-sky-700' : 'bg-slate-900/60 text-slate-400 hover:text-sky-300 hover:bg-slate-800'
                                    }`}
                                  >
                                    Grant Pro
                                  </button>
                                  <button
                                    onClick={() => handleTierChange(u.email, 'Enterprise')}
                                    className={`px-2.5 py-1 text-[11px] font-medium border border-slate-700 rounded-r-md transition-colors ${
                                      tier === 'enterprise' ? 'bg-emerald-950 text-emerald-300 font-bold border-emerald-700' : 'bg-slate-900/60 text-slate-400 hover:text-emerald-300 hover:bg-slate-800'
                                    }`}
                                  >
                                    Grant Enterprise
                                  </button>
                                </div>
                              </td>

                              <td className="px-5 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  u.isActive 
                                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80' 
                                    : 'bg-rose-950/60 text-rose-400 border border-rose-800/80'
                                }`}>
                                  {u.status || (u.isActive ? 'Active' : 'Suspended')}
                                </span>
                              </td>

                              <td className="px-5 py-3 text-slate-400 font-mono">
                                {u.messageCount || 0}
                              </td>

                              <td className="px-5 py-3 text-right space-x-1.5">
                                {!isSuperAdmin && (
                                  <>
                                    <button 
                                      onClick={() => handleToggleStatus(u.email, u.isActive)}
                                      className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-medium transition-colors"
                                    >
                                      {u.isActive ? 'Suspend' : 'Activate'}
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteUser(u.email)}
                                      className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 text-rose-400 text-[11px] font-medium transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: TELEMETRY & REVENUE */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-6xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-white">Cluster Telemetry & SaaS Metrics</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time compute queries, subscription ARR, and storage utilization.</p>
                </div>
                <button 
                  onClick={fetchTelemetry}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded-lg transition-colors"
                >
                  ↻ Refresh Metrics
                </button>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#090D14] border border-slate-800/90 p-5 rounded-xl">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Registered Accounts</div>
                  <div className="text-2xl font-bold text-white mt-1">{metrics.totalUsers}</div>
                  <div className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                    <span className="text-emerald-400 font-medium">{metrics.activeUsers} Active</span> • 
                    <span className="text-rose-400 font-medium">{metrics.suspendedUsers} Suspended</span>
                  </div>
                </div>

                <div className="bg-[#090D14] border border-slate-800/90 p-5 rounded-xl">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Compute Queries Run</div>
                  <div className="text-2xl font-bold text-sky-400 mt-1">{metrics.totalQueries}</div>
                  <div className="text-xs text-slate-400 mt-2">Vectorized Zero-Token Execution</div>
                </div>

                <div className="bg-[#090D14] border border-slate-800/90 p-5 rounded-xl">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Monthly Recurring Rev</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics.mrr}</div>
                  <div className="text-xs text-slate-400 mt-2">Annual Run Rate: <span className="text-white font-mono">{metrics.arr}</span></div>
                </div>

                <div className="bg-[#090D14] border border-slate-800/90 p-5 rounded-xl">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Database Footprint</div>
                  <div className="text-2xl font-bold text-white mt-1">{metrics.storageUsed}</div>
                  <div className="text-xs text-emerald-400 mt-2">Compressed DuckDB Storage</div>
                </div>
              </div>

              {/* Tier Split & Hardware Health */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#090D14] border border-slate-800/90 p-5 rounded-xl">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Paid Tier Distribution</h3>
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 font-medium mb-1">
                        <span>Free Tier ({metrics.tierBreakdown?.free || 0})</span>
                        <span>{metrics.totalUsers ? Math.round((metrics.tierBreakdown?.free / metrics.totalUsers) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-slate-600 h-1.5 rounded-full" style={{ width: `${metrics.totalUsers ? (metrics.tierBreakdown?.free / metrics.totalUsers) * 100 : 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sky-300 font-medium mb-1">
                        <span>Pro Tier ($15/mo) ({metrics.tierBreakdown?.pro || 0})</span>
                        <span>{metrics.totalUsers ? Math.round((metrics.tierBreakdown?.pro / metrics.totalUsers) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${metrics.totalUsers ? (metrics.tierBreakdown?.pro / metrics.totalUsers) * 100 : 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-emerald-300 font-medium mb-1">
                        <span>Enterprise Tier ($49/mo) ({metrics.tierBreakdown?.enterprise || 0})</span>
                        <span>{metrics.totalUsers ? Math.round((metrics.tierBreakdown?.enterprise / metrics.totalUsers) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${metrics.totalUsers ? (metrics.tierBreakdown?.enterprise / metrics.totalUsers) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#090D14] border border-slate-800/90 p-5 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Node Hardware Health</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                      {metrics.clusterHealth?.status || "Normal"}
                    </span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 font-medium mb-1">
                        <span>CPU Load</span>
                        <span>{metrics.clusterHealth?.cpu || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5">
                        <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${metrics.clusterHealth?.cpu || 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 font-medium mb-1">
                        <span>Memory RAM Utilization</span>
                        <span>{metrics.clusterHealth?.ram || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${metrics.clusterHealth?.ram || 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 font-medium mb-1">
                        <span>Disk Space</span>
                        <span>{metrics.clusterHealth?.disk || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5">
                        <div className="bg-slate-500 h-1.5 rounded-full" style={{ width: `${metrics.clusterHealth?.disk || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: COMPUTE & ENGINE */}
          {activeTab === 'ai_engine' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-lg font-semibold text-white">Compute Engine & Cost Optimization</h2>
                <p className="text-xs text-slate-400 mt-0.5">Control token efficiency, monitor zero-token DuckDB throughput, and flush memory.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#090D14] border border-slate-800/90 p-5 rounded-xl">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Estimated Tokens</div>
                  <div className="text-2xl font-bold text-white mt-1">{metrics.aiMetrics?.estimatedTokens || 0}</div>
                  <div className="text-xs text-sky-400 mt-2">Zero-Token Engine shields 95% of queries</div>
                </div>

                <div className="bg-[#090D14] border border-slate-800/90 p-5 rounded-xl">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">LLM API Spend</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics.aiMetrics?.estimatedCostUsd || "$0.00"}</div>
                  <div className="text-xs text-slate-400 mt-2">Gemini Flash Fallback ($0.000075 / 1k)</div>
                </div>

                <div className="bg-[#090D14] border border-slate-800/90 p-5 rounded-xl">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">DuckDB Query Latency</div>
                  <div className="text-2xl font-bold text-sky-400 mt-1">{metrics.aiMetrics?.avgLatencyMs || 28} ms</div>
                  <div className="text-xs text-emerald-400 mt-2">Sub-second local vectorized speed</div>
                </div>
              </div>

              <div className="bg-[#090D14] border border-slate-800/90 p-5 rounded-xl">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Engine Maintenance & Cache Purge</h3>
                <p className="text-xs text-slate-400 mb-4">Reclaim memory allocations, flush transient session cache, and re-index dataset pointers.</p>
                
                <button 
                  onClick={handlePurgeCache}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs text-slate-200 font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>🧹</span> Purge Cache & Reclaim Memory
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-6xl">
              <div>
                <h2 className="text-lg font-semibold text-white">System Security & Audit Trail</h2>
                <p className="text-xs text-slate-400 mt-0.5">Immutable record of logins, tier grants, clawback exports, and database syncs.</p>
              </div>

              <div className="bg-[#090D14] border border-slate-800/90 rounded-xl p-5 shadow-sm">
                <div className="space-y-3">
                  {auditLogs.length === 0 ? (
                    <div className="text-xs text-slate-500 py-4 text-center">No recent security events logged.</div>
                  ) : (
                    auditLogs.map((log, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800/70 text-xs">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded ${
                            log.type === 'USER_PROVISION' ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}>
                            {log.type}
                          </span>
                          <span className="text-slate-300 font-medium">{log.message}</span>
                        </div>
                        <span className="text-slate-500 font-mono text-[11px]">{log.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </main>
      </div>
    </div>
  );
}
