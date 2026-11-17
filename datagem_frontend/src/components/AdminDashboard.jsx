import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

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
      engine: "DuckDB + Gemini Flash",
      avgLatencyMs: 40
    },
    intentClusters: {}
  });
  
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [purgeStatus, setPurgeStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('all');

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

  const handleTierChange = async (email, newTier) => {
    try {
      await api.post('/admin/users/tier', { email, tier: newTier.toLowerCase() });
      setUsers(users.map(u => u.email === email ? { ...u, tier: newTier } : u));
    } catch (err) {
      alert('Failed to change tier: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleToggleStatus = async (email, currentlyActive) => {
    try {
      const newStatus = currentlyActive ? 0 : 1;
      await api.post('/admin/users/status', { email, is_active: newStatus });
      setUsers(users.map(u => u.email === email ? { 
        ...u, 
        isActive: !currentlyActive, 
        status: !currentlyActive ? 'Active' : 'Suspended' 
      } : u));
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`Permanently delete account for ${email}? This cannot be undone.`)) return;
    try {
      await api.post('/admin/users/delete', { email });
      setUsers(users.filter(u => u.email !== email));
    } catch (err) {
      alert('Failed to delete user: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handlePurgeCache = async () => {
    try {
      setPurgeStatus('Purging memory buffers...');
      const res = await api.post('/admin/system/purge-cache');
      setPurgeStatus('✅ Cache & memory buffers purged successfully!');
      fetchTelemetry();
      setTimeout(() => setPurgeStatus(''), 4000);
    } catch (err) {
      setPurgeStatus('❌ Failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === 'all' || u.tier.toLowerCase() === filterTier.toLowerCase();
    return matchesSearch && matchesTier;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      
      {/* Admin Navbar */}
      <nav className="bg-white dark:bg-[#151B2B] border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-sm">
            <span className="text-xl">🛡️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-400">DataGem Executive Admin</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800">
                Superuser
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Logged in: aakshitmalik@gmail.com</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchTelemetry}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>🔄</span> Refresh
          </button>
          <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-full border border-green-200 dark:border-green-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            CLUSTER ONLINE
          </span>
          <button onClick={() => navigate('/chat')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
            Exit to Workspace
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-[#151B2B] border-r border-gray-200 dark:border-gray-800 flex flex-col p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
          >
            <span className="text-lg">📊</span>
            Overview & Telemetry
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
          >
            <span className="text-lg">👥</span>
            User Control & Tiers
          </button>

          <button 
            onClick={() => setActiveTab('ai_engine')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'ai_engine' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
          >
            <span className="text-lg">⚡</span>
            AI Cost & Performance
          </button>

          <button 
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'audit' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
          >
            <span className="text-lg">📜</span>
            Audit & Security Logs
          </button>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-800 mt-auto">
            <div className="p-3 bg-gray-50 dark:bg-[#0E131F] rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Server Host</div>
              <div className="text-xs font-bold text-gray-900 dark:text-gray-200 flex items-center justify-between">
                <span>Railway + DuckDB</span>
                <span className="text-green-500">● Live</span>
              </div>
              <div className="text-[11px] text-gray-500 mt-1">Uptime: {metrics.uptimeHours} hrs</div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* TAB 1: OVERVIEW & TELEMETRY */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cluster Telemetry & Financials</h2>
                <p className="text-gray-500 text-sm">Real-time health, monetization, and computational load across DataGem.</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Registered Users</div>
                  <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{metrics.totalUsers}</div>
                  <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                    <span className="text-green-500 font-semibold">{metrics.activeUsers} Active</span> • 
                    <span className="text-red-400 font-semibold">{metrics.suspendedUsers} Suspended</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Compute Queries (All-Time)</div>
                  <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{metrics.totalQueries}</div>
                  <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span>⚡ Native DuckDB Engine</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Monthly Recurring Rev (MRR)</div>
                  <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{metrics.mrr}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Projected ARR: <span className="font-semibold text-gray-900 dark:text-white">{metrics.arr}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">SQLite & S3 Storage</div>
                  <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{metrics.storageUsed}</div>
                  <div className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
                    <span>● Low Footprint (High Margin)</span>
                  </div>
                </div>
              </div>

              {/* Tier Distribution Bar & Cluster Resource Gauges */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Tier Distribution Card */}
                <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Subscription Tiers Breakdown</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Free Tier ({metrics.tierBreakdown?.free || 0} users)</span>
                        <span>{metrics.totalUsers ? Math.round((metrics.tierBreakdown?.free / metrics.totalUsers) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${metrics.totalUsers ? (metrics.tierBreakdown?.free / metrics.totalUsers) * 100 : 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Pro Tier ($15/mo) ({metrics.tierBreakdown?.pro || 0} users)</span>
                        <span>{metrics.totalUsers ? Math.round((metrics.tierBreakdown?.pro / metrics.totalUsers) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${metrics.totalUsers ? (metrics.tierBreakdown?.pro / metrics.totalUsers) * 100 : 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Enterprise Tier ($49/mo) ({metrics.tierBreakdown?.enterprise || 0} users)</span>
                        <span>{metrics.totalUsers ? Math.round((metrics.tierBreakdown?.enterprise / metrics.totalUsers) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${metrics.totalUsers ? (metrics.tierBreakdown?.enterprise / metrics.totalUsers) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Host Hardware Resources */}
                <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Host Node Resources</h3>
                    <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">
                      {metrics.clusterHealth?.status || "Healthy"}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>CPU Utilization</span>
                        <span>{metrics.clusterHealth?.cpu || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${metrics.clusterHealth?.cpu || 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>RAM Consumption</span>
                        <span>{metrics.clusterHealth?.ram || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${metrics.clusterHealth?.ram || 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Disk Usage</span>
                        <span>{metrics.clusterHealth?.disk || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${metrics.clusterHealth?.disk || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Query Intent Breakdown */}
              <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">User Query Intent Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(metrics.intentClusters || {}).map(([category, count]) => (
                    <div key={category} className="p-4 bg-gray-50 dark:bg-[#0E131F] rounded-xl border border-gray-100 dark:border-gray-800">
                      <div className="text-xs text-gray-500 font-medium">{category}</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{count}</div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: USER CONTROL & TIERS */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management & Permissions</h2>
                  <p className="text-gray-500 text-sm">Control account status, adjust subscription tiers, or remove accounts.</p>
                </div>
                
                {/* Search & Filters */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search user or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3.5 py-2 text-sm bg-white dark:bg-[#151B2B] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-64"
                  />
                  <select
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                    className="px-3.5 py-2 text-sm bg-white dark:bg-[#151B2B] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="all">All Tiers</option>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              {/* User Table */}
              <div className="bg-white dark:bg-[#151B2B] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-[#1A2234] text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 dark:border-gray-800">
                        <th className="px-6 py-4 font-semibold">User</th>
                        <th className="px-6 py-4 font-semibold">Tier Permission</th>
                        <th className="px-6 py-4 font-semibold">Account Status</th>
                        <th className="px-6 py-4 font-semibold">Messages</th>
                        <th className="px-6 py-4 font-semibold text-right">Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {loadingUsers ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading user accounts...</td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No users match your filter criteria.</td>
                        </tr>
                      ) : (
                        filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#1A2234]/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    {user.name}
                                    {user.email === 'aakshitmalik@gmail.com' && (
                                      <span className="px-1.5 py-0.5 text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-bold rounded">
                                        Super Admin
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-6 py-4">
                              <select 
                                value={user.tier}
                                onChange={(e) => handleTierChange(user.email, e.target.value)}
                                className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-xs font-semibold px-2.5 py-1.5 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                              >
                                <option value="Free">Free</option>
                                <option value="Pro">Pro ($15)</option>
                                <option value="Enterprise">Enterprise ($49)</option>
                              </select>
                            </td>

                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {user.status}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                              {user.messageCount}
                            </td>

                            <td className="px-6 py-4 text-right space-x-2">
                              {user.email !== 'aakshitmalik@gmail.com' && (
                                <>
                                  <button 
                                    onClick={() => handleToggleStatus(user.email, user.isActive)}
                                    className="text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold transition-colors"
                                  >
                                    {user.isActive ? 'Suspend' : 'Activate'}
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteUser(user.email)}
                                    className="text-xs px-2.5 py-1 rounded bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100 font-semibold transition-colors"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: AI COST & PERFORMANCE */}
          {activeTab === 'ai_engine' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Cost & Performance Controller</h2>
                <p className="text-gray-500 text-sm">Monitor Gemini 1.5 Flash token expenditures, DuckDB query latency, and flush cached buffers.</p>
              </div>

              {/* AI Cost Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Estimated Tokens Processed</div>
                  <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{metrics.aiMetrics?.estimatedTokens || 0}</div>
                  <div className="text-xs text-indigo-500 mt-2">Gemini Flash (Input + Output)</div>
                </div>

                <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Estimated AI Cost</div>
                  <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{metrics.aiMetrics?.estimatedCostUsd || "$0.00"}</div>
                  <div className="text-xs text-gray-500 mt-2">Ultra-efficient: ~$0.000075 / 1k tokens</div>
                </div>

                <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">DuckDB Analytics Latency</div>
                  <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{metrics.aiMetrics?.avgLatencyMs || 40} ms</div>
                  <div className="text-xs text-green-500 mt-2">Sub-second local vectorized execution</div>
                </div>
              </div>

              {/* Maintenance & Engine Actions */}
              <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Engine Maintenance & Cache Purge</h3>
                <p className="text-sm text-gray-500 mb-6">Reclaim transient DuckDB memory, free Python garbage collector heaps, and reset stale model sessions.</p>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handlePurgeCache}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2"
                  >
                    <span>🧹</span> Purge Cache & Reclaim Memory
                  </button>
                  {purgeStatus && (
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {purgeStatus}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security & Audit Logs</h2>
                <p className="text-gray-500 text-sm">Immutable trail of platform actions, query activity, and administrative events.</p>
              </div>

              <div className="bg-white dark:bg-[#151B2B] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="space-y-4">
                  {auditLogs.length === 0 ? (
                    <div className="text-sm text-gray-500">No events logged recently.</div>
                  ) : (
                    auditLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-[#0E131F] rounded-xl border border-gray-100 dark:border-gray-800">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${log.type === 'USER_PROVISION' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'}`}>
                          {log.type}
                        </span>
                        <div className="flex-1 text-xs text-gray-800 dark:text-gray-200 font-medium">
                          {log.message}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {log.time}
                        </div>
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
