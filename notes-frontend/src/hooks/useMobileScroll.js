import { useEffect } from 'react';

/**
 * Hook to handle mobile scroll behavior when modals/menus are open
 * Prevents body scroll and handles touch events properly on mobile
 */
export function useMobileScroll(isOpen) {
  useEffect(() => {
    if (!isOpen) return;

    // Store the current scroll position
    const scrollY = window.scrollY;
    
    // Prevent scrolling on body - safer approach
    const originalStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    
    // Apply mobile-safe scroll prevention
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Restore original styles
      Object.assign(document.body.style, originalStyle);
      
      // Restore scroll position only if we stored it
      if (typeof scrollY === 'number') {
        window.scrollTo(0, scrollY);
      }
    };
  }, [isOpen]);
}

/**
 * Hook to enhance touch interactions on mobile
 */
export function useMobileTouchHandlers() {
  useEffect(() => {
    // Add touch-action CSS to prevent unwanted touch behaviors
    const originalTouchAction = document.documentElement.style.touchAction;
    document.documentElement.style.touchAction = 'manipulation';
    
    return () => {
      document.documentElement.style.touchAction = originalTouchAction;
    };
  }, []);
}

/**
 * Hook to detect touch device
 */
export function useIsTouch() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
