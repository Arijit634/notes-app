import axios from 'axios';
import toast from 'react-hot-toast';
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS, STORAGE_KEYS } from '../constants/api';
import { cacheUtils, rateLimitUtils } from '../utils/rateLimitUtils';

// Token utilities
const tokenUtils = {
  setToken: (token) => localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
  getToken: () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  removeToken: () => localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
  setRefreshToken: (token) => localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token),
  getRefreshToken: () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  clearTokens: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
  setUserInfo: (userInfo) => localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo)),
  getUserInfo: () => {
    const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    return userInfo ? JSON.parse(userInfo) : null;
  },
  removeUserInfo: () => localStorage.removeItem(STORAGE_KEYS.USER_INFO),
  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and handle rate limiting
apiClient.interceptors.request.use(
  async (config) => {
    const endpoint = config.url;
    
    // Check client-side rate limiting
    if (rateLimitUtils.shouldThrottle(endpoint)) {
      const remaining = rateLimitUtils.getRemainingRequests(endpoint);
      throw new Error(`Rate limit exceeded for ${endpoint}. ${remaining} requests remaining this minute.`);
    }
    
    // Check cache for GET requests
    if (config.method === 'get') {
      const cacheKey = `${endpoint}?${new URLSearchParams(config.params || {}).toString()}`;
      const cached = cacheUtils.get(cacheKey);
      if (cached) {
        // Return cached response
        return Promise.reject({
          __cached: true,
          data: cached
        });
      }
    }
    
    // Record the request
    rateLimitUtils.recordRequest(endpoint);
    
    // Add auth token
    const token = tokenUtils.getToken();
    if (token && !tokenUtils.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and caching
apiClient.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get') {
      const endpoint = response.config.url;
      const cacheKey = `${endpoint}?${new URLSearchParams(response.config.params || {}).toString()}`;
      cacheUtils.set(cacheKey, response.data);
    }
    
    return response;
  },
  async (error) => {
    // Handle cached responses
    if (error.__cached) {
      return Promise.resolve({ data: error.data });
    }
    
    const originalRequest = error.config;

    // Handle rate limiting responses
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      const message = `Too many requests. Please wait ${retryAfter} seconds before trying again.`;
      toast.error(message);
      
      // Add extra throttling on client side
      const endpoint = error.config?.url;
      if (endpoint) {
        rateLimitUtils.recordRequest(endpoint);
      }
      
      return Promise.reject(new Error(message));
    }

    // Handle 401 unauthorized errors
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear tokens and redirect to login
      tokenUtils.removeToken();
      tokenUtils.removeUserInfo();
      window.location.href = '/auth';
      return Promise.reject(error);
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    // Don't show toast for certain errors that should be handled by components
    const silentErrors = [HTTP_STATUS.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN];
    if (!silentErrors.includes(error.response?.status)) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.SIGNIN, credentials);
    
    // Check if 2FA is required
    if (response.data.requires2FA) {
      return response.data; // Return 2FA required response
    }
    
    // Normal login flow
    if (response.data.jwtToken) {
      tokenUtils.setToken(response.data.jwtToken);
      // Get user info after login
      const userInfo = await authAPI.getUserInfo();
      tokenUtils.setUserInfo(userInfo);
    }
    return response.data;
  },

  completeTwoFactorLogin: async (username, verificationCode) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.SIGNIN_2FA, {
      username,
      verificationCode
    });
    
    if (response.data.jwtToken) {
      tokenUtils.setToken(response.data.jwtToken);
      // Get user info after login
      const userInfo = await authAPI.getUserInfo();
      tokenUtils.setUserInfo(userInfo);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, userData);
    return response.data;
  },

  getUserInfo: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.USER_INFO);
    return response.data;
  },

  getUsername: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.USERNAME);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, null, {
      params: { email }
    });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, null, {
      params: { token, newPassword }
    });
    return response.data;
  },

  logout: async () => {
    try {
      // Call backend logout endpoint
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Even if backend call fails, clear local storage
      console.warn('Backend logout failed, clearing local storage anyway:', error);
    } finally {
      // Always clear local storage
      tokenUtils.removeToken();
      tokenUtils.removeUserInfo();
    }
  },

  // 2FA methods
  enable2FA: async () => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.ENABLE_2FA);
    return response.data;
  },

  disable2FA: async () => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.DISABLE_2FA);
    return response.data;
  },

  verify2FA: async (code) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_2FA, null, {
      params: { code }
    });
    return response.data;
  },

  get2FAStatus: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.GET_2FA_STATUS);
    return response.data;
  },

  // OAuth 2FA verification
  verifyOAuth2FA: async (code, username) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.OAUTH2_VERIFY_2FA, null, {
      params: { code, username }
    });
    return response.data;
  },
};

// Notes API
export const notesAPI = {
  getNotes: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.NOTES.BASE, { params });
    return response.data;
  },

  getNoteById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.NOTES.GET_BY_ID(id));
    return response.data;
  },

  createNote: async (noteData) => {
    const response = await apiClient.post(API_ENDPOINTS.NOTES.CREATE, noteData);
    return response.data;
  },

  updateNote: async (id, noteData) => {
    const response = await apiClient.put(API_ENDPOINTS.NOTES.UPDATE(id), noteData);
    return response.data;
  },

  deleteNote: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.NOTES.DELETE(id));
    return response.data;
  },

  searchNotes: async (query, params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.NOTES.SEARCH, {
      params: { query, ...params }
    });
    return response.data;
  },

  getNotesStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.NOTES.STATS);
    return response.data;
  },

  toggleFavorite: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.NOTES.TOGGLE_FAVORITE(id));
    return response.data;
  },

  getFavorites: async (params = {}) => {
    const response = await apiClient.get('/api/notes/favorites', { params });
    return response.data;
  },

  getPublicNotes: async () => {
    const response = await apiClient.get('/api/notes/public');
    return response.data;
  },
};

// Activities API
export const activitiesAPI = {
  getActivities: async (params = {}) => {
    const response = await apiClient.get('/api/activities', { params });
    return response.data;
  },

  getRecentActivities: async (days = 30, params = {}) => {
    const response = await apiClient.get('/api/activities/recent', { 
      params: { days, ...params } 
    });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getUsers: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.USERS, { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.USER_BY_ID(id));
    return response.data;
  },

  updateUserRole: async (id, roleName) => {
    const response = await apiClient.put(API_ENDPOINTS.ADMIN.UPDATE_USER_ROLE(id), null, {
      params: { roleName }
    });
    return response.data;
  },

  updateUserStatus: async (id, statusData) => {
    const response = await apiClient.put(API_ENDPOINTS.ADMIN.UPDATE_USER_STATUS(id), null, {
      params: statusData
    });
    return response.data;
  },

  getRoles: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.ROLES);
    return response.data;
  },

  getAuditLogs: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.AUDIT_LOGS, { params });
    return response.data;
  },
};

// Profile API
export const profileAPI = {
  getUserProfile: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PROFILE.BASE);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put(API_ENDPOINTS.PROFILE.BASE, profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await apiClient.post(API_ENDPOINTS.PROFILE.CHANGE_PASSWORD, passwordData);
    return response.data;
  },

  uploadProfilePicture: async (file) => {
    console.log('Uploading profile picture:', {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeMB: (file.size / (1024 * 1024)).toFixed(2)
    });

    // Validate file size on frontend (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed size (10MB)`);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type) && file.type !== 'application/octet-stream') {
      // Some mobile browsers might send application/octet-stream for images
      const isImageFile = /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(file.name);
      if (!isImageFile) {
        throw new Error('Only image files are allowed (JPG, PNG, GIF, WebP, HEIC)');
      }
    }

    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(API_ENDPOINTS.PROFILE.UPLOAD_PICTURE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds timeout for mobile uploads
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });
    return response.data;
  },

  deleteProfilePicture: async () => {
    const response = await apiClient.delete(API_ENDPOINTS.PROFILE.DELETE_PICTURE);
    return response.data;
  },

  setupTwoFactor: async () => {
    const response = await apiClient.post(API_ENDPOINTS.PROFILE.SETUP_2FA);
    return response.data;
  },

  verifyTwoFactor: async (code) => {
    const response = await apiClient.post(API_ENDPOINTS.PROFILE.VERIFY_2FA, { verificationCode: code });
    return response.data;
  },

  disableTwoFactor: async (code) => {
    const response = await apiClient.post(API_ENDPOINTS.PROFILE.DISABLE_2FA, { verificationCode: code });
    return response.data;
  },
};

// Export everything
export { apiClient, apiClient as apiService, tokenUtils };
export default apiClient;
