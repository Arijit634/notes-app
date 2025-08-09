import Cookies from 'js-cookie';
import { STORAGE_KEYS } from '../constants/api';

/**
 * Token Management Utilities
 */
export const tokenUtils = {
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || 
           Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);
  },

  setToken(token) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    Cookies.set(STORAGE_KEYS.ACCESS_TOKEN, token, { expires: 7 });
  },

  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) ||
           Cookies.get(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    Cookies.set(STORAGE_KEYS.REFRESH_TOKEN, token, { expires: 30 });
  },

  clearTokens() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    Cookies.remove(STORAGE_KEYS.ACCESS_TOKEN);
    Cookies.remove(STORAGE_KEYS.REFRESH_TOKEN);
  },

  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  getTokenPayload(token) {
    if (!token) return null;
    
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  }
};

/**
 * User Information Utilities
 */
export const userUtils = {
  getUserInfo() {
    const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    return userInfo ? JSON.parse(userInfo) : null;
  },

  setUserInfo(user) {
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
  },

  clearUserInfo() {
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  },

  hasRole(requiredRole) {
    const user = this.getUserInfo();
    if (!user || !user.roles) return false;
    
    return user.roles.includes(requiredRole);
  },

  isAdmin() {
    return this.hasRole('ROLE_ADMIN');
  },

  isUser() {
    return this.hasRole('ROLE_USER');
  }
};

/**
 * Theme Utilities
 */
export const themeUtils = {
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    this.applyTheme(theme);
  },

  applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.setAttribute('data-theme', 'light');
    }
  },

  initTheme() {
    const theme = this.getTheme();
    this.applyTheme(theme);
    return theme;
  },

  toggleTheme() {
    const currentTheme = this.getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    return newTheme;
  }
};

/**
 * URL Utilities
 */
export const urlUtils = {
  getQueryParams() {
    return new URLSearchParams(window.location.search);
  },

  getQueryParam(key) {
    return this.getQueryParams().get(key);
  },

  removeQueryParams() {
    window.history.replaceState({}, document.title, window.location.pathname);
  },

  buildUrl(baseUrl, params = {}) {
    const url = new URL(baseUrl);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });
    return url.toString();
  }
};

/**
 * Form Validation Utilities
 */
export const validationUtils = {
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 digit, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    return password.length >= 8 && passwordRegex.test(password);
  },

  isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return username.length >= 3 && username.length <= 20 && usernameRegex.test(username);
  }
};

/**
 * Error Handling Utilities
 */
export const errorUtils = {
  getErrorMessage(error) {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error?.response?.data?.error) {
      return error.response.data.error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  },

  getFieldErrors(error) {
    if (error?.response?.data?.fieldErrors) {
      return error.response.data.fieldErrors;
    }
    
    return {};
  },

  isNetworkError(error) {
    return !error.response || error.code === 'NETWORK_ERROR';
  },

  isAuthError(error) {
    return error?.response?.status === 401;
  },

  isForbiddenError(error) {
    return error?.response?.status === 403;
  }
};

/**
 * Date Utilities
 */
export const dateUtils = {
  formatDate(date, format = 'MMM DD, YYYY') {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    };
    
    if (format.includes('HH:mm')) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return d.toLocaleDateString('en-US', options);
  },

  formatRelativeTime(date) {
    if (!date) return '';
    
    const d = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now - d) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return this.formatDate(date);
  },

  isToday(date) {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  },

  isYesterday(date) {
    const d = new Date(date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.toDateString() === yesterday.toDateString();
  }
};

/**
 * String Utilities
 */
export const stringUtils = {
  truncate(str, length = 100) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  },

  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  camelCase(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  },

  slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  highlight(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
};

/**
 * Array Utilities
 */
export const arrayUtils = {
  chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  unique(array, key) {
    if (key) {
      const seen = new Set();
      return array.filter(item => {
        const keyValue = item[key];
        if (seen.has(keyValue)) {
          return false;
        }
        seen.add(keyValue);
        return true;
      });
    }
    return [...new Set(array)];
  },

  sortBy(array, key, direction = 'asc') {
    return [...array].sort((a, b) => {
      const aVal = key ? a[key] : a;
      const bVal = key ? b[key] : b;
      
      if (direction === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
  }
};

/**
 * Debounce Utility
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
