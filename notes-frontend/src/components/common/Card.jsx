import { motion } from 'framer-motion';
import React from 'react';
import { cn } from '../../utils/ui';

const Card = React.forwardRef(({
  children,
  className,
  elevated = false,
  padding = 'md',
  hover = false,
  onClick,
  ...props
}, ref) => {
  const paddingVariants = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const cardClass = cn(
    elevated ? 'card-elevated' : 'card',
    paddingVariants[padding],
    {
      'cursor-pointer': onClick,
      'hover:shadow-lg dark:hover:shadow-gray-800/25': hover,
    },
    className
  );

  if (onClick) {
    return (
      <motion.div
        ref={ref}
        className={cardClass}
        onClick={onClick}
        whileHover={{ y: hover ? -2 : 0 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div ref={ref} className={cardClass} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card sub-components
const CardHeader = ({ children, className, ...props }) => (
  <div
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  >
    {children}
  </div>
);

const CardTitle = ({ children, className, ...props }) => (
  <h3
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  >
    {children}
  </h3>
);

const CardDescription = ({ children, className, ...props }) => (
  <p
    className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
    {...props}
  >
    {children}
  </p>
);

const CardContent = ({ children, className, ...props }) => (
  <div className={cn('pt-0', className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className, ...props }) => (
  <div
    className={cn('flex items-center pt-4', className)}
    {...props}
  >
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
