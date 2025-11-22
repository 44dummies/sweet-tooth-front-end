import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { X, ChevronRight, LogIn, UserPlus, Home, UtensilsCrossed, Image, ShoppingBag, Gift, Heart, User, HelpCircle, LogOut, Menu } from "lucide-react";

const routes = [
  { label: "Home", path: "/", icon: Home },
  { label: "Menu", path: "/menu", icon: UtensilsCrossed },
  { label: "Gallery", path: "/gallery", icon: Image },
  { label: "Custom Order", path: "/custom-order", icon: ShoppingBag },
  { label: "Gift Cards", path: "/gift-cards", icon: Gift },
  { label: "Wishlist", path: "/wishlist", icon: Heart },
  { label: "Profile", path: "/profile", icon: User },
  { label: "FAQ", path: "/faq", icon: HelpCircle },
];

export const SidePanelNav = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Desktop & Mobile Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-40 h-16 md:h-20 px-4 md:px-6 backdrop-blur-md border-b flex items-center justify-between transition-all duration-300 ${
          scrolled 
            ? 'bg-background/95 border-border/80 shadow-lg' 
            : 'bg-gradient-to-b from-background/95 to-background/60 border-border/50 shadow-sm'
        }`}
      >
        {/* Left: Menu Icon + Logo/Title */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(!open)}
            className="relative p-2 md:p-2.5 rounded-xl hover:bg-accent transition-all duration-300 group"
          >
            <motion.div
              animate={open ? { rotate: 180 } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Menu className="w-6 h-6 md:w-7 md:h-7 text-foreground group-hover:text-primary transition-colors duration-300" />
            </motion.div>
            <motion.div 
              className="absolute inset-0 bg-primary/20 rounded-xl blur-md"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          {/* Logo and Title (Desktop only) */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden md:flex items-center gap-3 group cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <motion.img 
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                src={logo} 
                alt="Sweet Tooth" 
                className="h-12 w-12 rounded-full shadow-lg brightness-75 dark:brightness-100 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300" 
              />
              <motion.div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 blur-lg"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <motion.span 
              className="font-dancing text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Sweet Tooth
            </motion.span>
          </motion.div>

          {/* Mobile Logo Only */}
          <motion.div 
            whileTap={{ scale: 0.95 }}
            className="md:hidden cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <img 
              src={logo} 
              alt="Sweet Tooth" 
              className="h-9 w-9 rounded-full shadow-md brightness-75 dark:brightness-100 ring-2 ring-primary/20" 
            />
          </motion.div>
        </div>
        
        {/* Right: Cart + Theme Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Cart Icon with Badge */}
          <div className="relative">
            <CartDrawer />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-gradient-to-r from-red-500 to-pink-500 border-2 border-background">
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {totalItems}
                    </motion.span>
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ThemeToggle />
        </div>
      </motion.header>

      {/* Side panel overlay */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex md:flex"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setOpen(false)}
            />
            
            {/* Side panel navigation */}
            <motion.nav 
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-80 max-w-[85vw] h-full bg-gradient-to-b from-background via-background to-background/95 border-r border-border/50 shadow-2xl flex flex-col"
            >
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-border/50 bg-gradient-to-r from-primary/5 to-purple-500/5">
                <div className="flex items-center justify-between mb-4">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <motion.img 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      src={logo} 
                      alt="Sweet Tooth" 
                      className="h-10 w-10 rounded-full brightness-75 dark:brightness-100 ring-2 ring-primary/30 shadow-md cursor-pointer" 
                    />
                    <span className="font-dancing text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      Sweet Tooth
                    </span>
                  </motion.div>
                  <motion.button 
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setOpen(false)} 
                    className="p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* User Profile Section */}
                {user && profile && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleNav('/profile')}
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-semibold">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">User</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4">
                <div className="space-y-1">
                  {routes.map((route, index) => {
                    const Icon = route.icon;
                    const isActive = location.pathname === route.path;
                    
                    return (
                      <motion.button
                        key={route.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        onClick={() => handleNav(route.path)}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                          isActive 
                            ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25' 
                            : 'hover:bg-accent/50 text-foreground'
                        }`}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <motion.div 
                            layoutId="activeIndicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        
                        <motion.div
                          animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="w-5 h-5" />
                        </motion.div>
                        <span className="flex-1 text-left">{route.label}</span>
                        
                        <motion.div
                          initial={{ x: -4, opacity: 0 }}
                          animate={isActive ? { x: 0, opacity: 1 } : {}}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </motion.div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Footer Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 border-t border-border/50 bg-gradient-to-t from-primary/5 to-transparent"
              >
                {user ? (
                  <div className="space-y-2">
                    <Button 
                      onClick={handleSignOut} 
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleNav('/login')} 
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-200"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Button>
                    <Button 
                      onClick={() => handleNav('/register')} 
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <UserPlus className="w-4 h-4" />
                      Create Account
                    </Button>
                  </div>
                )}
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SidePanelNav;
