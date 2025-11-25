import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Set initial value
    setIsMobile(mql.matches);
    
    // Listen for changes
    mql.addEventListener("change", onChange);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

// Hook to detect if device prefers reduced motion
export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const onChange = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches);
    };

    setPrefersReduced(mql.matches);
    mql.addEventListener("change", onChange);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return prefersReduced;
}

// Combined hook for determining if animations should be reduced
export function useReducedAnimations() {
  const isMobile = useIsMobile();
  const prefersReduced = usePrefersReducedMotion();
  
  return isMobile || prefersReduced;
}
