import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const AdminBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (tab: string) => {
    const hash = location.hash.replace('#', '') || 'summary';
    return hash === tab;
  };

  const navItems = [
    { 
      tab: "summary", 
      label: "Summary",
      Icon: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.2"/>
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.2"/>
          <path d="M6 6h2M6 17h2M17 6h2M17 17h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      tab: "orders", 
      label: "Orders",
      Icon: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path d="M20 7H4l2 11h12l2-11z" fill="currentColor" opacity="0.2"/>
          <path d="M4 7l2 11h12l2-11H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 3v2M12 3v2M15 3v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="9" cy="13" r="1" fill="currentColor"/>
          <circle cx="15" cy="13" r="1" fill="currentColor"/>
        </svg>
      )
    },
    { 
      tab: "messages", 
      label: "Messages",
      Icon: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path d="M4 6h16v10H8l-4 3V6z" fill="currentColor" opacity="0.2"/>
          <path d="M20 6H4v13l4-3h12V6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M8 10h8M8 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      tab: "inventory", 
      label: "Inventory",
      Icon: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <rect x="3" y="8" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.2"/>
          <path d="M3 12h18" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
        </svg>
      )
    },
    { 
      tab: "reviews", 
      label: "Reviews",
      Icon: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      )
    },
  ];

  const handleNavigation = (tab: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.hash = tab;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border shadow-lg z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ tab, label, Icon }) => {
          const active = isActive(tab);
          return (
            <button
              key={tab}
              onClick={() => handleNavigation(tab)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 rounded-xl ${
                active 
                  ? "text-primary scale-110" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <div className={`transition-transform duration-300 ${active ? "animate-bounce-subtle" : ""}`}>
                <Icon />
              </div>
              <span className={`text-[10px] mt-1 font-medium transition-all duration-300 ${
                active ? "opacity-100" : "opacity-70"
              }`}>
                {label}
              </span>
            </button>
          );
        })}
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
