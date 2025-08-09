import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { cn } from '../../utils/ui';

const Input = React.forwardRef(({
  className,
  type = 'text',
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  disabled = false,
  loading = false,
  placeholder,
  required = false,
  ...props
}, ref) => {
  const inputId = React.useId();
  
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium text-gray-700 dark:text-gray-300',
            {
              'text-error-600 dark:text-error-400': error,
            }
          )}
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 dark:text-gray-500">
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'input',
            {
              'input-error': error,
              'pl-10': leftIcon,
              'pr-10': rightIcon || loading,
              'opacity-50 cursor-not-allowed': disabled,
            },
            className
          )}
          disabled={disabled}
          placeholder={placeholder}
          {...props}
        />
        
        {(rightIcon || loading) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {loading ? (
              <svg
                className="animate-spin h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">
                {rightIcon}
              </span>
            )}
          </div>
        )}
      </div>
      
      <AnimatePresence mode="wait">
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {error ? (
              <p className="text-sm text-error-600 dark:text-error-400">
                {error}
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
