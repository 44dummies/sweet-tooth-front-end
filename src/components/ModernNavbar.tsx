import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import logo from "@/assets/logo.png";
import {
  Home,
  UtensilsCrossed,
  Image,
  Heart,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  ChevronDown,
  Sparkles,
  Phone,
  Gift,
  ChevronRight,
} from "lucide-react";

// Cake Inspo icon
const InspoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
);

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Menu", path: "/menu", icon: UtensilsCrossed },
  { label: "Gallery", path: "/gallery", icon: Image },
  { label: "Cake Inspo", path: "/cake-inspo", icon: InspoIcon },
];

const moreItems = [
  { label: "Custom Order", path: "/custom-order", icon: ShoppingBag, desc: "Design your dream cake" },
  { label: "Wishlist", path: "/wishlist", icon: Heart, desc: "Your saved favorites" },
  { label: "Gift Cards", path: "/gift-cards", icon: Gift, desc: "Perfect gift for loved ones" },
  { label: "FAQ", path: "/faq", icon: HelpCircle, desc: "Common questions answered" },
];

export const ModernNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".more-dropdown") && !target.closest(".profile-dropdown")) {
        setIsMoreOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    setIsProfileOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Main Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-gray-900/90 dark:bg-background/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl"
            : "bg-gray-800/70 dark:bg-gradient-to-b dark:from-background/90 dark:to-background/70 backdrop-blur-md"
        }`}
      >
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 md:h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <img
                src={logo}
                alt="Sweet Tooth"
                className="h-9 w-9 md:h-11 md:w-11 lg:h-12 lg:w-12 transition-transform duration-300 brightness-150 contrast-125 drop-shadow-[0_0_10px_rgba(0,0,0,0.35)] group-hover:scale-105"
              />
              <span className="font-dancing text-lg md:text-xl lg:text-2xl font-bold text-white tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
                Sweet Tooth
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link key={item.path} to={item.path}>
                    <div
                      className={`relative px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 hover:scale-105 ${
                        active
                          ? "text-primary bg-primary/10"
                          : "text-white/90 dark:text-foreground/80 hover:text-white dark:hover:text-foreground hover:bg-white/10 dark:hover:bg-secondary/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <div className="relative more-dropdown">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMoreOpen(!isMoreOpen);
                    setIsProfileOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl font-medium text-sm text-white/90 dark:text-foreground/80 hover:text-white dark:hover:text-foreground transition-all flex items-center gap-2 hover:bg-white/10 dark:hover:bg-secondary/50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>More</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isMoreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl overflow-hidden"
                    >
                      {moreItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link key={item.path} to={item.path} onClick={() => setIsMoreOpen(false)}>
                            <div className="flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                      <div className="border-t border-border/50 p-3">
                        <a href="tel:+254795436192" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                          <Phone className="w-4 h-4" />
                          <span>+254 795 436 192</span>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Cart */}
              <div className="relative">
                <CartDrawer />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-[10px] bg-gradient-to-r from-red-500 to-pink-500 border-2 border-background pointer-events-none">
                    {totalItems > 9 ? "9+" : totalItems}
                  </Badge>
                )}
              </div>

              <ThemeToggle />

              {/* Desktop Profile */}
              <div className="hidden md:flex items-center gap-2">
                {user ? (
                  <div className="relative profile-dropdown">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProfileOpen(!isProfileOpen);
                        setIsMoreOpen(false);
                      }}
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 dark:hover:bg-secondary/50"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-primary/30">
                        {profile?.avatar && <AvatarImage src={profile.avatar} />}
                        <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-sm font-bold">
                          {profile?.first_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className={`w-4 h-4 text-white/70 dark:text-muted-foreground transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full right-0 mt-2 w-64 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl overflow-hidden"
                        >
                          <div className="p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 border-b border-border/50">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                                {profile?.avatar && <AvatarImage src={profile.avatar} />}
                                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-bold">
                                  {profile?.first_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">
                                  {profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}` : "User"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-2">
                            <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary/10">
                              <User className="w-5 h-5 text-primary" />
                              <span className="font-medium">My Profile</span>
                            </Link>
                            <Link to="/wishlist" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary/10">
                              <Heart className="w-5 h-5 text-primary" />
                              <span className="font-medium">Wishlist</span>
                            </Link>
                          </div>
                          <div className="p-2 border-t border-border/50">
                            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-600">
                              <LogOut className="w-5 h-5" />
                              <span className="font-medium">Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="rounded-xl text-white/90 dark:text-foreground hover:bg-white/10 dark:hover:bg-secondary/50 hover:text-white">Sign In</Button>
                    <Button size="sm" onClick={() => navigate("/register")} className="rounded-xl bg-gradient-to-r from-primary to-purple-600">Sign Up</Button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-white/10 dark:hover:bg-secondary/50 text-white dark:text-foreground"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] lg:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <img src={logo} alt="Sweet Tooth" className="h-8 w-8" />
                  <span className="font-dancing text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Sweet Tooth
                  </span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl hover:bg-secondary/50">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile */}
              {user && (
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="m-4 mb-0 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 flex items-center gap-3"
                >
                  <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                    {profile?.avatar && <AvatarImage src={profile.avatar} />}
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-bold">
                      {profile?.first_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}` : "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">View Profile</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
              )}

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Navigation</p>
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                          active
                            ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg"
                            : "hover:bg-secondary/50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        {active && <div className="ml-auto w-2 h-2 rounded-full bg-white" />}
                      </Link>
                    );
                  })}
                </div>

                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-3">More</p>
                <div className="space-y-1">
                  {moreItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                          active
                            ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg"
                            : "hover:bg-secondary/50"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : 'bg-primary/10'}`}>
                          <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-primary'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.label}</p>
                          <p className={`text-xs ${active ? 'text-white/70' : 'text-muted-foreground'}`}>{item.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Contact */}
                <div className="mt-6 p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact Us</p>
                  <a href="tel:+254795436192" className="flex items-center gap-3 text-foreground hover:text-primary">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">+254 795 436 192</span>
                  </a>
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="p-4 border-t border-border/50 bg-background">
                {user ? (
                  <Button
                    onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                    variant="outline"
                    className="w-full h-12 rounded-xl border-red-500/30 text-red-600 hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => { setIsMobileMenuOpen(false); navigate("/login"); }}
                      className="h-12 rounded-xl"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => { setIsMobileMenuOpen(false); navigate("/register"); }}
                      className="h-12 rounded-xl bg-gradient-to-r from-primary to-purple-600"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar - Always visible on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white dark:bg-background border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 py-2 group"
              >
                <div
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-primary/10 text-primary scale-110"
                      : "text-muted-foreground group-hover:text-foreground group-hover:bg-secondary/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          {/* More button for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-2 group"
          >
            <div className="p-2 rounded-xl text-muted-foreground group-hover:text-foreground group-hover:bg-secondary/50 transition-all duration-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-1 font-medium text-muted-foreground group-hover:text-foreground">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-14 md:h-16 lg:h-20" />
    </>
  );
};

export default ModernNavbar;
