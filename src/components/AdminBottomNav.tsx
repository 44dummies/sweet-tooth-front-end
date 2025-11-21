import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, MessageSquare, Package, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AdminBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.hash === path || (!location.hash && path === "#overview");

  const navItems = [
    { 
      hash: "#overview", 
      label: "Dashboard",
      icon: LayoutDashboard
    },
    { 
      hash: "#orders", 
      label: "Orders",
      icon: ShoppingBag
    },
    { 
      hash: "#messages", 
      label: "Messages",
      icon: MessageSquare
    },
    { 
      hash: "#inventory", 
      label: "Inventory",
      icon: Package
    },
  ];

  const handleNavigation = (hash: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.hash = hash;
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border shadow-lg z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ hash, label, icon: Icon }) => {
          const active = isActive(hash);
          return (
            <button
              key={hash}
              onClick={() => handleNavigation(hash)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 rounded-xl ${
                active 
                  ? "text-primary scale-110" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Icon className={`w-6 h-6 ${active ? "animate-bounce-subtle" : ""}`} />
              <span className={`text-[10px] mt-1 font-medium transition-all duration-300 ${
                active ? "opacity-100" : "opacity-70"
              }`}>
                {label}
              </span>
            </button>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 h-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300 rounded-xl"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-medium opacity-70">Logout</span>
        </button>
      </div>
      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminBottomNav;
