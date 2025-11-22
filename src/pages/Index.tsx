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
    <>
      {/* Mobile Interface - Simple Top Nav + Bottom Nav */}
      <div className="md:hidden min-h-screen">
        <SidePanelNav />
        <div className="pt-16 pb-20">
          <HeroSlider />
          <FeatureSections />
          <ServiceCards />
          <StatsSection />
          <CustomOrderSection />
          <ReviewsSection />
          <ContactSection />
          <Footer />
        </div>
        <MobileBottomNav />
      </div>

      {/* Desktop Interface */}
      <div className="hidden md:block min-h-screen pt-20 pb-0" style={{ scrollBehavior: 'smooth' }}>
        <SidePanelNav />
        
        {/* Hero Slider for desktop */}
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
        <div className="hidden md:block">
          <FloatingChat />
        </div>
      </div>
    </>
  );
};

export default Index;
