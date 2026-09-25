import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - Backend may not be running or CORS not configured');
    }
    return Promise.reject(error);
  }
);

// Chat API
export const chatAPI = {
  generateTitle: async (message, datasetName = null, columns = null) => {
    try {
      const payload = { message };
      if (datasetName) payload.dataset_name = datasetName;
      if (columns) payload.columns = columns;
      const response = await api.post('/chat/title', payload);
      return response.data.title;
    } catch (e) {
      console.error("Failed to generate title", e);
      return message.substring(0, 30) + "...";
    }
  },
  uploadDataset: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/chat/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  streamChat: async (message, imageFile = null, dataset = null, datasetPath = null, connectionString = null, sessionId = "default") => {
    // Use /chat endpoint (no auth required)
    try {
      const requestBody = { message: message, session_id: sessionId };
      if (datasetPath) {
        requestBody.dataset_path = datasetPath;
      } else if (dataset && Array.isArray(dataset) && dataset.length > 0) {
        requestBody.dataset = dataset;
      }
      if (connectionString) {
        requestBody.connection_string = connectionString;
      }
      
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE_URL}/chat/`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      }).catch((networkError) => {
        // Handle network-level errors (CORS, connection refused, etc.)
        console.error('Network fetch error:', networkError);
        throw new Error(`Failed to fetch: ${networkError.message || 'Cannot connect to backend. Make sure it\'s running on http://127.0.0.1:8000'}`);
      });

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          // Ignore error reading response
        }
        
        if (response.status === 429) {
          let msg = errorText;
          try {
            const parsed = JSON.parse(errorText);
            msg = parsed.detail || errorText;
          } catch(e) {}
          throw new Error('RATE_LIMIT:' + msg);
        } else if (response.status === 401) {
          throw new Error('Server authentication error. Please try again.');
        } else if (response.status === 500) {
          throw new Error(`Server error: ${errorText || 'Internal server error'}`);
        } else if (response.status === 404) {
          throw new Error('Chat endpoint not found. Please check if the backend is running correctly.');
        } else {
          throw new Error(`Failed to stream chat response: ${response.status} ${response.statusText}. ${errorText}`);
        }
      }

      if (!response.body) {
        throw new Error('Response body is null - the server did not return a streamable response.');
      }

      return response.body;
    } catch (fetchError) {
      // Re-throw if it's already a proper Error with message
      if (fetchError instanceof Error && fetchError.message) {
        throw fetchError;
      }
      // Handle other types of errors
      throw new Error(`Network error: ${fetchError.message || 'Failed to connect to backend. Please ensure the backend is running on http://127.0.0.1:8000'}`);
    }
  },
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post('/auth/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },
  signup: async (email, password, fullName) => {
    const response = await api.post('/auth/signup', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  verifyOTP: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },
  
  resetPassword: async (email, otp, new_password) => {
    const response = await api.post('/auth/reset-password', { email, otp, new_password });
    return response.data;
  },
};

export default api;


export const dashboardApi = {
  getCharts: async () => {
    const charts = JSON.parse(localStorage.getItem('datagem_charts') || '[]');
    return { data: charts };
  },
  saveChart: async (title, plotlyJson) => {
    const charts = JSON.parse(localStorage.getItem('datagem_charts') || '[]');
    const newChart = { id: Date.now(), title, plotly_json: plotlyJson, created_at: new Date().toISOString() };
    charts.push(newChart);
    localStorage.setItem('datagem_charts', JSON.stringify(charts));
    return { data: newChart };
  },
  deleteChart: async (id) => {
    let charts = JSON.parse(localStorage.getItem('datagem_charts') || '[]');
    charts = charts.filter(c => c.id !== id);
    localStorage.setItem('datagem_charts', JSON.stringify(charts));
    return { success: true };
  }
};

export const voiceApi = {
  transcribe: async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio_file", audioBlob, "recording.webm");
    const response = await fetch(`${API_BASE_URL}/chat/transcribe`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error("Transcription failed");
    return response.json();
  }
};
