import { useState, useEffect } from "react";
import heroCake1 from "@/assets/hero-cake-1.jpg";
import heroCake2 from "@/assets/hero-cake-2.jpg";
import heroCake3 from "@/assets/hero-cake-3.jpg";

const slides = [
  { image: heroCake1, alt: "Elegant pink birthday cake" },
  { image: heroCake2, alt: "Delicious chocolate layer cake" },
  { image: heroCake3, alt: "Beautiful pastel cupcakes" },
];

const BackgroundSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: index === currentSlide ? "scale(1)" : "scale(1.1)",
          }}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>
      ))}
    </div>
  );
};

export default BackgroundSlider;
