import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import MenuSection from "@/components/MenuSection";
import CustomOrderSection from "@/components/CustomOrderSection";
import ReviewsSection from "@/components/ReviewSection";
import Footer from "@/components/Footer";
import FloatingChat from "@/components/FloatingChat";
import MobileBottomNav from "@/components/MobileBottomNav";

const Index = () => {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />
      <HeroSlider />
      <MenuSection />
      <CustomOrderSection />
      <ReviewsSection />
      <Footer />
      <FloatingChat />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
