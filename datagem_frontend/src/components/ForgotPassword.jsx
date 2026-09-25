import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../services/api';

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
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0B0F19]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <span className="text-3xl">💎</span>
            <span className="text-2xl font-bold text-white tracking-tight">DataGem</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
              Secure Account<br />Recovery.
            </h1>
            <p className="text-indigo-100 text-lg mb-12 max-w-md">
              We'll send a one-time verification code to your email address to help you securely reset your password.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: ENTER EMAIL */}
            {step === 'email' && (
              <motion.div key="step-email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-10 text-center lg:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h2>
                  <p className="text-gray-600 dark:text-gray-400">Enter your email address and we'll send you an OTP.</p>
                </div>
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-white dark:bg-[#151B2B] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white" placeholder="name@company.com" />
                  </div>
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg">{isLoading ? 'Sending...' : 'Send OTP'}</button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: ENTER OTP */}
            {step === 'otp' && (
              <motion.div key="step-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-10 text-center lg:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Verify Email</h2>
                  <p className="text-gray-600 dark:text-gray-400">We sent a 6-digit code to <strong>{email}</strong>.</p>
                </div>
                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">One-Time Password (OTP)</label>
                    <input type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} required className="w-full px-4 py-3 text-center tracking-[1em] text-2xl font-bold bg-white dark:bg-[#151B2B] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white" placeholder="••••••" />
                  </div>
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg">{isLoading ? 'Verifying...' : 'Verify OTP'}</button>
                </form>
              </motion.div>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === 'reset' && (
              <motion.div key="step-reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-10 text-center lg:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Password</h2>
                  <p className="text-gray-600 dark:text-gray-400">Your email has been verified. Please set a new password.</p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-4 py-3 bg-white dark:bg-[#151B2B] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white" placeholder="••••••••" />
                  </div>
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg">{isLoading ? 'Saving...' : 'Reset Password'}</button>
                </form>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 'success' && (
              <motion.div key="step-success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Password Updated!</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">You can now securely log in to your account with your new password.</p>
                  <Link to="/login" className="block w-full py-3 px-4 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors">
                    Back to Login
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {step !== 'success' && (
            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{' '}
              <Link to="/login" className="text-accent-600 dark:text-accent-400 font-semibold hover:underline">
                Log in here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
