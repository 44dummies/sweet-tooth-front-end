import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, User, LogOut, X, Mail } from "lucide-react";
import CustomOrderModal from "@/components/CustomOrderModal";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFloatingChat } from "@/contexts/FloatingChatContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CartDrawer from "@/components/CartDrawer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isCustomOrderOpen, setIsCustomOrderOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { openChat } = useFloatingChat();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isAdminRoute) {
      fetchNotificationCount();

      const channel = supabase
        .channel('navbar-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications'
          },
          (payload) => {
            setUnreadCount(prev => prev + 1);
            if (payload.new.status === 'SENT') {
              toast.success(`Order notification sent`);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdminRoute]);

  const fetchNotificationCount = async () => {
    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'SENT')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNavClick = (id: string, isRoute: boolean) => {
    if (isRoute) {
      navigate(`/${id}`);
    } else {
      if (window.location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const goToCheckout = () => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    navigate("/checkout");
  };

  const navLinks = [
    { name: "Menu", id: "menu", isRoute: true },
    { name: "Gallery", id: "gallery", isRoute: true },
    { name: "Gift Cards", id: "gift-cards", isRoute: true },
  ];

  const moreLinks = [
    { name: "Wishlist", id: "wishlist", isRoute: true },
    { name: "Contact", id: "contact" },
    { name: "FAQs", id: "faq" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl shadow-2xl border-b border-border/50"
          : "bg-background/60 backdrop-blur-lg shadow-lg"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {}
          <button
            onClick={() => handleNavClick("hero", false)}
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group"
          >
            <div className="relative">
              <img
                src={logo}
                alt="Sweet Tooth Pastries"
                className="h-12 md:h-14 brightness-125 contrast-125 dark:brightness-100 dark:contrast-100 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
              />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
            <span className="font-dancing text-2xl md:text-3xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
              Sweet Tooth
            </span>
          </button>

          {}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id, link.isRoute)}
                className="relative text-foreground hover:text-primary transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-primary/10 group"
              >
                <span className="relative z-10">{link.name}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            ))}

            {}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === "more" ? null : "more")}
                className="flex items-center gap-1 text-foreground hover:text-primary transition-all duration-300 font-medium px-3 py-2 rounded-lg hover:bg-primary/10 group"
              >
                <span>More</span>
                <ChevronDown
                  size={18}
                  className={`transition-all duration-300 ${
                    openDropdown === "more" ? "rotate-180" : ""
                  } group-hover:translate-y-0.5`}
                />
              </button>

              {openDropdown === "more" && (
                <div className="absolute right-0 mt-2 w-56 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl py-2 z-50 animate-scale-in overflow-hidden">
                  {moreLinks.map((link, index) => (
                    <button
                      key={link.id}
                      onClick={() => {
                        if (link.id === "contact") {
                          openChat();
                        } else if (link.isRoute) {
                          navigate(`/${link.id}`);
                        } else {
                          handleNavClick(link.id, false);
                        }
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-4 py-3 text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:pl-6 relative overflow-hidden group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="relative z-10">{link.name}</span>
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary transform scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-border/50" />

            <CartDrawer />

            {}
            {!isAdminRoute && (
              <button
                onClick={() => setOpenDropdown(openDropdown === "notifications" ? null : "notifications")}
                className="relative p-2.5 hover:bg-secondary/50 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 group"
              >
                <Bell className="w-5 h-5 group-hover:animate-wiggle" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold shadow-lg animate-pulse px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                <span className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 -z-10" />
              </button>
            )}

            <ThemeToggle />

            {}
            {!isAdminRoute && (
              <>
                {user ? (
                  profile ? (
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === "profile" ? null : "profile")}
                      className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-secondary/50 transition-all duration-300 group"
                    >
                      {(profile.avatar_url || profile.avatar) ? (
                        <img
                          src={profile.avatar_url || profile.avatar}
                          alt={`${profile.username}'s avatar`}
                          className="h-8 w-8 rounded-full border-2 border-primary/20 group-hover:border-primary transition-colors"
                        />
                      ) : (
                        <Avatar className="h-8 w-8 border-2 border-primary/20 group-hover:border-primary transition-colors">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {profile.first_name?.[0]}{profile.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="hidden lg:block font-medium text-sm">
                        {profile.username || profile.first_name}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`hidden lg:block transition-transform duration-300 ${
                          openDropdown === "profile" ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {openDropdown === "profile" && (
                      <div className="absolute right-0 mt-2 w-56 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl py-2 z-50 animate-scale-in overflow-hidden">
                        <div className="px-4 py-3 border-b border-border/50">
                          <p className="font-medium text-sm">{profile.first_name} {profile.last_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-3 text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:pl-6 relative overflow-hidden group flex items-center gap-2"
                        >
                          <User size={16} />
                          <span className="relative z-10">My Profile</span>
                          <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary transform scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top" />
                        </button>
                        <button
                          onClick={async () => {
                            await signOut();
                            toast.success('Signed out successfully');
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-3 text-foreground hover:bg-red-500/10 hover:text-red-600 transition-all duration-200 hover:pl-6 relative overflow-hidden group flex items-center gap-2"
                        >
                          <LogOut size={16} />
                          <span className="relative z-10">Sign Out</span>
                          <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/40">
                        <div className="h-8 w-8 rounded-full bg-secondary animate-pulse" />
                        <span className="text-xs text-muted-foreground">Loading profile...</span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => navigate('/profile')} disabled>
                        Profile
                      </Button>
                    </div>
                  )
                ) : (
                  !authLoading && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/login')}
                        className="rounded-full"
                      >
                        Sign In
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate('/register')}
                        className="rounded-full bg-primary hover:bg-primary/90"
                      >
                        Sign Up
                      </Button>
                    </div>
                  )
                )}
              </>
            )}

            {user && (
              <Button
                onClick={goToCheckout}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">Pre-Order Now</span>
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Button>
            )}
          </div>

          {}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {}
      {isCustomOrderOpen && (
        <CustomOrderModal open={isCustomOrderOpen} onClose={() => setIsCustomOrderOpen(false)} />
      )}

      {}
      {openDropdown === "notifications" && !isAdminRoute && (
        <div className="fixed inset-x-0 top-20 mx-auto md:absolute md:top-full md:right-4 md:left-auto md:inset-x-auto md:mt-2 w-[calc(100%-1rem)] md:w-96 max-w-md md:max-w-[calc(100vw-2rem)] bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl animate-scale-in z-[100] max-h-[calc(100vh-6rem)] md:max-h-[500px] overflow-hidden mx-2 md:mx-0">
          <NotificationPanel onClose={() => setOpenDropdown(null)} />
        </div>
      )}
    </nav>
  );
};

const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 animate-wiggle" />
          <h3 className="font-semibold">Order Notifications</h3>
        </div>
        <button onClick={onClose} className="hover:bg-primary-foreground/20 p-1.5 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-y-auto max-h-[420px] custom-scrollbar">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="w-16 h-16 mx-auto mb-3 opacity-20" />
            <p className="font-medium mb-1">No notifications yet</p>
            <p className="text-xs">Order notifications will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {notifications.map((notif, index) => (
              <div
                key={notif.id}
                className="p-4 hover:bg-secondary/30 transition-all duration-200 cursor-pointer relative overflow-hidden group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/50 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                <div className="flex items-start gap-3 pl-1">
                  <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 shadow-lg ${
                    notif.status === 'SENT' ? 'bg-green-500 animate-pulse' :
                    notif.status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-primary uppercase tracking-wide">{notif.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        notif.status === 'SENT' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        notif.status === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {notif.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      To: {notif.recipient}
                    </p>
                    <p className="text-sm leading-relaxed line-clamp-2 mb-2">{notif.message}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/50" />
                      {new Date(notif.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.5);
        }
      `}</style>
    </>
  );
};

export default Navbar;
