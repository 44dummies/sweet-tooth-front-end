import HeroSlider from "@/components/HeroSlider";
import FeatureSections from "@/components/FeatureSections";
import ServiceCards from "@/components/ServiceCards";
import StatsSection from "@/components/StatsSection";
import CustomOrderSection from "@/components/CustomOrderSection";
import ReviewsSection from "@/components/ReviewSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const MobileHome = () => {
  return (
    <main className="flex flex-col gap-12">
      <HeroSlider />
      <FeatureSections />
      <ServiceCards />
      <StatsSection />
      <CustomOrderSection />
      <ReviewsSection />
      <ContactSection />
      <Footer />
    </main>
  );
};

export default MobileHome;
