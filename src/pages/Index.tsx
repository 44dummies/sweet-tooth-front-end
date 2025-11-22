// Desktop side panel navigation replaces standard navbar on home page
import SidePanelNav from "@/components/SidePanelNav";
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
import MobileBottomNav from "@/components/MobileBottomNav";

const Index = () => {
  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-20 md:pb-0" style={{ scrollBehavior: 'smooth' }}>
      <SidePanelNav />
      
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
      <ContactSection />
      <Footer />
      <FloatingChat />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
