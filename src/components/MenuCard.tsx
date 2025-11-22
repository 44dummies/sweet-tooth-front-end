import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Sparkles } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import NutritionalInfo from "./NutritionalInfo";

interface MenuCardProps {
  id: string;
  image: string;
  title: string;
  description: string;
  price: number;
  available: boolean;
  stockQuantity: number;
  calories?: number;
  allergens?: string[];
  ingredients?: string[];
  dietary_tags?: string[];
  nutritional_info?: {
    protein?: number;
    fat?: number;
    carbs?: number;
    sugar?: number;
    fiber?: number;
    sodium?: number;
  };
}

const MenuCard = ({ 
  id, 
  image, 
  title, 
  description, 
  price, 
  available, 
  stockQuantity,
  calories,
  allergens,
  ingredients,
  dietary_tags,
  nutritional_info
}: MenuCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!available) {
      toast.error(`${title} is currently unavailable`);
      return;
    }

    if (stockQuantity === 0) {
      toast.error(`${title} is out of stock`);
      return;
    }

    const item = {
      id,
      title,
      image,
      price,
      quantity: 1,
    };

    addItem(item);
    toast.success(`${title} added to cart`);
  };

  const isOutOfStock = stockQuantity === 0;
  const isUnavailable = !available;
  const isDisabled = isUnavailable || isOutOfStock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8 }}
      className={`group relative ${isDisabled ? 'opacity-60' : ''}`}
    >
      {/* Modern Card Container */}
      <div className="relative h-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800">
        
        {/* Image Section with Gradient Overlay */}
        <div className="relative h-64 overflow-hidden">
          {/* Status Badge */}
          {isDisabled && (
            <div className="absolute top-4 left-4 z-30 bg-red-500/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full font-semibold text-sm shadow-lg">
              {isUnavailable ? 'Unavailable' : 'Out of Stock'}
            </div>
          )}
          
          {/* Stock Warning Badge */}
          {!isDisabled && stockQuantity > 0 && stockQuantity <= 5 && (
            <div className="absolute top-4 left-4 z-30 bg-orange-500/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full font-semibold text-xs shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Only {stockQuantity} left!
            </div>
          )}

          {/* Favorite Button */}
          <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FavoriteButton productId={id} productName={title} size="md" />
          </div>

          {/* Image with Zoom Effect */}
          <div className="relative h-full w-full overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Nutritional Info */}
          <NutritionalInfo
            calories={calories}
            allergens={allergens}
            ingredients={ingredients}
            dietary_tags={dietary_tags}
            nutritional_info={nutritional_info}
          />

          {/* Price and Action Section */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between gap-3">
              {/* Price with Modern Styling */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Price</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Ksh {price.toLocaleString()}
                </span>
              </div>

              {/* Add to Cart Button - Modern Style */}
              <Button 
                onClick={handleAddToCart} 
                disabled={isDisabled}
                className="relative overflow-hidden group/btn bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-6 py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  {isDisabled ? 'Unavailable' : 'Add'}
                </span>
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
              </Button>
            </div>
          </div>
        </div>

        {/* Hover Border Glow */}
        <div className="absolute inset-0 rounded-2xl border-2 border-primary/0 group-hover:border-primary/30 transition-colors duration-500 pointer-events-none" />
      </div>
    </motion.div>
  );
};

export default MenuCard;
