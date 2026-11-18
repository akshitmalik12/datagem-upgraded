import axios from 'axios';

// Dynamically resolve API URL with fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://api-production-cf34820e.up.railway.app'
    : 'http://127.0.0.1:8001'
);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('DataGem Network error - backend unreachable or CORS mismatch.');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  signup: async (email, password, fullName) => {
    const res = await api.post('/auth/signup', { email, password, full_name: fullName });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  verifyOTP: async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  },
  resetPassword: async (email, otp, newPassword) => {
    const res = await api.post('/auth/reset-password', { email, otp, new_password: newPassword });
    return res.data;
  },
};

export const chatAPI = {
  sendMessage: (data) => api.post('/chat', data),
  getHistory: () => api.get('/chat/history'),
  clearHistory: () => api.delete('/chat/history'),
  streamChat: async (message, image = null, dataset = null, datasetPath = null, connectionString = null, sessionId = 'default') => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const customKeys = JSON.parse(localStorage.getItem('datagem_custom_keys') || '{}');
      if (customKeys.groq) headers['X-Groq-API-Key'] = customKeys.groq;
      if (customKeys.gemini) headers['X-Gemini-API-Key'] = customKeys.gemini;
      if (customKeys.openrouter) headers['X-OpenRouter-API-Key'] = customKeys.openrouter;
    } catch (e) {}

    const payload = {
      message,
      image,
      dataset,
      dataset_path: datasetPath,
      connection_string: connectionString,
      session_id: sessionId,
    };

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Chat error (${response.status}): ${errText}`);
    }

    return response.body.getReader();
  },
};

export const dashboardApi = {
  getCharts: async () => {
    const res = await api.get('/dashboard/charts');
    return res.data;
  },
  saveChart: async (title, chartData) => {
    const res = await api.post('/dashboard/charts', { title, chart_data: chartData });
    return res.data;
  },
  deleteChart: async (id) => {
    const res = await api.delete(`/dashboard/charts/${id}`);
    return res.data;
  },
};

export const voiceApi = {
  transcribe: async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    const headers = { 'Content-Type': 'multipart/form-data' };
    try {
      const customKeys = JSON.parse(localStorage.getItem('datagem_custom_keys') || '{}');
      if (customKeys.groq) headers['X-Groq-API-Key'] = customKeys.groq;
    } catch (e) {}
    const res = await api.post('/voice/transcribe', formData, {
      headers,
    });
    return res.data;
  },
};

export const billingAPI = {
  getPlans: () => api.get('/billing/plans'),
  getStatus: () => api.get('/billing/subscription-status'),
  simulateUpgrade: (planTier, email, provider = 'razorpay') => 
    api.post('/billing/webhook/simulate', {
      provider,
      email,
      plan_tier: planTier,
      amount: planTier === 'pro' ? '₹2,499' : (planTier === 'operator' ? '₹7,999' : '₹24,999')
    }),
};

export default api;
