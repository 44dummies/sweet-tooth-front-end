import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import FeatureSections from "@/components/FeatureSections";
import ServiceCards from "@/components/ServiceCards";
import StatsSection from "@/components/StatsSection";
import MenuSection from "@/components/MenuSection";
import CustomOrderSection from "@/components/CustomOrderSection";
import ReviewsSection from "@/components/ReviewSection";
import Footer from "@/components/Footer";
import FloatingChat from "@/components/FloatingChat";
import MobileBottomNav from "@/components/MobileBottomNav";

const Index = () => {
  return (
    <div className="min-h-screen pb-20 md:pb-0" style={{ scrollBehavior: 'smooth' }}>
      <Navbar />
      
      {/* Hero Slider for all devices */}
      <HeroSlider />
      
      {/* Feature sections with scroll animations */}
      <FeatureSections />
      
      {/* Service cards grid */}
      <ServiceCards />
      
      {/* Stats section */}
      <StatsSection />
      
      <CustomOrderSection />
      <ReviewsSection />
      <Footer />
      <FloatingChat />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
