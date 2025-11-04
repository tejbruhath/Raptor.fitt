'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the device supports hover interactions
 * Uses media queries to check for hover capability (mouse/trackpad)
 * Returns false for touch-only devices to optimize performance
 */
export function useHoverCapability(): boolean {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === 'undefined') return;

    // Check for hover capability using media query
    // This detects devices with a mouse/trackpad (hover: hover)
    // and fine pointer control (pointer: fine)
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    
    // Set initial state
    setCanHover(hoverQuery.matches);

    // Listen for changes (e.g., connecting/disconnecting mouse on tablet)
    const handleChange = (e: MediaQueryListEvent) => {
      setCanHover(e.matches);
    };

    hoverQuery.addEventListener('change', handleChange);

    return () => {
      hoverQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return canHover;
}

/**
 * Utility to conditionally apply hover classes
 * Usage: cn(baseClasses, hoverClass('hover:scale-105'))
 */
export function hoverClass(hoverClassName: string): string {
  if (typeof window === 'undefined') return '';
  
  const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  return hasHover ? hoverClassName : '';
}
