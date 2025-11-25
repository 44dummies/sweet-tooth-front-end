import { useEffect, useState } from "react";
import MenuCard from "./MenuCard";
import { supabase } from "@/lib/supabase";
import { Package } from "lucide-react";

// High-quality bakery product images from various sources
const getCategoryImage = (category?: string, title?: string): string => {
  const normalizedCategory = (category || "").toLowerCase();
  const normalizedTitle = (title || "").toLowerCase();
  
  // Cakes - Using high-resolution bakery images
  if (normalizedCategory === "cakes" || normalizedTitle.includes("cake")) {
    if (normalizedTitle.includes("chocolate")) {
      return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=90";
    }
    if (normalizedTitle.includes("wedding")) {
      return "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=90";
    }
    if (normalizedTitle.includes("red velvet")) {
      return "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&q=90";
    }
    if (normalizedTitle.includes("birthday")) {
      return "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&q=90";
    }
    if (normalizedTitle.includes("vanilla")) {
      return "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=90";
    }
    if (normalizedTitle.includes("carrot")) {
      return "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&q=90";
    }
    if (normalizedTitle.includes("lemon")) {
      return "https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=800&q=90";
    }
    if (normalizedTitle.includes("strawberry")) {
      return "https://images.unsplash.com/photo-1565661834013-d196ca46e14e?w=800&q=90";
    }
    if (normalizedTitle.includes("black forest")) {
      return "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=90";
    }
    return "https://images.unsplash.com/photo-1588195538326-c5b1e5b9e46b?w=800&q=90";
  }
  
  // Cupcakes
  if (normalizedCategory === "cupcakes" || normalizedTitle.includes("cupcake")) {
    if (normalizedTitle.includes("chocolate")) {
      return "https://images.unsplash.com/photo-1426869884541-df7117556757?w=800&q=90";
    }
    if (normalizedTitle.includes("vanilla")) {
      return "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=800&q=90";
    }
    if (normalizedTitle.includes("red velvet")) {
      return "https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=800&q=90";
    }
    if (normalizedTitle.includes("strawberry")) {
      return "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800&q=90";
    }
    return "https://images.unsplash.com/photo-1599785209796-786432b228bc?w=800&q=90";
  }
  
  // Cookies
  if (normalizedCategory === "cookies" || normalizedTitle.includes("cookie")) {
    if (normalizedTitle.includes("chocolate chip")) {
      return "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=90";
    }
    if (normalizedTitle.includes("oatmeal")) {
      return "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=800&q=90";
    }
    if (normalizedTitle.includes("sugar")) {
      return "https://images.unsplash.com/photo-1590080876876-5c16d8b5b0d5?w=800&q=90";
    }
    return "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=90";
  }
  
  // Donuts
  if (normalizedCategory === "donuts" || normalizedTitle.includes("donut") || normalizedTitle.includes("doughnut")) {
    if (normalizedTitle.includes("glazed")) {
      return "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=90";
    }
    if (normalizedTitle.includes("chocolate")) {
      return "https://images.unsplash.com/photo-1527515545081-5db817172677?w=800&q=90";
    }
    return "https://images.unsplash.com/photo-1514517521153-1be72277b32f?w=800&q=90";
  }
  
  // Brownies
  if (normalizedCategory === "brownies" || normalizedTitle.includes("brownie")) {
    if (normalizedTitle.includes("chocolate")) {
      return "https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=800&q=90";
    }
    if (normalizedTitle.includes("fudge")) {
      return "https://images.unsplash.com/photo-1564355808853-1c8c4b518f10?w=800&q=90";
    }
    return "https://images.unsplash.com/photo-1612182062377-5f24102c00a9?w=800&q=90";
  }
  
  // Pastries
  if (normalizedCategory === "pastries" || normalizedTitle.includes("pastry") || normalizedTitle.includes("croissant")) {
    if (normalizedTitle.includes("croissant")) {
      return "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=90";
    }
    if (normalizedTitle.includes("danish")) {
      return "https://images.unsplash.com/photo-1525058035697-68c9f39e0216?w=800&q=90";
    }
    return "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=90";
  }
  
  // Muffins
  if (normalizedCategory === "muffins" || normalizedTitle.includes("muffin")) {
    if (normalizedTitle.includes("blueberry")) {
      return "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800&q=90";
    }
    if (normalizedTitle.includes("chocolate")) {
      return "https://images.unsplash.com/photo-1607434472257-d9f8e57a643d?w=800&q=90";
    }
    return "https://images.unsplash.com/photo-1607434472257-d9f8e57a643d?w=800&q=90";
  }
  
  // Bread/Loaves
  if (normalizedTitle.includes("bread") || normalizedTitle.includes("loaf")) {
    if (normalizedTitle.includes("banana")) {
      return "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&q=90";
    }
    return "https://images.unsplash.com/photo-1549931319-a545dcf3bc04?w=800&q=90";
  }
  
  // Default bakery image
  return "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&q=90";
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
