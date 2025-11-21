import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import CustomOrderSection from "@/components/CustomOrderSection";

const CustomOrderPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="pt-20">
        <CustomOrderSection />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default CustomOrderPage;
