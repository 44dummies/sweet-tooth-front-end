// Unified responsive layout with ModernNavbar
import { motion, useScroll, useSpring } from "framer-motion";
import ModernNavbar from "@/components/ModernNavbar";
import HeroSlider from "@/components/HeroSlider";
import FeatureSections from "@/components/FeatureSections";
import ServiceCards from "@/components/ServiceCards";
import StatsSection from "@/components/StatsSection";
import MenuSection from "@/components/MenuSection";
import CustomOrderSection from "@/components/CustomOrderSection";
import ReviewsSection from "@/components/ReviewSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import FloatingChat from "@/components/FloatingChat";

const Index = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* Unified Responsive Layout */}
      <motion.div 
        className="min-h-screen relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ModernNavbar />
        
        {/* Hero Slider */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <HeroSlider />
        </motion.div>
        
        {/* Feature sections */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <FeatureSections />
        </motion.div>
        
        {/* Service cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <ServiceCards />
        </motion.div>
        
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <StatsSection />
        </motion.div>
        
        {/* Custom Order */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <CustomOrderSection />
        </motion.div>
        
        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <ReviewsSection />
        </motion.div>
        
        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <ContactSection />
        </motion.div>
        
        <Footer />
        <FloatingChat />
      </motion.div>
    </>
  );
};

export default Index;
