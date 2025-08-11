import axios from 'axios';
import { API_CONFIG } from '../constants/api.js';

const API_URL = `${API_CONFIG.BASE_URL}/api/auth`;

// Create axios instance with default config
const authAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
authAPI.interceptors.request.use(
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

// Add response interceptor to handle token refresh
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/refresh`, {
            refreshToken
          });
          
          const { token } = response.data;
          localStorage.setItem('token', token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return authAPI(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export default {
  // Authentication
  login: async (email, password) => {
    const response = await authAPI.post('/login', { email, password });
    return response.data;
  },

  register: async (email, password, firstName, lastName) => {
    const response = await authAPI.post('/register', {
      email,
      password,
      firstName,
      lastName
    });
    return response.data;
  },

  logout: async () => {
    const response = await authAPI.post('/logout');
    return response.data;
  },

  // Email verification
  verifyEmail: async (token) => {
    const response = await authAPI.post('/verify-email', { token });
    return response.data;
  },

  resendVerificationEmail: async (email) => {
    const response = await authAPI.post('/resend-verification', { email });
    return response.data;
  },

  // Password reset
  forgotPassword: async (email) => {
    const response = await authAPI.post('/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await authAPI.post('/reset-password', {
      token,
      newPassword
    });
    return response.data;
  },

  // User profile
  getUserProfile: async () => {
    const response = await authAPI.get('/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await authAPI.put('/profile', profileData);
    return response.data;
  },

  // 2FA functions
  enable2FA: async () => {
    const response = await authAPI.post('/2fa/enable');
    return response.data;
  },

  disable2FA: async () => {
    const response = await authAPI.post('/2fa/disable');
    return response.data;
  },

  verify2FA: async (code) => {
    const response = await authAPI.post('/2fa/verify', { code });
    return response.data;
  },

  // OAuth functions
  googleAuth: async (token) => {
    const response = await authAPI.post('/oauth/google', { token });
    return response.data;
  },

  githubAuth: async (code) => {
    const response = await authAPI.post('/oauth/github', { code });
    return response.data;
  },

  // Token refresh
  refreshToken: async (refreshToken) => {
    const response = await authAPI.post('/refresh', { refreshToken });
    return response.data;
  },

  // Check auth status
  checkAuthStatus: async () => {
    const response = await authAPI.get('/status');
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await authAPI.post('/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete profile picture
  deleteProfilePicture: async () => {
    const response = await authAPI.delete('/profile/picture');
    return response.data;
  }
};
