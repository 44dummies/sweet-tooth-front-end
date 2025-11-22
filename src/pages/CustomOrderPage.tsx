import SidePanelNav from "@/components/SidePanelNav";
import MobileBottomNav from "@/components/MobileBottomNav";
import CustomOrderSection from "@/components/CustomOrderSection";

const CustomOrderPage = () => {
  return (
    <div className="min-h-screen bg-background pt-16 md:pt-20 pb-20 md:pb-0 overflow-x-hidden relative" style={{ scrollBehavior: 'smooth' }}>
      <SidePanelNav />
      <div className="pt-4 md:pt-8">
        <CustomOrderSection />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default CustomOrderPage;
