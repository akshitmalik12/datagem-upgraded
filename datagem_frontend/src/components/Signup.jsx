import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Terminal, ShieldCheck, Activity, Sparkles, CheckCircle2 } from 'lucide-react';
import TechText from './TechText';
import Lightfall from './Lightfall';
import DataGemLogo from './DataGemLogo';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(email, password, fullName);
      if (result.success) {
        navigate('/chat');
      } else {
        setError(result.error || 'Failed to create account.');
      }
    } catch (err) {
      setError(err.message || 'Cannot connect to server. Please check your backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 font-sans tracking-tight flex items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-500 selection:text-black">
      
      {/* Dynamic WebGL Lightfall Background with Deep Cyan-Blue & Emerald */}
      <div className="fixed inset-0 pointer-events-auto z-0 opacity-80">
        <Lightfall
          colors={['#10b981', '#34d399', '#0284c7', '#0ea5e9', '#ffffff']}
          backgroundColor="#022c22"
          speed={0.25}
          streakCount={3}
          streakWidth={0.75}
          streakLength={1.1}
          twinkle={0.35}
          backgroundGlow={0.16}
          headGlow={0.65}
          bloom={0.4}
          mouseInteraction
          mouseStrength={0.45}
          mouseRadius={0.4}
          lens={0.4}
          holdToWarp
          intro
        />
      </div>

      {/* Subtle Dark Vignette Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] bg-gradient-to-t from-[#05070A] via-transparent to-[#05070A]/60" />

      <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Pitch in Inter Font */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:flex flex-col justify-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-sans uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)] w-max">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Instant Provisioning
          </div>

          <div style={{ width: '100%', height: '220px', position: 'relative' }} className="my-1">
            <TechText
              text="Create"
              fontWeight={700}
              fontSize={100}
              reveal="letter"
              dashLength={4}
              dashGap={2}
              specks={6}
              intro="metrics"
              introDuration={2.8}
              clickKick
              guides
              fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
              letterSpacing={-0.04}
              accentColor="currentColor"
              reach={200}
              softness={0.7}
              lineStyle="solid"
              strokeWidth={1.25}
              speed={1}
              bounce={0.75}
              selection
              labels
              color="#10b981"
              align="left"
              draggable
              sweep
            />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-slate-200 mt-2 font-sans">
            Launch your company's automated data operations room.
          </h2>
          <p className="text-xs text-slate-400 font-sans font-light leading-relaxed mt-2">
            No credit card required. Free tier includes 50 fast DuckDB queries, automated daily anomaly alerts, and CSV exports.
          </p>

          <div className="space-y-3 pt-6 font-sans">
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200 font-sans">14-Day Pro Trial Included</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">Full access to scheduled Slack watchdog digests & deep cohort runs.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-sky-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200 font-sans">Enterprise-Ready Isolation</h4>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">Row-level security enforcement with dedicated memory instances.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Signup Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="p-8 rounded-3xl bg-[#090D14]/90 border border-emerald-500/30 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden font-sans"
        >
          <div className="flex items-center gap-2 mb-6">
            <DataGemLogo size="sm" glow={true} />
            <span className="font-bold text-lg tracking-tight font-sans">Join DataGem</span>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-sans"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSignup} className="space-y-3.5 font-sans">
            <div>
              <label className="text-[11px] font-sans font-medium uppercase tracking-wider text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2 text-xs font-sans text-slate-100 outline-none transition-all placeholder-slate-600 shadow-inner"
              />
            </div>

            <div>
              <label className="text-[11px] font-sans font-medium uppercase tracking-wider text-slate-400 block mb-1">Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2 text-xs font-sans text-slate-100 outline-none transition-all placeholder-slate-600 shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-sans font-medium uppercase tracking-wider text-slate-400 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2 text-xs font-sans text-slate-100 outline-none transition-all placeholder-slate-600 shadow-inner"
                />
              </div>

              <div>
                <label className="text-[11px] font-sans font-medium uppercase tracking-wider text-slate-400 block mb-1">Confirm</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2 text-xs font-sans text-slate-100 outline-none transition-all placeholder-slate-600 shadow-inner"
                />
              </div>
            </div>

            {/* Snappy Keycap Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02, borderColor: '#0284C7' }}
              whileTap={{ scale: 0.96, y: 1 }}
              transition={{ duration: 0.06 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-400 text-xs font-sans font-bold text-slate-100 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,0,0,0.6)] group transition-all mt-3"
            >
              <Terminal className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-12 transition-transform" />
              <span>{isLoading ? 'Creating Workspace...' : 'Create Free Account'}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-sky-300 font-sans border border-slate-700 font-semibold">↵</span>
            </motion.button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs font-sans text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
