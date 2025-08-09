// API Configuration Constants
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// API Endpoints (Based on actual backend implementation)
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    SIGNIN: '/auth/public/signin',
    SIGNUP: '/auth/public/signup',
    LOGOUT: '/auth/logout',
    USER_INFO: '/auth/user',
    USERNAME: '/auth/username',
    FORGOT_PASSWORD: '/auth/public/forgot-password',
    RESET_PASSWORD: '/auth/public/reset-password',
    ENABLE_2FA: '/auth/enable-2fa',
    DISABLE_2FA: '/auth/disable-2fa',
    VERIFY_2FA: '/auth/verify-2fa',
    GET_2FA_STATUS: '/auth/user/2fa-status',
    VERIFY_2FA_LOGIN: '/auth/public/verify-2fa-login',
    OAUTH2_SUCCESS: '/auth/oauth2/success',
    OAUTH2_GOOGLE: '/oauth2/authorization/google',
    OAUTH2_GITHUB: '/oauth2/authorization/github',
    PUBLIC_TEST: '/auth/public/test',
    PUBLIC_LOGIN: '/auth/public/login',
  },
  
  // Notes endpoints (Based on actual backend implementation)
  NOTES: {
    BASE: '/api/notes',
    GET_BY_ID: (id) => `/api/notes/${id}`,
    CREATE: '/api/notes',
    UPDATE: (id) => `/api/notes/${id}`,
    DELETE: (id) => `/api/notes/${id}`,
    SEARCH: '/api/notes/search',
    STATS: '/api/notes/stats',
    TOGGLE_FAVORITE: (id) => `/api/notes/${id}/favorite`,
  },
  
  // Admin endpoints (Based on actual backend implementation)
  ADMIN: {
    USERS: '/admin/users',
    USER_BY_ID: (id) => `/admin/users/${id}`,
    UPDATE_USER_ROLE: (id) => `/admin/users/${id}/role`,
    UPDATE_USER_STATUS: (id) => `/admin/users/${id}/status`,
    ROLES: '/admin/users/roles',
    AUDIT_LOGS: '/admin/audit-logs',
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Token Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_INFO: 'userInfo',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Request timeout
export const REQUEST_TIMEOUT = 30000; // 30 seconds
