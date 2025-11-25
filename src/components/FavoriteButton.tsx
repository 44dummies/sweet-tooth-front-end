import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface FavoriteButtonProps {
  productId: string;
  productName?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const FavoriteButton = ({ 
  productId, 
  productName = "this item",
  size = "md",
  showLabel = false 
}: FavoriteButtonProps) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (user?.email) {
      checkFavoriteStatus();
    }
  }, [user?.email, productId]);

  const checkFavoriteStatus = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_email', user.email)
        .eq('product_id', productId)
        .maybeSingle();

      if (error) {
        console.error('Error checking favorite status:', error);
        throw error;
      }
      setIsFavorite(!!data);
    } catch (error: any) {
      console.error('Error checking favorite status:', error);
      // Silently fail - just assume not favorited
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.email) {
      toast.error('Please login to save favorites');
      return;
    }

    setLoading(true);
    setIsAnimating(true);

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_email', user.email)
          .eq('product_id', productId);

        if (error) {
          console.error('Delete error:', error);
          throw error;
        }

        setIsFavorite(false);
        toast.success(`Removed from favorites`);
      } else {
        // Add to favorites
        const { data, error } = await supabase
          .from('favorites')
          .insert({
            user_email: user.email,
            product_id: productId,
          })
          .select();

        if (error) {
          console.error('Insert error:', error);
          // If duplicate, just set as favorite
          if (error.code === '23505') {
            setIsFavorite(true);
            toast.success(`Already in favorites!`);
            return;
          }
          throw error;
        }

        setIsFavorite(true);
        toast.success(`Added to favorites!`);
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error(error.message || 'Failed to update favorites. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11"
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size="icon"
      className={`${sizeClasses[size]} ${
        isFavorite 
          ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
          : "hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-700"
      } transition-all duration-200 ${showLabel ? 'rounded-full' : ''}`}
      onClick={toggleFavorite}
      disabled={loading}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isFavorite ? "filled" : "outline"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Heart
            className={`${iconSizes[size]} ${
              isFavorite ? "fill-current" : ""
            } ${isAnimating ? "animate-pulse" : ""}`}
          />
        </motion.div>
      </AnimatePresence>
      {showLabel && (
        <span className="ml-2 text-sm">
          {isFavorite ? "Saved" : "Save"}
        </span>
      )}
    </Button>
  );
};

export default FavoriteButton;
