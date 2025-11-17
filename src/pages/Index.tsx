import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import MenuSection from "@/components/MenuSection";
import PreOrderForm from "@/components/PreOrderForm";
import ReviewsSection from "@/components/ReviewSection";
import Footer from "@/components/Footer";
import FloatingChat from "@/components/FloatingChat";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSlider />
      <MenuSection />
      <PreOrderForm />
      <ReviewsSection />
      <Footer />
      <FloatingChat />
    </div>
  );
};

export default Index;
