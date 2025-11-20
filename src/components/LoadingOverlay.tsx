import logo from "@/assets/logo.png";

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <img src={logo} alt="Sweet Tooth" className="w-28 h-28 animate-heartbeat" />
        <p className="text-foreground/80">Loading Sweet Tooth...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
