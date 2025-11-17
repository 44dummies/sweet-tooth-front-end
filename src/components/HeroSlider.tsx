import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const scrollToOrder = () => {
    const element = document.getElementById("order");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">

      {/* Top gradient to make navbar visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/60 z-10 pointer-events-none" />

      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 animate-fade-in">
          Welcome to Sweet Tooth
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-8 max-w-2xl animate-fade-in font-light">
          Indulge in premium home-baked delights, crafted with love and delivered fresh to your door
        </p>

        {/* Order Button (KEPT) */}
        <Button
          onClick={scrollToOrder}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-6 text-lg animate-scale-in shadow-luxury hover:scale-105 transition-transform"
        >
          Order Now
        </Button>
      </div>

      {/* Slide Indicators (KEPT) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
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
