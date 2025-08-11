import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with clsx and tailwind-merge for optimal class handling
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Generate a random color for categories/tags
 */
export function generateColor() {
  const colors = [
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Get category color based on category name
 */
export function getCategoryColor(category) {
  const colors = {
    Personal: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    Work: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    Study: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    Project: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    Meeting: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    Idea: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    Todo: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300',
    Reference: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    Draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    Archive: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  };
  
  return colors[category] || colors.Reference;
}

/**
 * Sleep function for delays
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (err) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Read text from clipboard with proper error handling
 */
export async function readFromClipboard() {
  try {
    // Check if clipboard API is available and we're in secure context
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      throw new Error('Clipboard API not available');
    }
    
    // Check if we're in a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      throw new Error('Clipboard API requires secure context (HTTPS)');
    }
    
    const text = await navigator.clipboard.readText();
    return { success: true, text };
  } catch (err) {
    console.warn('Clipboard read failed:', err.message);
    
    // For deployed apps without HTTPS, show instructions
    if (err.message.includes('secure context') || err.name === 'NotAllowedError') {
      return { 
        success: false, 
        error: 'Paste requires HTTPS. Please use Ctrl+V or right-click paste instead.',
        fallback: true
      };
    }
    
    return { 
      success: false, 
      error: 'Clipboard access denied. Please use Ctrl+V or right-click paste.',
      fallback: true
    };
  }
}

/**
 * Check if device is mobile
 */
export function isMobile() {
  return window.innerWidth < 768;
}

/**
 * Check if device is tablet
 */
export function isTablet() {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

/**
 * Check if device is desktop
 */
export function isDesktop() {
  return window.innerWidth >= 1024;
}

/**
 * Get responsive breakpoint
 */
export function getBreakpoint() {
  const width = window.innerWidth;
  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  if (width < 1536) return 'xl';
  return '2xl';
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Format number with thousand separators
 */
export function formatNumber(number) {
  return new Intl.NumberFormat().format(number);
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}

/**
 * Generate avatar background color based on name
 */
export function getAvatarColor(name) {
  if (!name) return 'bg-gray-500';
  
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];
  
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const score = [
    password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  ].filter(Boolean).length;
  
  if (score < 3) return { strength: 'weak', score };
  if (score < 4) return { strength: 'medium', score };
  return { strength: 'strong', score };
}

/**
 * Generate a random ID
 */
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${randomStr}`;
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to title case
 */
export function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

/**
 * Remove HTML tags from string
 */
export function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Escape HTML characters
 */
export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Create a debounced function
 */
export function createDebounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create a throttled function
 */
export function createThrottle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Format date to readable format
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return formatDate(date);
}
