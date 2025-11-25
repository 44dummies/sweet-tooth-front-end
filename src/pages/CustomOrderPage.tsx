import ModernNavbar from "@/components/ModernNavbar";
import CustomOrderSection from "@/components/CustomOrderSection";

const CustomOrderPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 overflow-x-hidden relative" style={{ scrollBehavior: 'smooth' }}>
      <ModernNavbar />
      <div className="pt-4 md:pt-8">
        <CustomOrderSection />
      </div>
    </div>
  );
};

export default CustomOrderPage;
