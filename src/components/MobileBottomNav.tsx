import { useNavigate, useLocation } from "react-router-dom";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { 
      path: "/", 
      label: "Home",
      CakeIcon: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
          <path d="M3 20h18v-8H3v8z" fill="currentColor" opacity="0.2"/>
          <rect x="3" y="12" width="18" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
          <path d="M3 12V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3" stroke="currentColor" strokeWidth="2"/>
          <circle cx="7" cy="5" r="1.5" fill="currentColor"/>
          <path d="M7 5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
          <path d="M12 4V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="17" cy="5" r="1.5" fill="currentColor"/>
          <path d="M17 5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      path: "/menu", 
      label: "Menu",
      CakeIcon: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
          <rect x="4" y="6" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.2"/>
          <rect x="13" y="6" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="4" y="15" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
          <rect x="13" y="15" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.2"/>
        </svg>
      )
    },
    { 
      path: "/custom-order", 
      label: "Order",
      CakeIcon: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
          <path d="M20 7H4l2 11h12l2-11z" fill="currentColor" opacity="0.2"/>
          <path d="M4 7l2 11h12l2-11H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 3v2M12 3v2M15 3v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 11h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      path: "/mobile-profile", 
      label: "Profile",
      CakeIcon: () => (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
          <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.2"/>
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
  ];

  const handleNavigation = (path: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/98 backdrop-blur-lg border-t border-border shadow-2xl z-50">
      <div className="flex items-center justify-around h-16 px-2 max-w-screen-sm mx-auto">
        {navItems.map(({ path, label, CakeIcon }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => handleNavigation(path)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-all duration-200 rounded-lg min-w-0 flex-1 ${
                active 
                  ? "text-primary scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
              }`}
            >
              <div className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                <CakeIcon />
              </div>
              <span className={`text-[10px] font-medium transition-all duration-200 whitespace-nowrap ${
                active ? "opacity-100 font-semibold" : "opacity-70"
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
