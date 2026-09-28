import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import NotFound from './components/NotFound';

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Chat from './components/Chat';
import About from './components/About';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import AdminDashboard from './components/AdminDashboard';
import Dashboard from './components/Dashboard';
import Pricing from './components/Pricing';
import SplashScreen from './components/SplashScreen';
import ProtectedRoute from './components/ProtectedRoute';
import DataHealth from './components/DataHealth';
import SharedDashboard from './components/SharedDashboard';
import './App.css';

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/chat')) {
      document.title = 'Chat - DataGem';
    } else if (path.startsWith('/admin')) {
      document.title = 'Admin - DataGem';
    } else if (path === '/login' || path === '/signup') {
      document.title = 'Authentication - DataGem';
    } else {
      document.title = 'DataGem - AI Analyst';
    }
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/pricing" element={<PageWrapper><Pricing isStandalone={true} /></PageWrapper>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/data-health" element={<ProtectedRoute><PageWrapper><DataHealth /></PageWrapper></ProtectedRoute>} />
        <Route path="/share/:id" element={<PageWrapper><SharedDashboard /></PageWrapper>} />
        <Route path="/chat" element={<ProtectedRoute><PageWrapper><Chat /></PageWrapper></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function AppContent() {
  const [showSplash, setShowSplash] = useState(!sessionStorage.getItem('splashShown'));
  
  const handleSplashComplete = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => handleSplashComplete()} />;
  }

  return (
    <HelmetProvider>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AnimatedRoutes />
    </Router>
    </HelmetProvider>
  );
}

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
      <AuthProvider>
          <Toaster position="top-center" />
          <AppContent />
        </AuthProvider>
      </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
