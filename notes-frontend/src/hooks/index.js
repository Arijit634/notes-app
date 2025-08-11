import { useEffect, useState } from 'react';

/**
 * Hook to detect and track window breakpoints
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState(() => {
    if (typeof window === 'undefined') return 'lg';
    
    const width = window.innerWidth;
    if (width < 640) return 'xs';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1280) return 'lg';
    if (width < 1536) return 'xl';
    return '2xl';
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newBreakpoint;
      
      if (width < 640) newBreakpoint = 'xs';
      else if (width < 768) newBreakpoint = 'sm';
      else if (width < 1024) newBreakpoint = 'md';
      else if (width < 1280) newBreakpoint = 'lg';
      else if (width < 1536) newBreakpoint = 'xl';
      else newBreakpoint = '2xl';
      
      setBreakpoint(newBreakpoint);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial value

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
  };
}

/**
 * Hook to detect mobile device
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
}

/**
 * Hook to handle window scroll position
 */
export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener('scroll', updatePosition);
    updatePosition();

    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  return scrollPosition;
}

/**
 * Hook to detect if element is in viewport
 */
export function useIntersectionObserver(elementRef, options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef?.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, options]);

  return isIntersecting;
}

/**
 * Hook to handle outside clicks
 */
export function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

/**
 * Hook to handle keyboard shortcuts
 */
export function useKeyboardShortcut(keys, callback, options = {}) {
  const { target = document, preventDefault = true } = options;

  useEffect(() => {
    const handleKeyDown = (event) => {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      const modifierKeys = ['ctrlKey', 'altKey', 'shiftKey', 'metaKey'];
      
      const keyMatch = keysArray.some(keyCombo => {
        const parts = keyCombo.toLowerCase().split('+');
        const key = parts[parts.length - 1];
        const modifiers = parts.slice(0, -1);
        
        const keyMatches = event.key.toLowerCase() === key || event.code.toLowerCase() === key;
        const modifiersMatch = modifierKeys.every(modifier => {
          const modifierName = modifier.replace('Key', '').toLowerCase();
          return modifiers.includes(modifierName) === event[modifier];
        });
        
        return keyMatches && modifiersMatch;
      });
      
      if (keyMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback(event);
      }
    };

    target.addEventListener('keydown', handleKeyDown);

    return () => {
      target.removeEventListener('keydown', handleKeyDown);
    };
  }, [keys, callback, target, preventDefault]);
}

/**
 * Hook to copy text to clipboard
 */
export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch (err) {
      setIsCopied(false);
      return false;
    }
  };

  return { isCopied, copyToClipboard };
}

/**
 * Hook to read from clipboard with proper error handling
 */
export function useClipboard() {
  const [clipboardText, setClipboardText] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState(null);

  const readFromClipboard = async () => {
    setIsReading(true);
    setError(null);
    
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
      setClipboardText(text);
      setIsReading(false);
      return { success: true, text };
    } catch (err) {
      console.warn('Clipboard read failed:', err.message);
      setIsReading(false);
      
      // For deployed apps without HTTPS, provide helpful error
      if (err.message.includes('secure context') || err.name === 'NotAllowedError') {
        const errorMsg = 'Paste requires HTTPS. Please use Ctrl+V or right-click paste instead.';
        setError(errorMsg);
        return { success: false, error: errorMsg, fallback: true };
      }
      
      const errorMsg = 'Clipboard access denied. Please use Ctrl+V or right-click paste.';
      setError(errorMsg);
      return { success: false, error: errorMsg, fallback: true };
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (err) {
      // Fallback for older browsers or HTTP contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        return { success: true };
      } catch (err) {
        return { success: false, error: 'Copy failed' };
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  return { 
    clipboardText, 
    isReading, 
    error, 
    readFromClipboard, 
    copyToClipboard 
  };
}

/**
 * Hook to handle async operations with loading states
 */
export function useAsync(asyncFunction, dependencies = []) {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    setStatus('pending');
    setValue(null);
    setError(null);

    try {
      const response = await asyncFunction(...args);
      setValue(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error);
      setStatus('error');
      throw error;
    }
  };

  useEffect(() => {
    if (dependencies.length > 0) {
      execute();
    }
  }, dependencies);

  return {
    execute,
    status,
    value,
    error,
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}

/**
 * Hook to handle form validation
 */
export function useFormValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return '';
  };

  const setFieldValue = (fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const setFieldError = (fieldName, error) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validate(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (onSubmit) => {
    setIsSubmitting(true);
    
    const isValid = validateForm();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    isSubmitting,
    setFieldValue,
    setFieldError,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
}

/**
 * Hook to handle local storage with state sync
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}

/**
 * Hook to handle session storage with state sync
 */
export function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}
