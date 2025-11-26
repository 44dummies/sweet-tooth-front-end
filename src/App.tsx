import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Gallery from "./pages/Gallery";
import CakeInspo from "./pages/CakeInspo";
import Checkout from "./pages/Checkout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProfileSetup from "./pages/ProfileSetup";
import PasswordReset from "./pages/PasswordReset";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import FAQ from "./pages/FAQ";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CustomOrderPage from "./pages/CustomOrderPage";
import NotFound from "./pages/NotFound";
import LoadingOverlay from "@/components/LoadingOverlay";
import GiftCardsPage from "./pages/GiftCardsPage";
import WishlistPage from "./pages/WishlistPage";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

const queryClient = new QueryClient();

const App = () => {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AuthProvider>
                <CartProvider>
                  <ScrollToTop />
                  <Toaster />
                  <Sonner />
                  {showLoading && <LoadingOverlay />}
                  <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/cake-inspo" element={<CakeInspo />} />
                  <Route path="/custom-order" element={<CustomOrderPage />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/password-reset" element={<PasswordReset />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/setup" element={<ProfileSetup />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/gift-cards" element={<GiftCardsPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="*" element={<NotFound />} />
                  </Routes>
                </CartProvider>
              </AuthProvider>
            </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
