import { useEffect, useState } from "react";
import MenuCard from "./MenuCard";
import { supabase } from "@/lib/supabase";
import { Package } from "lucide-react";

// Local product images from assets folder
const getCategoryImage = (category?: string, title?: string): string => {
  const normalizedCategory = (category || "").toLowerCase();
  const normalizedTitle = (title || "").toLowerCase();
  
  // Cakes - Match with local cake images
  if (normalizedCategory === "cakes" || normalizedTitle.includes("cake")) {
    if (normalizedTitle.includes("2 tier") || normalizedTitle.includes("two tier")) {
      return new URL("../assets/2 tier cake.jpeg", import.meta.url).href;
    }
    if (normalizedTitle.includes("3 tier") || normalizedTitle.includes("three tier")) {
      return new URL("../assets/3 tier cake.jpeg", import.meta.url).href;
    }
    if (normalizedTitle.includes("4 tier") || normalizedTitle.includes("four tier")) {
      return new URL("../assets/4 tier cake.jpeg", import.meta.url).href;
    }
    if (normalizedTitle.includes("heart")) {
      return new URL("../assets/heart cake.jpeg", import.meta.url).href;
    }
    if (normalizedTitle.includes("letter")) {
      return new URL("../assets/letter cake.jpeg", import.meta.url).href;
    }
    if (normalizedTitle.includes("number")) {
      return new URL("../assets/number cake.jpeg", import.meta.url).href;
    }
    if (normalizedTitle.includes("round")) {
      return new URL("../assets/round cake.jpeg", import.meta.url).href;
    }
    if (normalizedTitle.includes("square")) {
      return new URL("../assets/square cake.jpeg", import.meta.url).href;
    }
    if (normalizedTitle.includes("sheet")) {
      return new URL("../assets/sheet cake.jpeg", import.meta.url).href;
    }
    if (normalizedTitle.includes("pound")) {
      return new URL("../assets/pound cake.jpeg", import.meta.url).href;
    }
    if (normalizedTitle.includes("birthday")) {
      return new URL("../assets/birthday-cakes.jpg", import.meta.url).href;
    }
    if (normalizedTitle.includes("fruit")) {
      return new URL("../assets/fruit-cakes.jpg", import.meta.url).href;
    }
    return new URL("../assets/delicious-cake-1.jpeg", import.meta.url).href;
  }
  
  // Cupcakes - Match with cupcake images
  if (normalizedCategory === "cupcakes" || normalizedTitle.includes("cupcake")) {
    if (normalizedTitle.includes("box of 12") || normalizedTitle.includes("12")) {
      return new URL("../assets/cupcakes box of 12.jpeg", import.meta.url).href;
    }
    if (normalizedTitle.includes("box of 6") || normalizedTitle.includes("6")) {
      return new URL("../assets/cupcakes box of 6.jpeg", import.meta.url).href;
    }
    if (normalizedTitle.includes("mini")) {
      return new URL("../assets/mini cupcakes.jpeg", import.meta.url).href;
    }
    return new URL("../assets/cupcakes.jpg", import.meta.url).href;
  }
  
  // Cookies - Match with cookie images
  if (normalizedCategory === "cookies" || normalizedTitle.includes("cookie")) {
    if (normalizedTitle.includes("box of 12") || normalizedTitle.includes("12")) {
      return new URL("../assets/cookie box of 12.jpeg", import.meta.url).href;
    }
    if (normalizedTitle.includes("box") && !normalizedTitle.includes("12")) {
      return new URL("../assets/cookie box .jpeg", import.meta.url).href;
    }
    if (normalizedTitle.includes("giant")) {
      return new URL("../assets/Giant Cookie.jpeg", import.meta.url).href;
    }
    return new URL("../assets/cookies.jpg", import.meta.url).href;
  }
  
  // Brownies - Match with brownie images
  if (normalizedCategory === "brownies" || normalizedTitle.includes("brownie")) {
    if (normalizedTitle.includes("box of 6") || normalizedTitle.includes("6")) {
      return new URL("../assets/browies box of 6.jpeg", import.meta.url).href;
    }
    return new URL("../assets/brownies.jpg", import.meta.url).href;
  }
  
  // Muffins
  if (normalizedCategory === "muffins" || normalizedTitle.includes("muffin")) {
    return new URL("../assets/muffins.jpg", import.meta.url).href;
  }
  
  // Bread/Loaves
  if (normalizedTitle.includes("bread") || normalizedTitle.includes("loaf")) {
    if (normalizedTitle.includes("banana")) {
      return new URL("../assets/banana-bread.jpg", import.meta.url).href;
    }
    return new URL("../assets/loafs.jpg", import.meta.url).href;
  }
  
  // Cake Pops
  if (normalizedTitle.includes("cake pop")) {
    return new URL("../assets/cake pops.jpeg", import.meta.url).href;
  }
  
  // Cinnamon Rolls
  if (normalizedTitle.includes("cinnamon")) {
    return new URL("../assets/cinnamon rolls.jpeg", import.meta.url).href;
  }
  
  // Default bakery image
  return new URL("../assets/delicious-cake-1.jpeg", import.meta.url).href;
};

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
        .gte('price', 500) // Only show products >= 500
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {menuItems.map((item) => {
              const title = item.title || item.name || 'Untitled';
              const category = item.category;
              // Always use Pexels images for consistent, high-quality product photos
              const image = getCategoryImage(category, title);
              
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
