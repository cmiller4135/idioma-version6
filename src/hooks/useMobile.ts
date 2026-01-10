import { useState, useEffect } from 'react';

interface UseMobileReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  windowWidth: number;
}

/**
 * Hook for detecting device type and screen size
 * Breakpoints: mobile (<640px), tablet (640-1024px), desktop (>1024px)
 */
export const useMobile = (): UseMobileReturn => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check for touch device
    setIsTouchDevice(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    );

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowWidth < 640,
    isTablet: windowWidth >= 640 && windowWidth < 1024,
    isDesktop: windowWidth >= 1024,
    isTouchDevice,
    windowWidth
  };
};

export default useMobile;
