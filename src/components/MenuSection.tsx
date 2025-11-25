import { useEffect, useState } from "react";
import MenuCard from "./MenuCard";
import { supabase } from "@/lib/supabase";
import { Package } from "lucide-react";

// Local product images from assets folder - Direct mapping for Vite
const getImageFromPath = (imagePath: string): string => {
  // Remove /src/assets/ prefix if present
  const fileName = imagePath.replace('/src/assets/', '').replace('../assets/', '');
  
  // Map database paths to actual imported images
  const imageMap: Record<string, string> = {
    '2 tier cake.jpeg': new URL('../assets/2 tier cake.jpeg', import.meta.url).href,
    '3 tier cake.jpeg': new URL('../assets/3 tier cake.jpeg', import.meta.url).href,
    '4 tier cake.jpeg': new URL('../assets/4 tier cake.jpeg', import.meta.url).href,
    'heart cake.jpeg': new URL('../assets/heart cake.jpeg', import.meta.url).href,
    'letter cake.jpeg': new URL('../assets/letter cake.jpeg', import.meta.url).href,
    'number cake.jpeg': new URL('../assets/number cake.jpeg', import.meta.url).href,
    'round cake.jpeg': new URL('../assets/round cake.jpeg', import.meta.url).href,
    'square cake.jpeg': new URL('../assets/square cake.jpeg', import.meta.url).href,
    'sheet cake.jpeg': new URL('../assets/sheet cake.jpeg', import.meta.url).href,
    'pound cake.jpeg': new URL('../assets/pound cake.jpeg', import.meta.url).href,
    'birthday-cakes.jpg': new URL('../assets/birthday-cakes.jpg', import.meta.url).href,
    'fruit-cakes.jpg': new URL('../assets/fruit-cakes.jpg', import.meta.url).href,
    'cupcakes box of 12.jpeg': new URL('../assets/cupcakes box of 12.jpeg', import.meta.url).href,
    'cupcakes box of 6.jpeg': new URL('../assets/cupcakes box of 6.jpeg', import.meta.url).href,
    'mini cupcakes.jpeg': new URL('../assets/mini cupcakes.jpeg', import.meta.url).href,
    'cupcakes.jpg': new URL('../assets/cupcakes.jpg', import.meta.url).href,
    'cookie box of 12.jpeg': new URL('../assets/cookie box of 12.jpeg', import.meta.url).href,
    'cookie box .jpeg': new URL('../assets/cookie box .jpeg', import.meta.url).href,
    'Giant Cookie.jpeg': new URL('../assets/Giant Cookie.jpeg', import.meta.url).href,
    'cookies.jpg': new URL('../assets/cookies.jpg', import.meta.url).href,
    'browies box of 6.jpeg': new URL('../assets/browies box of 6.jpeg', import.meta.url).href,
    'brownies.jpg': new URL('../assets/brownies.jpg', import.meta.url).href,
    'muffins.jpg': new URL('../assets/muffins.jpg', import.meta.url).href,
    'banana-bread.jpg': new URL('../assets/banana-bread.jpg', import.meta.url).href,
    'loafs.jpg': new URL('../assets/loafs.jpg', import.meta.url).href,
    'cake pops.jpeg': new URL('../assets/cake pops.jpeg', import.meta.url).href,
    'cinnamon-rolls.jpg': new URL('../assets/cinnamon-rolls.jpg', import.meta.url).href,
    'delicious-cake-1.jpeg': new URL('../assets/delicious-cake-1.jpeg', import.meta.url).href,
    'delicious-cake-2.jpeg': new URL('../assets/delicious-cake-2.jpeg', import.meta.url).href,
  };
  
  return imageMap[fileName] || new URL('../assets/delicious-cake-1.jpeg', import.meta.url).href;
};

// Local product images from assets folder
const getCategoryImage = (category?: string, name?: string): string => {
  const normalizedCategory = (category || "").toLowerCase();
  const normalizedName = (name || "").toLowerCase();
  
  // Cakes - Match with local cake images
  if (normalizedCategory === "cakes" || normalizedName.includes("cake")) {
    if (normalizedName.includes("2 tier") || normalizedName.includes("two tier")) {
      return new URL("../assets/2 tier cake.jpeg", import.meta.url).href;
    }
    if (normalizedName.includes("3 tier") || normalizedName.includes("three tier")) {
      return new URL("../assets/3 tier cake.jpeg", import.meta.url).href;
    }
    if (normalizedName.includes("4 tier") || normalizedName.includes("four tier")) {
      return new URL("../assets/4 tier cake.jpeg", import.meta.url).href;
    }
    if (normalizedName.includes("heart")) {
      return new URL("../assets/heart cake.jpeg", import.meta.url).href;
    }
    if (normalizedName.includes("letter")) {
      return new URL("../assets/letter cake.jpeg", import.meta.url).href;
    }
    if (normalizedName.includes("number")) {
      return new URL("../assets/number cake.jpeg", import.meta.url).href;
    }
    if (normalizedName.includes("round")) {
      return new URL("../assets/round cake.jpeg", import.meta.url).href;
    }
    if (normalizedName.includes("square")) {
      return new URL("../assets/square cake.jpeg", import.meta.url).href;
    }
    if (normalizedName.includes("sheet")) {
      return new URL("../assets/sheet cake.jpeg", import.meta.url).href;
    }
    if (normalizedName.includes("pound")) {
      return new URL("../assets/pound cake.jpeg", import.meta.url).href;
    }
    if (normalizedName.includes("birthday")) {
      return new URL("../assets/birthday-cakes.jpg", import.meta.url).href;
    }
    if (normalizedName.includes("fruit")) {
      return new URL("../assets/fruit-cakes.jpg", import.meta.url).href;
    }
    return new URL("../assets/delicious-cake-1.jpeg", import.meta.url).href;
  }
  
  // Cupcakes - Match with cupcake images
  if (normalizedCategory === "cupcakes" || normalizedName.includes("cupcake")) {
    if (normalizedName.includes("box of 12") || normalizedName.includes("12")) {
      return new URL("../assets/cupcakes box of 12.jpeg", import.meta.url).href;
    }
    if (normalizedName.includes("box of 6") || normalizedName.includes("6")) {
      return new URL("../assets/cupcakes box of 6.jpeg", import.meta.url).href;
    }
    if (normalizedName.includes("mini")) {
      return new URL("../assets/mini cupcakes.jpeg", import.meta.url).href;
    }
    return new URL("../assets/cupcakes.jpg", import.meta.url).href;
  }
  
  // Cookies - Match with cookie images
  if (normalizedCategory === "cookies" || normalizedName.includes("cookie")) {
    if (normalizedName.includes("box of 12") || normalizedName.includes("12")) {
      return new URL("../assets/cookie box of 12.jpeg", import.meta.url).href;
    }
    if (normalizedName.includes("box") && !normalizedName.includes("12")) {
      return new URL("../assets/cookie box .jpeg", import.meta.url).href;
    }
    if (normalizedName.includes("giant")) {
      return new URL("../assets/Giant Cookie.jpeg", import.meta.url).href;
    }
    return new URL("../assets/cookies.jpg", import.meta.url).href;
  }
  
  // Brownies - Match with brownie images
  if (normalizedCategory === "brownies" || normalizedName.includes("brownie")) {
    if (normalizedName.includes("box of 6") || normalizedName.includes("6")) {
      return new URL("../assets/browies box of 6.jpeg", import.meta.url).href;
    }
    return new URL("../assets/brownies.jpg", import.meta.url).href;
  }
  
  // Muffins
  if (normalizedCategory === "muffins" || normalizedName.includes("muffin")) {
    return new URL("../assets/muffins.jpg", import.meta.url).href;
  }
  
  // Bread/Loaves
  if (normalizedName.includes("bread") || normalizedName.includes("loaf")) {
    if (normalizedName.includes("banana")) {
      return new URL("../assets/banana-bread.jpg", import.meta.url).href;
    }
    return new URL("../assets/loafs.jpg", import.meta.url).href;
  }
  
  // Cake Pops
  if (normalizedName.includes("cake pop")) {
    return new URL("../assets/cake pops.jpeg", import.meta.url).href;
  }
  
  // Cinnamon Rolls
  if (normalizedName.includes("cinnamon")) {
    return new URL("../assets/cinnamon rolls.jpeg", import.meta.url).href;
  }
  
  // Default bakery image
  return new URL("../assets/delicious-cake-1.jpeg", import.meta.url).href;
};

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  in_stock?: boolean;
}

const LARGE_CAKE_KEYWORDS = ["wedding", "tier", "custom", "anniversary", "birthday", "per kg"];

interface ProductVariant {
  id: string;
  name: string;
  priceModifier?: number;
  description?: string;
}

// Helper function to get size options based on category
const getSizeOptions = (category?: string, name?: string): ProductVariant[] => {
  const normalizedCategory = (category || "").toLowerCase();
  const normalizedName = (name || "").toLowerCase();
  
  if (normalizedCategory === "cakes" || normalizedName.includes("cake")) {
    return [
      { id: "small", name: "Small", priceModifier: 0, description: "6-8 servings" },
      { id: "medium", name: "Medium", priceModifier: 300, description: "12-15 servings" },
      { id: "large", name: "Large", priceModifier: 600, description: "20-25 servings" },
    ];
  }
  
  if (normalizedCategory === "cookies" || normalizedName.includes("cookie")) {
    return [
      { id: "regular", name: "Regular", priceModifier: 0, description: "Standard size" },
      { id: "large", name: "Large", priceModifier: 50, description: "Extra large" },
    ];
  }
  
  return [];
};

// Helper function to get quantity options based on category
const getQuantityOptions = (category?: string, name?: string): ProductVariant[] => {
  const normalizedCategory = (category || "").toLowerCase();
  const normalizedName = (name || "").toLowerCase();
  
  if (normalizedCategory === "cupcakes" || normalizedName.includes("cupcake")) {
    return [
      { id: "6", name: "6 pcs", priceModifier: 0 },
      { id: "12", name: "12 pcs", priceModifier: 300 },
      { id: "24", name: "24 pcs", priceModifier: 550 },
    ];
  }
  
  if (normalizedCategory === "cookies" || normalizedName.includes("cookie")) {
    return [
      { id: "6", name: "6 pcs", priceModifier: 0 },
      { id: "12", name: "12 pcs", priceModifier: 200 },
      { id: "24", name: "24 pcs", priceModifier: 380 },
    ];
  }
  
  if (normalizedCategory === "donuts" || normalizedName.includes("donut")) {
    return [
      { id: "6", name: "6 pcs", priceModifier: 0 },
      { id: "12", name: "12 pcs", priceModifier: 250 },
    ];
  }
  
  return [];
};

// Helper function to get flavor options based on category
const getFlavorOptions = (category?: string, name?: string): string[] => {
  const normalizedCategory = (category || "").toLowerCase();
  const normalizedName = (name || "").toLowerCase();
  
  if (normalizedCategory === "cupcakes" || normalizedName.includes("cupcake")) {
    return ["Vanilla", "Chocolate", "Red Velvet", "Lemon", "Strawberry"];
  }
  
  if (normalizedCategory === "cakes" || normalizedName.includes("cake")) {
    return ["Vanilla", "Chocolate", "Red Velvet", "Carrot", "Lemon"];
  }
  
  if (normalizedCategory === "cookies" || normalizedName.includes("cookie")) {
    return ["Chocolate Chip", "Oatmeal Raisin", "Sugar", "Peanut Butter"];
  }
  
  return [];
};

const getLeadTimeDays = (category?: string, name?: string) => {
  const normalizedCategory = (category || "").toLowerCase();
  const normalizedName = (name || "").toLowerCase();
  const isLargeCake =
    normalizedCategory === "wedding" ||
    (normalizedCategory === "cakes" && LARGE_CAKE_KEYWORDS.some((keyword) => normalizedName.includes(keyword))) ||
    LARGE_CAKE_KEYWORDS.some((keyword) => normalizedName.includes(keyword));

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
              const name = item.name;
              const category = item.category;
              
              // Use database image_url if available, otherwise use intelligent local matching
              let image: string;
              if (item.image_url) {
                // Convert database path to actual Vite URL using static mapping
                image = getImageFromPath(item.image_url);
              } else {
                // Fallback to intelligent matching if no database image
                image = getCategoryImage(category, name);
              }
              
              // Debug: Log product-to-image mapping
              console.log(`Product: "${name}" (${category}) → Image: ${image.split('/').pop()}`);
              
              // Get variant options
              const sizeOptions = getSizeOptions(category, name);
              const quantityOptions = getQuantityOptions(category, name);
              const flavorOptions = getFlavorOptions(category, name);
              const hasVariants = sizeOptions.length > 0 || quantityOptions.length > 0 || flavorOptions.length > 0;
              
              return (
                <MenuCard
                  key={item.id}
                  id={item.id}
                  image={image}
                  title={name}
                  description={item.description || ''}
                  price={item.price}
                  available={item.in_stock !== false}
                  leadTimeDays={getLeadTimeDays(category, name)}
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
