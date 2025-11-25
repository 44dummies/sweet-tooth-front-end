import { useEffect, useState } from "react";
import MenuCard from "./MenuCard";
import { supabase } from "@/lib/supabase";
import { Package } from "lucide-react";

const defaultProductImage = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80";

interface Product {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  image_key?: string;
  in_stock?: boolean;
  available?: boolean;
}

const LARGE_CAKE_KEYWORDS = ["wedding", "tier", "custom", "anniversary", "birthday", "per kg"];

interface ProductVariant {
  id: string;
  name: string;
  priceModifier?: number;
  description?: string;
}

// Helper function to get size options based on category
const getSizeOptions = (category?: string, title?: string): ProductVariant[] => {
  const normalizedCategory = (category || "").toLowerCase();
  const normalizedTitle = (title || "").toLowerCase();
  
  if (normalizedCategory === "cakes" || normalizedTitle.includes("cake")) {
    return [
      { id: "small", name: "Small", priceModifier: 0, description: "6-8 servings" },
      { id: "medium", name: "Medium", priceModifier: 300, description: "12-15 servings" },
      { id: "large", name: "Large", priceModifier: 600, description: "20-25 servings" },
    ];
  }
  
  if (normalizedCategory === "cookies" || normalizedTitle.includes("cookie")) {
    return [
      { id: "regular", name: "Regular", priceModifier: 0, description: "Standard size" },
      { id: "large", name: "Large", priceModifier: 50, description: "Extra large" },
    ];
  }
  
  return [];
};

// Helper function to get quantity options based on category
const getQuantityOptions = (category?: string, title?: string): ProductVariant[] => {
  const normalizedCategory = (category || "").toLowerCase();
  const normalizedTitle = (title || "").toLowerCase();
  
  if (normalizedCategory === "cupcakes" || normalizedTitle.includes("cupcake")) {
    return [
      { id: "6", name: "6 pcs", priceModifier: 0 },
      { id: "12", name: "12 pcs", priceModifier: 300 },
      { id: "24", name: "24 pcs", priceModifier: 550 },
    ];
  }
  
  if (normalizedCategory === "cookies" || normalizedTitle.includes("cookie")) {
    return [
      { id: "6", name: "6 pcs", priceModifier: 0 },
      { id: "12", name: "12 pcs", priceModifier: 200 },
      { id: "24", name: "24 pcs", priceModifier: 380 },
    ];
  }
  
  if (normalizedCategory === "donuts" || normalizedTitle.includes("donut")) {
    return [
      { id: "6", name: "6 pcs", priceModifier: 0 },
      { id: "12", name: "12 pcs", priceModifier: 250 },
    ];
  }
  
  return [];
};

// Helper function to get flavor options based on category
const getFlavorOptions = (category?: string, title?: string): string[] => {
  const normalizedCategory = (category || "").toLowerCase();
  const normalizedTitle = (title || "").toLowerCase();
  
  if (normalizedCategory === "cupcakes" || normalizedTitle.includes("cupcake")) {
    return ["Vanilla", "Chocolate", "Red Velvet", "Lemon", "Strawberry"];
  }
  
  if (normalizedCategory === "cakes" || normalizedTitle.includes("cake")) {
    return ["Vanilla", "Chocolate", "Red Velvet", "Carrot", "Lemon"];
  }
  
  if (normalizedCategory === "cookies" || normalizedTitle.includes("cookie")) {
    return ["Chocolate Chip", "Oatmeal Raisin", "Sugar", "Peanut Butter"];
  }
  
  return [];
};

const getLeadTimeDays = (category?: string, title?: string) => {
  const normalizedCategory = (category || "").toLowerCase();
  const normalizedTitle = (title || "").toLowerCase();
  const isLargeCake =
    normalizedCategory === "wedding" ||
    (normalizedCategory === "cakes" && LARGE_CAKE_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword))) ||
    LARGE_CAKE_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword));

  return isLargeCake ? 3 : 2;
};

const MenuSection = () => {
  const [menuItems, setMenuItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('menu-products')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('title');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="menu" className="relative py-12 sm:py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Our Menu
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Explore our delicious selection of home-baked treats, made fresh daily with premium ingredients
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-muted-foreground">Loading menu...</p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
            <p className="text-muted-foreground">Check back soon for our delicious treats!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {menuItems.map((item) => {
              const image = item.image_url || defaultProductImage;
              const title = item.title || item.name || 'Untitled';
              const category = item.category;
              
              // Get variant options
              const sizeOptions = getSizeOptions(category, title);
              const quantityOptions = getQuantityOptions(category, title);
              const flavorOptions = getFlavorOptions(category, title);
              const hasVariants = sizeOptions.length > 0 || quantityOptions.length > 0 || flavorOptions.length > 0;
              
              return (
                <MenuCard
                  key={item.id}
                  id={item.id}
                  image={image}
                  title={title}
                  description={item.description || ''}
                  price={item.price}
                  available={item.in_stock !== false}
                  leadTimeDays={getLeadTimeDays(category, title)}
                  hasVariants={hasVariants}
                  variantType="flavor"
                  flavorOptions={flavorOptions}
                  sizeOptions={sizeOptions}
                  quantityOptions={quantityOptions}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MenuSection;
