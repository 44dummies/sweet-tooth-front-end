import { useEffect, useState } from "react";
import MenuCard from "./MenuCard";
import { supabase } from "@/lib/supabase";
import { Package } from "lucide-react";

// Complete list of available images in assets folder
const AVAILABLE_IMAGES: Record<string, string> = {
  '2 tier cake.jpeg': new URL('../assets/2 tier cake.jpeg', import.meta.url).href,
  '3 tier cake.jpeg': new URL('../assets/3 tier cake.jpeg', import.meta.url).href,
  '4 tier cake.jpeg': new URL('../assets/4 tier cake.jpeg', import.meta.url).href,
  'banana-bread.jpg': new URL('../assets/banana-bread.jpg', import.meta.url).href,
  'birthday-cakes.jpg': new URL('../assets/birthday-cakes.jpg', import.meta.url).href,
  'browies box of 6.jpeg': new URL('../assets/browies box of 6.jpeg', import.meta.url).href,
  'brownies.jpeg': new URL('../assets/brownies.jpeg', import.meta.url).href,
  'brownies.jpg': new URL('../assets/brownies.jpg', import.meta.url).href,
  'cake pops.jpeg': new URL('../assets/cake pops.jpeg', import.meta.url).href,
  'cake-pops.jpg': new URL('../assets/cake-pops.jpg', import.meta.url).href,
  'cinnamon rolls.jpeg': new URL('../assets/cinnamon rolls.jpeg', import.meta.url).href,
  'cinnamon-rolls.jpg': new URL('../assets/cinnamon-rolls.jpg', import.meta.url).href,
  'cookie box .jpeg': new URL('../assets/cookie box .jpeg', import.meta.url).href,
  'cookie box of 12.jpeg': new URL('../assets/cookie box of 12.jpeg', import.meta.url).href,
  'cookie box of 24.jpeg': new URL('../assets/cookie box of 24.jpeg', import.meta.url).href,
  'cookies.jpg': new URL('../assets/cookies.jpg', import.meta.url).href,
  'cupcakes box of 12.jpeg': new URL('../assets/cupcakes box of 12.jpeg', import.meta.url).href,
  'cupcakes box of 6.jpeg': new URL('../assets/cupcakes box of 6.jpeg', import.meta.url).href,
  'cupcakes.jpg': new URL('../assets/cupcakes.jpg', import.meta.url).href,
  'delicious-cake-1.jpeg': new URL('../assets/delicious-cake-1.jpeg', import.meta.url).href,
  'delicious-cake-2.jpeg': new URL('../assets/delicious-cake-2.jpeg', import.meta.url).href,
  'delicious-cake-4.jpeg': new URL('../assets/delicious-cake-4.jpeg', import.meta.url).href,
  'deliciouus-cake-3.jpeg': new URL('../assets/deliciouus-cake-3.jpeg', import.meta.url).href,
  'delicous-cake-6.jpeg': new URL('../assets/delicous-cake-6.jpeg', import.meta.url).href,
  'delicous-cake-7.jpeg': new URL('../assets/delicous-cake-7.jpeg', import.meta.url).href,
  'delicous-cake-8.jpeg': new URL('../assets/delicous-cake-8.jpeg', import.meta.url).href,
  'delicous-cake-9.jpeg': new URL('../assets/delicous-cake-9.jpeg', import.meta.url).href,
  'delious cake-5.jpeg': new URL('../assets/delious cake-5.jpeg', import.meta.url).href,
  'fruit-cakes.jpg': new URL('../assets/fruit-cakes.jpg', import.meta.url).href,
  'Giant Cookie.jpeg': new URL('../assets/Giant Cookie.jpeg', import.meta.url).href,
  'heart cake.jpeg': new URL('../assets/heart cake.jpeg', import.meta.url).href,
  'hero-cake-1.jpg': new URL('../assets/hero-cake-1.jpg', import.meta.url).href,
  'hero-cake-2.jpg': new URL('../assets/hero-cake-2.jpg', import.meta.url).href,
  'hero-cake-3.jpg': new URL('../assets/hero-cake-3.jpg', import.meta.url).href,
  'letter cake.jpeg': new URL('../assets/letter cake.jpeg', import.meta.url).href,
  'loafs.jpg': new URL('../assets/loafs.jpg', import.meta.url).href,
  'mini cupcakes.jpeg': new URL('../assets/mini cupcakes.jpeg', import.meta.url).href,
  'muffins.jpg': new URL('../assets/muffins.jpg', import.meta.url).href,
  'number cake.jpeg': new URL('../assets/number cake.jpeg', import.meta.url).href,
  'pound cake.jpeg': new URL('../assets/pound cake.jpeg', import.meta.url).href,
  'round cake.jpeg': new URL('../assets/round cake.jpeg', import.meta.url).href,
  'sheet cake.jpeg': new URL('../assets/sheet cake.jpeg', import.meta.url).href,
  'square cake.jpeg': new URL('../assets/square cake.jpeg', import.meta.url).href,
};

// Intelligent image matching based on product name and category
const findBestImageMatch = (productName: string, category: string): string => {
  const normalized = productName.toLowerCase().trim();
  const normalizedCategory = category?.toLowerCase() || '';
  
  // CRITICAL: Tier cakes MUST match exactly - highest priority
  if (normalized.includes('2 tier') || normalized.includes('two tier')) {
    return AVAILABLE_IMAGES['2 tier cake.jpeg'];
  }
  if (normalized.includes('3 tier') || normalized.includes('three tier')) {
    return AVAILABLE_IMAGES['3 tier cake.jpeg'];
  }
  if (normalized.includes('4 tier') || normalized.includes('four tier')) {
    return AVAILABLE_IMAGES['4 tier cake.jpeg'];
  }
  
  // Extract key terms from product name
  const extractKeywords = (text: string): string[] => {
    return text.split(/[\s-_]+/).filter(word => 
      word.length > 2 && !['the', 'and', 'for', 'with'].includes(word)
    );
  };
  
  const productKeywords = extractKeywords(normalized);
  
  // Score each image based on keyword matches
  let bestMatch = 'delicious-cake-1.jpeg';
  let highestScore = 0;
  
  Object.keys(AVAILABLE_IMAGES).forEach(imageName => {
    let score = 0;
    const imageKeywords = extractKeywords(imageName.replace(/\.(jpg|jpeg|png)$/i, ''));
    
    // Skip tier cakes in general matching (already handled above)
    if (imageName.includes('tier')) {
      return;
    }
    
    // Exact phrase match (highest priority)
    if (imageName.toLowerCase().includes(normalized.slice(0, 15))) {
      score += 100;
    }
    
    // Keyword matching
    productKeywords.forEach(keyword => {
      imageKeywords.forEach(imgKeyword => {
        if (keyword === imgKeyword) score += 20;
        if (keyword.includes(imgKeyword) || imgKeyword.includes(keyword)) score += 10;
      });
      
      // Direct keyword in image name
      if (imageName.toLowerCase().includes(keyword)) score += 15;
    });
    
    // Category bonus
    if (imageName.toLowerCase().includes(normalizedCategory.slice(0, -1))) score += 5;
    
    // Specific pattern matching
    if (normalized.includes('box of') && imageName.includes('box of')) score += 25;
    if (normalized.match(/\d+/) && imageName.includes(normalized.match(/\d+/)?.[0] || '')) score += 20;
    if (normalized.includes('mini') && imageName.includes('mini')) score += 20;
    if (normalized.includes('giant') && imageName.includes('giant')) score += 20;
    if (normalized.includes('heart') && imageName.includes('heart')) score += 25;
    if (normalized.includes('square') && imageName.includes('square')) score += 25;
    if (normalized.includes('round') && imageName.includes('round')) score += 25;
    if (normalized.includes('letter') && imageName.includes('letter')) score += 25;
    if (normalized.includes('number') && imageName.includes('number')) score += 25;
    if (normalized.includes('sheet') && imageName.includes('sheet')) score += 25;
    if (normalized.includes('pound') && imageName.includes('pound')) score += 25;
    if (normalized.includes('birthday') && imageName.includes('birthday')) score += 25;
    if (normalized.includes('fruit') && imageName.includes('fruit')) score += 25;
    if (normalized.includes('banana') && imageName.includes('banana')) score += 25;
    if (normalized.includes('cinnamon') && imageName.includes('cinnamon')) score += 25;
    if (normalized.includes('muffin') && imageName.includes('muffin')) score += 25;
    if (normalized.includes('brownie') && imageName.includes('brownie')) score += 20;
    if (normalized.includes('cupcake') && imageName.includes('cupcake')) score += 20;
    if (normalized.includes('cookie') && imageName.includes('cookie')) score += 20;
    
    // Update best match
    if (score > highestScore) {
      highestScore = score;
      bestMatch = imageName;
    }
  });
  
  return AVAILABLE_IMAGES[bestMatch];
};

// Local product images from assets folder - Direct mapping for database paths
const getImageFromPath = (imagePath: string): string => {
  // Remove /src/assets/ prefix if present
  const fileName = imagePath.replace('/src/assets/', '').replace('../assets/', '');
  return AVAILABLE_IMAGES[fileName] || AVAILABLE_IMAGES['delicious-cake-1.jpeg'];
};

// Local product images from assets folder
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
              
              // Use database image_url if available, otherwise use intelligent matching
              let image: string;
              if (item.image_url) {
                // Convert database path to actual Vite URL
                image = getImageFromPath(item.image_url);
              } else {
                // Use intelligent matching algorithm based on product name and category
                image = findBestImageMatch(name, category || '');
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
