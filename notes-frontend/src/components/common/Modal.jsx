import { XMarkIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { createPortal } from 'react-dom';
import { useKeyboardShortcut, useOnClickOutside } from '../../hooks';
import { cn } from '../../utils/ui';

const Modal = ({
  children,
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  closable = true,
  className,
  overlayClassName,
  ...props
}) => {
  const modalRef = React.useRef(null);

  const sizeVariants = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full mx-4',
  };

  // Close on outside click
  useOnClickOutside(modalRef, () => {
    if (closable) onClose();
  });

  // Close on Escape key
  useKeyboardShortcut('escape', () => {
    if (closable && isOpen) onClose();
  });

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className={cn(
            'fixed inset-0 bg-black/50 backdrop-blur-sm',
            overlayClassName
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />

        {/* Modal */}
        <motion.div
          ref={modalRef}
          className={cn(
            'relative w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800',
            sizeVariants[size],
            className
          )}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          {...props}
        >
          {/* Header */}
          {(title || closable) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div>
                {title && (
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                )}
              </div>
              {closable && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

// Modal sub-components
const ModalHeader = ({ children, className, ...props }) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  >
    {children}
  </div>
);

const ModalTitle = ({ children, className, ...props }) => (
  <h2
    className={cn('text-lg font-semibold text-gray-900 dark:text-gray-100', className)}
    {...props}
  >
    {children}
  </h2>
);

const ModalDescription = ({ children, className, ...props }) => (
  <p
    className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
    {...props}
  >
    {children}
  </p>
);

const ModalContent = ({ children, className, ...props }) => (
  <div className={cn('py-4', className)} {...props}>
    {children}
  </div>
);

const ModalFooter = ({ children, className, ...props }) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-gray-200 dark:border-gray-800', className)}
    {...props}
  >
    {children}
  </div>
);

Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Description = ModalDescription;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export default Modal;
