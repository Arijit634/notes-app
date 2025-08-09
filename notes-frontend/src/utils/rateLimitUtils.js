// Rate limiting utilities for frontend
export const rateLimitUtils = {
  // Track request counts per endpoint
  requestCounts: new Map(),
  
  // Rate limit thresholds (per minute)
  limits: {
    '/api/activities/recent': 30,
    '/api/notes/favorites': 30,
    '/api/notes/search': 60,
    '/api/notes': 100,
    '/api/notes/stats': 30,
    '/api/auth/login': 10,
    '/api/auth/register': 5,
    '/api/auth/refresh': 20
  },

  // Check if request should be throttled on client side
  shouldThrottle(endpoint) {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    const key = this.getEndpointKey(endpoint);
    
    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, []);
    }
    
    const requests = this.requestCounts.get(key);
    
    // Remove old requests outside the window
    const recentRequests = requests.filter(time => time > windowStart);
    this.requestCounts.set(key, recentRequests);
    
    const limit = this.limits[key] || 60; // Default limit
    
    if (recentRequests.length >= limit) {
      console.warn(`Rate limit reached for ${endpoint}. Throttling request.`);
      return true;
    }
    
    return false;
  },

  // Record a request
  recordRequest(endpoint) {
    const key = this.getEndpointKey(endpoint);
    const now = Date.now();
    
    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, []);
    }
    
    const requests = this.requestCounts.get(key);
    requests.push(now);
    
    // Keep only last 100 requests to prevent memory issues
    if (requests.length > 100) {
      requests.splice(0, requests.length - 100);
    }
  },

  // Get normalized endpoint key
  getEndpointKey(url) {
    // Extract path from full URL if needed
    const path = url.includes('http') ? new URL(url).pathname : url;
    
    // Normalize endpoint patterns
    if (path.startsWith('/api/notes/')) {
      if (path.match(/\/api\/notes\/\d+/)) {
        return '/api/notes/{id}';
      } else if (path.includes('/favorites')) {
        return '/api/notes/favorites';
      } else if (path.includes('/stats')) {
        return '/api/notes/stats';
      } else if (path.includes('/search')) {
        return '/api/notes/search';
      }
      return '/api/notes';
    } else if (path.startsWith('/api/activities/')) {
      if (path.includes('/recent')) {
        return '/api/activities/recent';
      }
      return '/api/activities';
    } else if (path.startsWith('/api/auth/')) {
      if (path.includes('/login')) {
        return '/api/auth/login';
      } else if (path.includes('/register')) {
        return '/api/auth/register';
      } else if (path.includes('/refresh')) {
        return '/api/auth/refresh';
      }
      return '/api/auth';
    }
    
    return path;
  },

  // Get remaining requests for an endpoint
  getRemainingRequests(endpoint) {
    const key = this.getEndpointKey(endpoint);
    const now = Date.now();
    const windowStart = now - 60000;
    
    if (!this.requestCounts.has(key)) {
      return this.limits[key] || 60;
    }
    
    const requests = this.requestCounts.get(key);
    const recentRequests = requests.filter(time => time > windowStart);
    const limit = this.limits[key] || 60;
    
    return Math.max(0, limit - recentRequests.length);
  },

  // Clear all request counts (for testing or reset)
  clear() {
    this.requestCounts.clear();
  }
};

// Request debouncing utility
export const debounceUtils = {
  timers: new Map(),
  
  // Debounce function calls
  debounce(key, func, delay = 300) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    const timer = setTimeout(() => {
      func();
      this.timers.delete(key);
    }, delay);
    
    this.timers.set(key, timer);
  },

  // Cancel pending debounced calls
  cancel(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  },

  // Clear all timers
  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }
};

// Request caching utility to reduce API calls
export const cacheUtils = {
  cache: new Map(),
  
  // Cache settings
  settings: {
    '/api/notes/stats': 30000, // 30 seconds
    '/api/activities/recent': 60000, // 1 minute
    '/api/notes/favorites': 30000, // 30 seconds
    '/api/notes': 10000, // 10 seconds for notes list
  },

  // Get cached data if valid
  get(key, maxAge) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    const maxAgeMs = maxAge || this.settings[this.getEndpointKey(key)] || 5000;
    
    if (age > maxAgeMs) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  },

  // Set cached data
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Prevent memory leaks - keep only last 50 entries
    if (this.cache.size > 50) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  },

  // Get normalized endpoint key for caching
  getEndpointKey(url) {
    return rateLimitUtils.getEndpointKey(url);
  },

  // Clear cache
  clear() {
    this.cache.clear();
  },

  // Clear expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      const endpointKey = this.getEndpointKey(key);
      const maxAge = this.settings[endpointKey] || 5000;
      if (now - cached.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }
};

// Auto cleanup cache every 5 minutes
setInterval(() => {
  cacheUtils.cleanup();
}, 5 * 60 * 1000);
