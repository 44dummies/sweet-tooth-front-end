import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { X, ChevronRight, LogIn, UserPlus, Home, UtensilsCrossed, Image, Sparkles, ShoppingBag, Gift, Heart, User, HelpCircle, LogOut, ShoppingCart, Menu } from "lucide-react";

const routes = [
  { label: "Home", path: "/", icon: Home },
  { label: "Menu", path: "/menu", icon: UtensilsCrossed },
  { label: "Gallery", path: "/gallery", icon: Image },
  { label: "Explore", path: "/explore", icon: Sparkles },
  { label: "Custom Order", path: "/custom-order", icon: ShoppingBag },
  { label: "Gift Cards", path: "/gift-cards", icon: Gift },
  { label: "Wishlist", path: "/wishlist", icon: Heart },
  { label: "Profile", path: "/profile", icon: User },
  { label: "FAQ", path: "/faq", icon: HelpCircle },
];

export const SidePanelNav = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { totalItems } = useCart();

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
      <header className="fixed top-0 left-0 right-0 z-40 h-16 md:h-20 px-4 md:px-6 bg-gradient-to-b from-background/95 to-background/60 backdrop-blur-md border-b border-border/50 flex items-center justify-between shadow-sm">
        {/* Left: Menu Icon + Logo/Title */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Custom Menu Icon Button */}
          <button
            onClick={() => setOpen(true)}
            className="relative p-2 md:p-2.5 rounded-xl hover:bg-accent transition-all duration-300 group"
          >
            <Menu className="w-6 h-6 md:w-7 md:h-7 text-foreground group-hover:text-primary transition-colors duration-300" />
            <div className="absolute inset-0 bg-primary/20 rounded-xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />
          </button>

          {/* Logo and Title (Desktop only) */}
          <div className="hidden md:flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <img 
                src={logo} 
                alt="Sweet Tooth" 
                className="h-12 w-12 rounded-full shadow-lg group-hover:scale-110 transition-all duration-300 brightness-75 dark:brightness-100 ring-2 ring-primary/20 group-hover:ring-primary/40" 
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />
            </div>
            <span className="font-dancing text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              Sweet Tooth
            </span>
          </div>

          {/* Mobile Logo Only */}
          <div className="md:hidden cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src={logo} 
              alt="Sweet Tooth" 
              className="h-9 w-9 rounded-full shadow-md brightness-75 dark:brightness-100 ring-2 ring-primary/20" 
            />
          </div>
        </div>
        
        {/* Right: Cart + Theme Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Cart Icon with Badge */}
          <div className="relative">
            <CartDrawer />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-gradient-to-r from-red-500 to-pink-500 border-2 border-background animate-pulse">
                {totalItems}
              </Badge>
            )}
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Side panel overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />
          
          {/* Side panel navigation */}
          <nav className="relative w-80 max-w-[85vw] h-full bg-gradient-to-b from-background via-background to-background/95 border-r border-border/50 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-border/50 bg-gradient-to-r from-primary/5 to-purple-500/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={logo} 
                    alt="Sweet Tooth" 
                    className="h-10 w-10 rounded-full brightness-75 dark:brightness-100 ring-2 ring-primary/30 shadow-md" 
                  />
                  <span className="font-dancing text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Sweet Tooth
                  </span>
                </div>
                <button 
                  onClick={() => setOpen(false)} 
                  className="p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* User Profile Section */}
              {user && profile && (
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-semibold">
                      {profile.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{profile.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4">
              <div className="space-y-1">
                {routes.map((route) => {
                  const Icon = route.icon;
                  const isActive = location.pathname === route.path;
                  
                  return (
                    <button
                      key={route.path}
                      onClick={() => handleNav(route.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                        isActive 
                          ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25' 
                          : 'hover:bg-accent/50 text-foreground'
                      }`}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                      )}
                      
                      <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <span className="flex-1 text-left">{route.label}</span>
                      
                      <ChevronRight className={`w-4 h-4 transition-all duration-200 ${
                        isActive ? 'translate-x-0 opacity-100' : 'translate-x-[-4px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                      }`} />
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* Footer Actions */}
            <div className="p-4 border-t border-border/50 bg-gradient-to-t from-primary/5 to-transparent">
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
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default SidePanelNav;