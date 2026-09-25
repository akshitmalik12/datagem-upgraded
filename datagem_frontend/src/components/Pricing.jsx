import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Pricing({ isOpen, onClose, isStandalone = false }) {
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();

  const handleClose = () => {
    if (!loading && onClose) onClose();
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (tier) => {
    setLoading(tier);
    try {
      // 1. Create order on backend
      const res = await api.post('/billing/create-order', { tier: tier });
      const order = res.data;

      // 2. Load Razorpay script
      const resScript = await loadRazorpayScript();
      if (!resScript) throw new Error("Razorpay SDK failed to load");

      // 3. Open Razorpay Checkout
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "DataGem AI",
        description: `Upgrade to ${tier}`,
        order_id: order.order_id,
        handler: async function (response) {
          // 4. Verify payment
          try {
            const verifyRes = await api.post('/billing/verify', {
              razorpay_payment_id: response.razorpay_payment_id || "mock_payment_id",
              razorpay_order_id: response.razorpay_order_id || order.order_id,
              razorpay_signature: response.razorpay_signature || "mock_signature",
              tier: tier
            });
            const verifyData = verifyRes.data;
            if (verifyData.success) {
              toast.success(`Welcome to DataGem ${tier}! Check your email for next steps.`);
              await refreshUser();
              if (onClose) onClose();
            }
          } catch (e) {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: order.user_name,
          email: order.user_email
        },
        theme: { color: "#4F46E5" }
      };

      // Mock handler for dummy keys
      if (order.key_id === "rzp_test_dummy_key") {
        options.handler({ razorpay_payment_id: "mock", razorpay_order_id: "mock", razorpay_signature: "mock" });
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-stretch">
      {/* PRO TIER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex-1 bg-white dark:bg-[#111827] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl flex flex-col relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="p-10 border-b border-gray-100 dark:border-gray-800 relative z-10">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Pro</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 h-10">Perfect for power users who need advanced reasoning.</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-black tracking-tight text-gray-900 dark:text-white">$15</span>
            <span className="text-gray-500 font-medium">/mo</span>
          </div>
        </div>
        <div className="p-10 flex-1 flex flex-col relative z-10">
          <ul className="space-y-4 mb-10 flex-1">
            <Feature text="Gemini 1.5 Pro Reasoning" />
            <Feature text="Unlimited Data Connections" />
            <Feature text="Multi-Table SQL JOINs" />
            <Feature text="Custom Analyst Personas" />
            <Feature text="Export to Jupyter Notebooks" />
          </ul>
          <button
            onClick={() => handleUpgrade('Pro')}
            disabled={loading !== false}
            className="w-full py-4 px-6 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading === 'Pro' ? "Processing..." : "Upgrade to Pro"}
          </button>
        </div>
      </motion.div>

      {/* ENTERPRISE TIER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex-1 bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-900 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20 flex flex-col relative transform md:-translate-y-4 border border-indigo-500/30 group"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="p-10 border-b border-indigo-500/20 relative z-10">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-white">Enterprise</h3>
            <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full tracking-wider">RECOMMENDED</span>
          </div>
          <p className="text-indigo-200/70 text-sm mb-6 h-10">For teams that need maximum security and performance.</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-black tracking-tight text-white">$79</span>
            <span className="text-indigo-300 font-medium">/mo</span>
          </div>
        </div>
        <div className="p-10 flex-1 flex flex-col relative z-10 text-white">
          <ul className="space-y-4 mb-10 flex-1">
            <Feature text="Everything in Pro" dark={true} />
            <Feature text="Google Sheets Multi-Tab Sync" highlight="New" dark={true} />
            <Feature text="Dedicated CPU / Database Cluster" dark={true} />
            <Feature text="SAML SSO & Audit Logs" dark={true} />
            <Feature text="Priority 24/7 Support" dark={true} />
          </ul>
          <button
            onClick={() => handleUpgrade('Enterprise')}
            disabled={loading !== false}
            className="w-full py-4 px-6 bg-white hover:bg-gray-100 text-indigo-900 font-bold rounded-xl transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] flex items-center justify-center gap-2"
          >
            {loading === 'Enterprise' ? "Processing..." : "Upgrade to Enterprise"}
          </button>
        </div>
      </motion.div>
    </div>
  );

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 flex flex-col font-sans relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px]" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px]" />
        </div>
        
        {/* Simple navbar for standalone */}
        <nav className="relative z-10 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
              D
            </div>
            <span className="text-2xl font-bold tracking-tight">DataGem</span>
          </div>
          <button onClick={() => window.location.href = '/chat'} className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            Return to App
          </button>
        </nav>

        <div className="flex-1 flex flex-col items-center py-20 px-6 relative z-10 overflow-y-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-6xl font-black mb-6 tracking-tight">Simple pricing, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">infinite insights.</span></h1>
            <p className="text-xl text-gray-500 dark:text-gray-400">Stop wasting time writing SQL. Get DataGem and automate your data workflow forever.</p>
          </div>
          {content}
        </div>
      </div>
    );
  }

  // Modal mode
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-md"
          />
          <div className="relative z-10 w-full flex justify-center">
             {content}
          </div>
          {/* Close button for modal */}
          <button onClick={handleClose} className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </AnimatePresence>
  );
}

function Feature({ text, highlight, dark = false }) {
  return (
    <div className="flex items-center">
      <div className={`mt-0.5 mr-3 shrink-0 rounded-full p-0.5 ${dark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400'}`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="flex items-center gap-2">
        <p className={`font-medium ${dark ? 'text-indigo-50' : 'text-gray-700 dark:text-gray-300'}`}>{text}</p>
        {highlight && <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${dark ? 'bg-pink-500/20 text-pink-300' : 'bg-indigo-100 text-indigo-600'}`}>{highlight}</span>}
      </div>
    </div>
  );
}
