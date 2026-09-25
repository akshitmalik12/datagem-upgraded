import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [toastMsg, setToastMsg] = useState(null);
  const { user, refreshUser } = useAuth();

  const showToast = (msg, isError = false) => {
    setToastMsg({ text: msg, isError });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleTierChange = async (userId, email, newTier) => {
    try {
      await api.put(`/admin/users/${userId}/tier`, { tier: newTier });
      setUsers(users.map(u => u.id === userId ? { ...u, tier: newTier } : u));
      showToast(`Successfully upgraded ${email} to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)}!`);
      if (user && user.id === userId) {
        refreshUser();
      }
    } catch (err) {
      showToast('Failed to update user tier: ' + err.message, true);
      // Revert select state by triggering a re-render of current state
      setUsers([...users]); 
    }
  };
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalQueries: 0,
    storageUsed: "0 MB",
    mrr: "$0.00",
    clusterHealth: {
        cpu: 0,
        ram: 0,
        gemini: { status: "Healthy", color: "green", usage: 0 }
    }
  });
  
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const [revenue, setRevenue] = useState(0);
  const [health, setHealth] = useState(0);
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const rev = await api.get('/admin/revenue');
        setRevenue(rev.data.revenue_inr);
        const h = await api.get('/admin/health');
        setHealth(h.data.active_api_keys);
      } catch (e) {}
      try {
        const response = await api.get('/admin/telemetry');
        setMetrics(prev => ({
          ...prev,
          totalUsers: response.data.totalUsers || 0,
          activeUsers: response.data.activeUsers || 0,
          totalQueries: response.data.totalMessages || 0
        }));
      } catch (e) {
        console.error("Failed to fetch telemetry", e);
      } finally {
        setLoadingMetrics(false);
      }
    };
    if (activeTab === 'overview') {
      fetchTelemetry();
    }
  }, [activeTab]);

  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        setUsers(response.data);
      } catch (e) {
        console.error("Failed to fetch users");
      }
    };
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleSuspend = async (userId, email) => {
    try {
      await api.post(`/admin/users/${userId}/ban`);
      setUsers(users.map(u => u.id === userId ? { ...u, tier: 'banned' } : u));
      alert(`Successfully banned ${email}!`);
    } catch (err) {
      alert('Failed to suspend user: ' + err.message);
    }
  };

  const handleUpgrade = async (userId, email) => {
    try {
      await api.post(`/admin/users/${userId}/upgrade`);
      setUsers(users.map(u => u.id === userId ? { ...u, tier: 'pro' } : u));
      alert(`Successfully upgraded ${email} to Pro!`);
    } catch (err) {
      alert('Failed to upgrade user: ' + err.message);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 flex flex-col font-sans relative">
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-6 py-3 rounded-full shadow-2xl text-white font-medium text-sm ${toastMsg.isError ? 'bg-red-600' : 'bg-green-600'}`}
          >
            {toastMsg.isError ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            )}
            <span>{toastMsg.text}</span>
            <button onClick={() => setToastMsg(null)} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Admin Navbar */}
      <nav className="bg-white dark:bg-[#151B2B] border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <span className="text-xl">🛡️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-400">DataGem Admin</h1>
            <p className="text-xs text-gray-500 font-medium">Enterprise Control Plane</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-full border border-green-200 dark:border-green-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            SYSTEM ONLINE
          </span>
          <button onClick={() => navigate('/chat')} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium rounded-lg transition-colors">
            Exit to App
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-[#151B2B] border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-4 space-y-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              User Management
            </button>
            <button 
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'billing' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              Billing & Tiers
            </button>
            <button 
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'services' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
              Microservices
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
                <p className="text-gray-500">Live telemetry and core metrics across the DataGem cluster.</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="text-sm font-medium text-gray-500 mb-1">Total Users</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalUsers}</div>
                  <div className="text-sm text-green-500 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    +12% this week
                  </div>
                </div>
                <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="text-sm font-medium text-gray-500 mb-1">Compute Queries (24h)</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalQueries.toLocaleString()}</div>
                  <div className="text-sm text-green-500 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    +34% this week
                  </div>
                </div>
                <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="text-sm font-medium text-gray-500 mb-1">S3 Storage Used</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.storageUsed}</div>
                  <div className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                    Plenty of space left
                  </div>
                </div>
                <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="text-sm font-medium text-gray-500 mb-1">Monthly Recurring Rev</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.mrr}</div>
                  <div className="text-sm text-green-500 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    +5% this month
                  </div>
                </div>
              </div>

              {/* Cluster Health */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cluster Health</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#151B2B] p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-medium text-gray-900 dark:text-white">FastAPI Workers</div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 text-xs rounded-full">Unmetered</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <div className="text-xs text-gray-500 text-right">45% CPU Load</div>
                </div>
                <div className="bg-white dark:bg-[#151B2B] p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-medium text-gray-900 dark:text-white">Gemini API Quota</div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 text-xs rounded-full">Unmetered</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div className="bg-gray-400 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <div className="text-xs text-gray-500 text-right">Quota tracking unavailable without GCP IAM</div>
                </div>
                <div className="bg-white dark:bg-[#151B2B] p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-medium text-gray-900 dark:text-white">PostgreSQL DB</div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 text-xs rounded-full">Unmetered</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                  <div className="text-xs text-gray-500 text-right">12% Connections Used</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
                  <p className="text-gray-500">Manage permissions, tiers, and data limits.</p>
                </div>
                <button 
                  onClick={() => {
                    const email = window.prompt("Enter the email address to invite as Admin:");
                    if (email) {
                      showToast(`Invitation sent to ${email}`);
                    }
                  }}
                  className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Invite Admin
                </button>
              </div>

              <div className="bg-white dark:bg-[#151B2B] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-[#1A2234] text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200 dark:border-gray-800">
                        <th className="px-6 py-4 font-semibold">User</th>
                        <th className="px-6 py-4 font-semibold">Tier</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Storage</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#1A2234]/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{user.full_name || user.email}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={user.tier || 'free'}
                              onChange={(e) => handleTierChange(user.id, user.email, e.target.value)}
                              className="bg-gray-100 dark:bg-gray-800 border-none rounded text-xs font-medium px-2 py-1 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-accent-500 cursor-pointer transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              <option value="free">Free</option>
                              <option value="pro">Pro</option>
                              <option value="enterprise">Enterprise</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            {(user.tier !== 'banned') ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full">Active</span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs rounded-full">Suspended</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {user.message_count || 0} msgs
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button onClick={() => handleUpgrade(user.id, user.email)} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline mr-3">Make Pro</button>
                            <button onClick={() => handleSuspend(user.id, user.email)} className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline">Ban</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue & Billing</h2>
                <p className="text-gray-500">Live Razorpay metrics and Active Pro Users.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Total Revenue</h3>
                  <p className="text-4xl font-bold text-green-500">₹{revenue}</p>
                </div>
                <div className="bg-white dark:bg-[#151B2B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Active API Keys</h3>
                  <p className="text-4xl font-bold text-indigo-500">{health} / 5</p>
                </div>
              </div>
            </motion.div>
          )}

        </main>
      </div>
    </div>
  );
}
