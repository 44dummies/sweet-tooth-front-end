import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReducedAnimations } from "@/hooks/use-mobile";
import heroCake1 from "@/assets/hero-cake-1.jpg";
import heroCake2 from "@/assets/hero-cake-2.jpg";
import heroCake3 from "@/assets/hero-cake-3.jpg";

const slides = [
  {
    image: heroCake1,
    story: "Born from a passion for creating sweet memories, Sweet Tooth Pastries began as a small family kitchen experiment that blossomed into a beloved local bakery.",
  },
  {
    image: heroCake2,
    story: "Using premium ingredients and time-honored techniques, we craft each cake with the same love and attention we'd give to our own family celebrations.",
  },
  {
    image: heroCake3,
    story: "From birthdays to weddings, we've been privileged to add sweetness to life's most precious moments for over 2 years and counting.",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const reduceAnimations = useReducedAnimations();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Simplified animations for mobile
  const bgAnimation = reduceAnimations 
    ? { initial: { opacity: 0 }, animate: { opacity: 0.3 }, exit: { opacity: 0 }, transition: { duration: 0.3 } }
    : { initial: { scale: 1.1, opacity: 0 }, animate: { scale: 1, opacity: 0.3 }, exit: { scale: 0.95, opacity: 0 }, transition: { duration: 1.2, ease: "easeInOut" } };

  const slideAnimation = reduceAnimations
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3 } }
    : { initial: { opacity: 0, x: 100 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -100 }, transition: { duration: 0.8, ease: "easeOut" } };

  return (
    <section className="relative h-[60vh] md:h-[calc(100vh-5rem)] w-full overflow-hidden bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-gray-900 dark:via-purple-950 dark:to-pink-950">
      {/* Background with parallax effect */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            {...bgAnimation}
            className="absolute inset-0"
          >
            <img
              src={slides[currentSlide].image}
              alt={`Slide ${currentSlide + 1}`}
              className={`w-full h-full object-cover ${reduceAnimations ? '' : 'blur-sm'}`}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4 md:px-8 lg:px-16">
        <div className="w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              {...slideAnimation}
              className="relative"
            >
              {/* Glass Card */}
              <div className="relative overflow-hidden rounded-3xl backdrop-blur-2xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image Side */}
                  <div className="relative h-64 md:h-auto">
                    <motion.img
                      src={slides[currentSlide].image}
                      alt={`Slide ${currentSlide + 1}`}
                      className="w-full h-full object-cover"
                      initial={reduceAnimations ? undefined : { scale: 1.2 }}
                      animate={reduceAnimations ? undefined : { scale: 1 }}
                      transition={reduceAnimations ? undefined : { duration: 1.5, ease: "easeOut" }}
                    />
                    {/* Gradient overlay on image */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 dark:to-black/40" />
                  </div>

                  {/* Story Side */}
                  <div className="relative p-6 md:p-12 lg:p-16 flex flex-col justify-center">
                    {/* Brand Badge */}
                    <motion.div
                      initial={reduceAnimations ? undefined : { opacity: 0, y: 20 }}
                      animate={reduceAnimations ? undefined : { opacity: 1, y: 0 }}
                      transition={reduceAnimations ? undefined : { delay: 0.3 }}
                      className="inline-flex items-center gap-2 mb-4 md:mb-6"
                    >
                      <div className="h-px w-8 md:w-12 bg-gradient-to-r from-pink-500 to-purple-500" />
                      <span className="text-xs md:text-sm font-semibold tracking-widest text-gray-700 dark:text-gray-300">
                        SWEET TOOTH PASTRIES
                      </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                      initial={reduceAnimations ? undefined : { opacity: 0, y: 20 }}
                      animate={reduceAnimations ? undefined : { opacity: 1, y: 0 }}
                      transition={reduceAnimations ? undefined : { delay: 0.4 }}
                      className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 leading-tight"
                    >
                      Our Story
                    </motion.h1>

                    {/* Story Text */}
                    <motion.p
                      initial={reduceAnimations ? undefined : { opacity: 0, y: 20 }}
                      animate={reduceAnimations ? undefined : { opacity: 1, y: 0 }}
                      transition={reduceAnimations ? undefined : { delay: 0.5 }}
                      className="text-sm md:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6 md:mb-8"
                    >
                      {slides[currentSlide].story}
                    </motion.p>

                    {/* CTA Button */}
                    <motion.div
                      initial={reduceAnimations ? undefined : { opacity: 0, y: 20 }}
                      animate={reduceAnimations ? undefined : { opacity: 1, y: 0 }}
                      transition={reduceAnimations ? undefined : { delay: 0.6 }}
                    >
                      <motion.button
                        onClick={() => navigate('/menu')}
                        className="group inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-full font-semibold text-base md:text-lg shadow-xl hover:shadow-2xl transition-all"
                        whileHover={reduceAnimations ? undefined : { scale: 1.05, y: -2 }}
                        whileTap={reduceAnimations ? undefined : { scale: 0.95 }}
                      >
                        <span>Explore Menu</span>
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </motion.button>
                    </motion.div>

                    {/* Slide Counter */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="mt-8 text-sm text-gray-600 dark:text-gray-400"
                    >
                      {currentSlide + 1} / {slides.length}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      <button
        onClick={prevSlide}
        className="hidden md:block absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-xl bg-white/20 dark:bg-black/20 border border-white/30 hover:bg-white/30 dark:hover:bg-black/30 transition-all hover:scale-110 active:scale-95"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
      </button>

      <button
        onClick={nextSlide}
        className="hidden md:block absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-xl bg-white/20 dark:bg-black/20 border border-white/30 hover:bg-white/30 dark:hover:bg-black/30 transition-all hover:scale-110 active:scale-95"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-gray-900 dark:text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? "w-8 h-2 bg-white"
                : "w-2 h-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-pink-400/30 rounded-full blur-sm" />
        <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/30 rounded-full blur-sm" />
        <div className="absolute bottom-32 left-40 w-2 h-2 bg-blue-400/30 rounded-full blur-sm" />
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-pink-400/30 rounded-full blur-sm" />
      </div>
    </section>
  );
};

export default HeroSlider;
