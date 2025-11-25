import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, CalendarClock, ChevronRight } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import ProductVariantSelector from "./ProductVariantSelector";
import { useState } from "react";

interface ProductVariant {
  id: string;
  name: string;
  priceModifier?: number;
  description?: string;
}

interface MenuCardProps {
  id: string;
  image: string;
  title: string;
  description: string;
  price: number;
  available: boolean;
  leadTimeDays: number;
  hasVariants?: boolean;
  variantType?: string;
  flavorOptions?: string[];
  sizeOptions?: ProductVariant[];
  quantityOptions?: ProductVariant[];
}

const MenuCard = ({
  id,
  image,
  title,
  description,
  price,
  available,
  leadTimeDays,
  hasVariants = false,
  variantType = 'flavor',
  flavorOptions = [],
  sizeOptions = [],
  quantityOptions = [],
}: MenuCardProps) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showVariantSelector, setShowVariantSelector] = useState(false);

  const handleAddToCart = () => {
    // Check if user is signed in
    if (!user) {
      toast.error("Please sign in to add items to cart");
      navigate("/login");
      return;
    }

    if (!available) {
      toast.error(`${title} is currently unavailable`);
      return;
    }

    // Show variant selector if product has any variants
    if (hasVariants && (flavorOptions.length > 0 || sizeOptions.length > 0 || quantityOptions.length > 0)) {
      setShowVariantSelector(true);
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

  const isUnavailable = !available;
  const isDisabled = isUnavailable;
  const leadTimeStyles = leadTimeDays > 2
    ? "from-purple-500 to-pink-500"
    : "from-emerald-500 to-teal-500";


  // High-quality Pexels fallback for bakery products
  const fallbackImage = "https://images.pexels.com/photos/1721932/pexels-photo-1721932.jpeg?auto=compress&cs=tinysrgb&w=600";

  const variantLabel = variantType === 'flavor' ? 'flavors' :
                       variantType === 'filling' ? 'fillings' :
                       variantType === 'topping' ? 'toppings' : 'options';

  return (
    <>
      <div className={`group h-full ${isDisabled ? 'opacity-70' : ''}`}>
        {}
        <div className="relative h-full bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-border flex flex-col">

          {}
          <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-muted">
            {}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}

            {}
            <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 z-20 px-3 py-1 rounded-full font-medium text-[10px] sm:text-xs text-white bg-gradient-to-r ${leadTimeStyles} shadow-lg backdrop-blur`}>
              {leadTimeDays}-day prep
            </div>

            {}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
              <FavoriteButton productId={id} productName={title} size="sm" />
            </div>

            {isDisabled && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-xs sm:text-sm font-semibold z-10 pointer-events-none">
                Temporarily Unavailable
              </div>
            )}

            {}
            <img
              src={imageError ? fallbackImage : image}
              alt={title}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {}
          <div className="flex-1 p-3 sm:p-4 flex flex-col">
            {}
            <h3 className="font-bold text-sm sm:text-base lg:text-lg text-foreground line-clamp-1 mb-1">
              {title}
            </h3>

            {}
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 flex-1 mb-2">
              {description || 'Delicious homemade treat baked fresh daily.'}
            </p>

            {}
            {hasVariants && flavorOptions.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] sm:text-xs text-primary font-medium">
                  {flavorOptions.length} {variantLabel} available
                </p>
              </div>
            )}
            {hasVariants && (sizeOptions.length > 0 || quantityOptions.length > 0) && (
              <div className="mb-2">
                <p className="text-[10px] sm:text-xs text-primary font-medium">
                  {sizeOptions.length > 0 && `${sizeOptions.length} sizes `}
                  {sizeOptions.length > 0 && quantityOptions.length > 0 && '• '}
                  {quantityOptions.length > 0 && `${quantityOptions.length} quantities`}
                </p>
              </div>
            )}

            {}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
              {}
              <div>
                <span className="text-[10px] sm:text-xs text-muted-foreground block">From</span>
                <span className="text-base sm:text-lg lg:text-xl font-bold text-primary">
                  Ksh {price.toLocaleString()}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <CalendarClock className="w-3 h-3" />
                  {leadTimeDays}-day delivery
                </span>
              </div>

              {}
              <Button
                onClick={handleAddToCart}
                disabled={isDisabled}
                size="sm"
                className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg font-medium text-xs sm:text-sm"
              >
                {hasVariants ? (
                  <>
                    Select
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden xs:inline">Add</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {}
      {hasVariants && (
        <ProductVariantSelector
          isOpen={showVariantSelector}
          onClose={() => setShowVariantSelector(false)}
          product={{
            id,
            title,
            description,
            price,
            image: imageError ? fallbackImage : image,
            variantType,
            flavorOptions,
            sizeOptions,
            quantityOptions,
          }}
        />
      )}
    </>
  );
};

export default MenuCard;
