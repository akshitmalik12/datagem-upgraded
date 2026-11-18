import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const INACTIVITY_TIMEOUT_MS = 6 * 60 * 60 * 1000; // 6 hours

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        // Check if session exceeded 6 hours of inactivity
        const lastActive = parseInt(localStorage.getItem('datagem_last_active') || '0', 10);
        if (lastActive && (Date.now() - lastActive > INACTIVITY_TIMEOUT_MS)) {
          console.warn('Session expired after 6 hours of inactivity.');
          localStorage.removeItem('token');
          localStorage.removeItem('datagem_last_active');
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          const userData = await authAPI.getMe();
          setUser(userData);
          setToken(storedToken);
          localStorage.setItem('datagem_last_active', Date.now().toString());
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('datagem_last_active');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Inactivity tracking when logged in
  useEffect(() => {
    if (!token) return;

    const updateActivity = () => {
      localStorage.setItem('datagem_last_active', Date.now().toString());
    };

    const checkInactivity = () => {
      const lastActive = parseInt(localStorage.getItem('datagem_last_active') || '0', 10);
      if (lastActive && (Date.now() - lastActive > INACTIVITY_TIMEOUT_MS)) {
        console.warn('Auto-logging out after 6 hours of inactivity.');
        logout();
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    let lastThrottled = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastThrottled > 15000) { // throttle write to every 15s
        lastThrottled = now;
        updateActivity();
      }
    };

    events.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));
    const interval = setInterval(checkInactivity, 60000); // verify every 1 minute

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
      clearInterval(interval);
    };
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('datagem_last_active', Date.now().toString());
      setToken(data.access_token);
      
      const userData = await authAPI.getMe();
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      if (error.response) {
        errorMessage = error.response.data?.detail || error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:8001';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check if the backend server is running and CORS is configured.';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const signup = async (email, password, fullName) => {
    try {
      await authAPI.signup(email, password, fullName);
      // After signup, automatically log in
      return await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Signup failed';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.detail || error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:8001';
      } else if (error.message) {
        // Something else happened
        errorMessage = error.message;
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check if the backend server is running and CORS is configured.';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('datagem_last_active');
    localStorage.removeItem('datagem_sessions');
    localStorage.removeItem('datagem_chat_sessions');
    localStorage.removeItem('datagem_current_project_id');
    localStorage.removeItem('datagem_current_dataset_id');
    // Clear in-memory cross-page chat cache
    try {
      if (typeof window !== 'undefined' && window.__DATAGEM_CLEAR_CHAT_CACHE__) {
        window.__DATAGEM_CLEAR_CHAT_CACHE__();
      }
    } catch (e) {}
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

