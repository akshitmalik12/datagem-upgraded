import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = (tier) => {
    setLoading(true);
    // Simulate a Stripe checkout redirect
    setTimeout(() => {
      setLoading(false);
      alert(`Redirecting to Stripe checkout for ${tier.toUpperCase()} tier! (Simulation)`);
    }, 1000);
  };

  const currentTier = user ? user.tier : 'free';

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white pt-12 pb-12 px-4 sm:px-6 lg:px-8 relative">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back
      </button>
      <div className="max-w-7xl mx-auto mt-8">
        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-extrabold sm:text-4xl lg:text-5xl"
          >
            Pricing Plans
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl text-gray-400"
          >
            Choose the perfect plan for your data analysis needs.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-12">
          {/* FREE TIER */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-2xl bg-[#252525] p-8 border ${currentTier === 'free' ? 'border-[#8B5CF6]' : 'border-gray-800'}`}
          >
            <h3 className="text-2xl font-semibold">Free</h3>
            <p className="mt-4 text-gray-400">Perfect for trying out DataGem.</p>
            <p className="mt-8 text-4xl font-extrabold">$0<span className="text-xl font-medium text-gray-400">/mo</span></p>
            <ul className="mt-8 space-y-4 text-gray-300">
              <li className="flex items-center">✓ 5 MB File Upload Limit</li>
              <li className="flex items-center">✓ 10 Messages per Day</li>
              <li className="flex items-center">✓ Static Visualizations</li>
            </ul>
            <button 
              disabled={currentTier === 'free'}
              className="mt-8 w-full py-3 px-4 rounded-md font-semibold text-white bg-gray-700 disabled:opacity-50"
            >
              {currentTier === 'free' ? 'Current Plan' : 'Downgrade'}
            </button>
          </motion.div>

          {/* PRO TIER */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-2xl bg-[#252525] p-8 border ${currentTier === 'pro' ? 'border-[#8B5CF6]' : 'border-[#8B5CF6] relative shadow-[0_0_15px_rgba(139,92,246,0.3)]'}`}
          >
            {currentTier !== 'pro' && (
              <div className="absolute top-0 right-0 -mt-4 mr-4 px-3 py-1 bg-[#8B5CF6] text-white text-xs font-bold rounded-full">
                RECOMMENDED
              </div>
            )}
            <h3 className="text-2xl font-semibold text-[#8B5CF6]">Pro</h3>
            <p className="mt-4 text-gray-400">For students and professionals.</p>
            <p className="mt-8 text-4xl font-extrabold">$15<span className="text-xl font-medium text-gray-400">/mo</span></p>
            <ul className="mt-8 space-y-4 text-gray-300">
              <li className="flex items-center">✓ 25 MB File Upload Limit</li>
              <li className="flex items-center">✓ 100 Messages per Day</li>
              <li className="flex items-center">✓ Interactive Plotly Charts</li>
              <li className="flex items-center">✓ Export Chat History</li>
            </ul>
            <button 
              onClick={() => handleCheckout('pro')}
              disabled={currentTier === 'pro' || loading}
              className="mt-8 w-full py-3 px-4 rounded-md font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50"
            >
              {currentTier === 'pro' ? 'Current Plan' : loading ? 'Processing...' : 'Upgrade to Pro'}
            </button>
          </motion.div>

          {/* ENTERPRISE TIER */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-2xl bg-[#252525] p-8 border ${currentTier === 'enterprise' ? 'border-yellow-500' : 'border-gray-800'}`}
          >
            <h3 className="text-2xl font-semibold text-yellow-500">Enterprise</h3>
            <p className="mt-4 text-gray-400">For heavy workloads and admins.</p>
            <p className="mt-8 text-4xl font-extrabold">$49<span className="text-xl font-medium text-gray-400">/mo</span></p>
            <ul className="mt-8 space-y-4 text-gray-300">
              <li className="flex items-center">✓ 100 MB File Upload Limit</li>
              <li className="flex items-center">✓ Unlimited Messages</li>
              <li className="flex items-center text-yellow-400 font-bold">✓ Scikit-Learn Predictive ML</li>
              <li className="flex items-center">✓ Admin Dashboard Access</li>
            </ul>
            <button 
              onClick={() => handleCheckout('enterprise')}
              disabled={currentTier === 'enterprise' || loading}
              className="mt-8 w-full py-3 px-4 rounded-md font-semibold text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
            >
              {currentTier === 'enterprise' ? 'Current Plan' : loading ? 'Processing...' : 'Upgrade to Enterprise'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
