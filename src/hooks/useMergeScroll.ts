import { useEffect, useRef, useState } from "react";

export const useMergeScroll = () => {
  const ref = useRef<HTMLElement>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const element = ref.current;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;

      const mergeStart = windowHeight * 0.8;
      const mergeEnd = windowHeight;

      if (elementTop < mergeEnd && elementTop > mergeStart - elementHeight) {
        setIsMerging(true);
        const progress = 1 - (elementTop - (mergeStart - elementHeight)) / (mergeEnd - (mergeStart - elementHeight));
        setMergeProgress(Math.max(0, Math.min(1, progress)));
      } else {
        setIsMerging(false);
        setMergeProgress(0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { ref, isMerging, mergeProgress };
};
