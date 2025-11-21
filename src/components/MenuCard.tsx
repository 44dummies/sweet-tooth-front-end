import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
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
    <Card className={`flex flex-col h-full shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer group overflow-hidden border-2 hover:border-primary/50 ${isDisabled ? 'opacity-60' : ''}`}>
      <CardHeader className="p-0 relative overflow-hidden">
        {isDisabled && (
          <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
              {isUnavailable ? 'Unavailable' : 'Out of Stock'}
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2 z-20">
          <FavoriteButton productId={id} productName={title} size="sm" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
        <img
          src={image}
          alt={title}
          className="w-full h-52 sm:h-56 md:h-48 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
      </CardHeader>

      <CardContent className="p-4 sm:p-5 flex flex-col flex-1">
        <CardTitle className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{title}</CardTitle>

        <p className="text-muted-foreground text-xs sm:text-sm flex-grow line-clamp-2 mb-3">{description}</p>

        <NutritionalInfo
          calories={calories}
          allergens={allergens}
          ingredients={ingredients}
          dietary_tags={dietary_tags}
          nutritional_info={nutritional_info}
        />

        {stockQuantity > 0 && stockQuantity <= 5 && available && (
          <p className="text-xs text-orange-500 font-semibold mt-2">Only {stockQuantity} left!</p>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-base sm:text-lg font-bold text-primary group-hover:scale-110 transition-transform duration-300">
            Ksh {price.toLocaleString()}
          </span>

          <Button 
            onClick={handleAddToCart} 
            size="sm"
            disabled={isDisabled}
            className="hover:scale-105 active:scale-95 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDisabled ? 'Unavailable' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuCard;
