import { useEffect, useRef, useState } from "react";

export const useScrollFade = () => {
  const ref = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const element = ref.current;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;

      const scrolled = 1 - (elementTop + elementHeight) / (windowHeight + elementHeight);
      const clampedScroll = Math.max(0, Math.min(1, scrolled));

      setScrollProgress(clampedScroll);

      const currentScrollY = window.scrollY;
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { ref, scrollProgress };
};
