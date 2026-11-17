import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../services/api';
import { Terminal, ShieldAlert, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import TechText from './TechText';
import Lightfall from './Lightfall';

export default function ForgotPassword() {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'reset', 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authAPI.verifyOTP(email, otp);
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }
    
    setIsLoading(true);
    try {
      await authAPI.resetPassword(email, otp, newPassword);
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 font-sans tracking-tight flex items-center justify-center p-6 relative overflow-hidden selection:bg-sky-500 selection:text-black">
      
      {/* Lightfall WebGL Background with Deep Cyan-Blue & Emerald */}
      <div className="fixed inset-0 pointer-events-auto z-0 opacity-80">
        <Lightfall
          colors={['#0284c7', '#0ea5e9', '#10b981', '#ffffff']}
          backgroundColor="#032030"
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

      <div className="fixed inset-0 pointer-events-none z-[1] bg-gradient-to-t from-[#05070A] via-transparent to-[#05070A]/60" />

      <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: TechText & Pitch */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:flex flex-col justify-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300 text-xs font-sans uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(2,132,199,0.2)] w-max">
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Account Recovery
          </div>

          <div style={{ width: '100%', height: '220px', position: 'relative' }} className="my-1">
            <TechText
              text="Recover"
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
              color="#0284c7"
              align="left"
              draggable
              sweep
            />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-slate-200 mt-2 font-sans">
            Encrypted zero-knowledge credential restoration.
          </h2>
          <p className="text-xs text-slate-400 font-sans font-light leading-relaxed mt-2">
            We deliver a single-use cryptographically signed token to verify your domain ownership.
          </p>
        </motion.div>

        {/* Right Side: Recovery Flow */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="p-8 rounded-3xl bg-[#090D14]/90 border border-sky-500/30 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden font-sans"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-xs font-sans font-bold text-sky-300">
              💎
            </div>
            <span className="font-bold text-lg tracking-tight font-sans">Password Recovery</span>
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

          <AnimatePresence mode="wait">
            {/* STEP 1: ENTER EMAIL */}
            {step === 'email' && (
              <motion.div key="step-email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-xs text-slate-400 mb-4 font-sans">Enter your registered email address to receive a 6-digit OTP.</p>
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-sans font-medium uppercase tracking-wider text-slate-400 block mb-1.5">Work Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="founder@company.com"
                      className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-2.5 text-xs font-sans text-slate-100 outline-none transition-all placeholder-slate-600 shadow-inner"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02, borderColor: '#0284C7' }}
                    whileTap={{ scale: 0.96, y: 1 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-400 text-xs font-sans font-bold text-slate-100 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,0,0,0.6)] group transition-all mt-2"
                  >
                    <span>{isLoading ? 'Transmitting Code...' : 'Send Recovery OTP'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: ENTER OTP */}
            {step === 'otp' && (
              <motion.div key="step-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-xs text-slate-400 mb-4 font-sans">We sent a 6-digit code to <strong className="text-slate-200">{email}</strong>.</p>
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-sans font-medium uppercase tracking-wider text-slate-400 block mb-1.5">Verification Code</label>
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      placeholder="••••••"
                      className="w-full text-center tracking-[0.5em] text-xl font-bold bg-slate-900/90 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 font-mono text-emerald-400 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02, borderColor: '#10B981' }}
                    whileTap={{ scale: 0.96, y: 1 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 text-xs font-sans font-bold text-slate-100 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,0,0,0.6)] group transition-all mt-2"
                  >
                    <span>{isLoading ? 'Verifying...' : 'Verify Security Token'}</span>
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === 'reset' && (
              <motion.div key="step-reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-xs text-slate-400 mb-4 font-sans">Token verified. Create a secure password for your workspace.</p>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-sans font-medium uppercase tracking-wider text-slate-400 block mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-2.5 text-xs font-sans text-slate-100 outline-none transition-all placeholder-slate-600 shadow-inner"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02, borderColor: '#10B981' }}
                    whileTap={{ scale: 0.96, y: 1 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 text-xs font-sans font-bold text-slate-100 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,0,0,0.6)] group transition-all mt-2"
                  >
                    <span>{isLoading ? 'Encrypting & Saving...' : 'Set New Password'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 'success' && (
              <motion.div key="step-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-100 mb-1">Password Successfully Updated</h3>
                <p className="text-xs text-slate-400 mb-6">You can now authenticate to your analytics workspace.</p>
                <Link
                  to="/login"
                  className="w-full inline-flex py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-400 text-xs font-sans font-bold text-slate-100 items-center justify-center gap-2 transition-all"
                >
                  Return to Sign In
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {step !== 'success' && (
            <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs font-sans text-slate-500">
              Remember your credentials?{' '}
              <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold">
                Sign In
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
