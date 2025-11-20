import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollFade } from "@/hooks/useScrollFade";
import heroCake1 from "@/assets/hero-cake-1.jpg";
import heroCake2 from "@/assets/hero-cake-2.jpg";
import heroCake3 from "@/assets/hero-cake-3.jpg";

const slides = [
  { image: heroCake1, alt: "Elegant pink birthday cake" },
  { image: heroCake2, alt: "Delicious chocolate layer cake" },
  { image: heroCake3, alt: "Beautiful pastel cupcakes" },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { ref, scrollProgress } = useScrollFade();
  const startX = useRef<number | null>(null);
  const isPointerDown = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    isPointerDown.current = true;
    startX.current = e.clientX;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isPointerDown.current || startX.current === null) return;
    isPointerDown.current = false;
    const endX = e.clientX;
    const diff = startX.current - endX;
    startX.current = null;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
  };

  const onPointerCancel = (e: React.PointerEvent) => {
    isPointerDown.current = false;
    startX.current = null;
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
  };

  const scrollToMenu = () => {
    const element = document.getElementById("menu");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative h-screen w-full overflow-hidden"
      ref={ref as any}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={onPointerCancel}
    >
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide
              ? "opacity-100"
              : "opacity-0"
          }`}
          style={{
            transform: index === currentSlide ? 'scale(1)' : 'scale(1.1)',
          }}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <h1 
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 animate-fade-in"
          style={{
            opacity: 1 - scrollProgress * 0.5,
            transform: `translateY(${scrollProgress * 20}px)`,
          }}
        >
          Welcome to Sweet Tooth
        </h1>
        <p 
          className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-8 max-w-2xl animate-fade-in font-light"
          style={{
            opacity: 1 - scrollProgress * 0.5,
            transform: `translateY(${scrollProgress * 20}px)`,
          }}
        >
          Indulge in premium home-baked delights, crafted with love and delivered fresh to your door
        </p>
        <div className="hidden sm:flex flex-col sm:flex-row gap-4 animate-scale-in">
          <Button
            onClick={scrollToMenu}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-6 text-lg shadow-luxury hover:scale-105 transition-transform"
          >
            Menu
          </Button>
        </div>
      </div>

      

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
