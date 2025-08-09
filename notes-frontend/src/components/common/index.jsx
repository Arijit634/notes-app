import { motion } from 'framer-motion';
import React from 'react';
import { cn } from '../../utils/ui';
import Card from './Card';

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) => {
  const variantClasses = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    gray: 'badge-gray',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'badge',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  className,
  fallbackClassName,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const getAvatarColor = (name) => {
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
  };

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
        onError={() => setImageError(true)}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full text-white font-medium',
        sizeClasses[size],
        getAvatarColor(name),
        fallbackClassName,
        className
      )}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
};

const Skeleton = ({ className, ...props }) => (
  <div
    className={cn('skeleton', className)}
    {...props}
  />
);

const Spinner = ({ size = 'md', className, ...props }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  return (
    <svg
      className={cn('animate-spin', sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
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
  );
};

const Divider = ({ className, orientation = 'horizontal', ...props }) => {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn('w-px bg-gray-200 dark:bg-gray-800', className)}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn('h-px bg-gray-200 dark:bg-gray-800', className)}
      {...props}
    />
  );
};

const LoadingDots = ({ className, ...props }) => (
  <div className={cn('flex items-center space-x-1', className)} {...props}>
    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
    <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
    <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
  </div>
);

const Tooltip = ({ 
  children, 
  content, 
  placement = 'top',
  className,
  ...props 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const placementClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      {...props}
    >
      {children}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            'absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-800 rounded shadow-lg whitespace-nowrap',
            placementClasses[placement],
            className
          )}
        >
          {content}
        </motion.div>
      )}
    </div>
  );
};

export {
  Avatar, Badge, Card, Divider,
  LoadingDots, Skeleton,
  Spinner, Tooltip
};

