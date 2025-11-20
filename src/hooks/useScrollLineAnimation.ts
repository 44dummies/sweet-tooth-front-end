import { useEffect, useRef } from "react";

export const useScrollLineAnimation = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;

    const path = pathRef.current;
    const length = path.getTotalLength();

    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = String(length);

    const handleScroll = () => {
      if (!pathRef.current) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollTop / docHeight;

      const offset = length - scrollProgress * length;
      pathRef.current.style.strokeDashoffset = String(offset);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { svgRef, pathRef };
};

export const useCustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }

      const target = e.target as HTMLElement;
      const isHovering =
        target?.classList.contains("interactive-hover") ||
        target?.closest(".interactive-hover");

      if (labelRef.current) {
        if (isHovering) {
          labelRef.current.style.opacity = "1";
          labelRef.current.style.pointerEvents = "auto";
        } else {
          labelRef.current.style.opacity = "0";
          labelRef.current.style.pointerEvents = "none";
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return { cursorRef, labelRef };
};
