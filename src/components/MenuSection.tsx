import { useEffect, useState } from "react";
import MenuCard from "./MenuCard";
import { supabase } from "@/lib/supabase";
import { Package } from "lucide-react";

// Import all images statically for production builds
import tier2Cake from '../assets/2 tier cake.jpeg';
import tier3Cake from '../assets/3 tier cake.jpeg';
import tier4Cake from '../assets/4 tier cake.jpeg';
import bananaBread from '../assets/banana-bread.jpg';
import birthdayCakes from '../assets/birthday-cakes.jpg';
import browniesBox6 from '../assets/browies box of 6.jpeg';
import browniesJpeg from '../assets/brownies.jpeg';
import browniesJpg from '../assets/brownies.jpg';
import cakePopsJpeg from '../assets/cake pops.jpeg';
import cakePopsJpg from '../assets/cake-pops.jpg';
import cinnamonRollsJpeg from '../assets/cinnamon rolls.jpeg';
import cinnamonRollsJpg from '../assets/cinnamon-rolls.jpg';
import cookieBox from '../assets/cookie box .jpeg';
import cookieBox12 from '../assets/cookie box of 12.jpeg';
import cookieBox24 from '../assets/cookie box of 24.jpeg';
import cookiesJpg from '../assets/cookies.jpg';
import cupcakesBox6 from '../assets/cupcakes box of 6.jpeg';
import cupcakesBox12 from '../assets/cupcakes box of 12.jpeg';
import cupcakesBox24 from '../assets/cupcakes box of 24.jpeg';
import cupcakesJpg from '../assets/cupcakes.jpg';
import deliciousCake1 from '../assets/delicious-cake-1.jpeg';
import deliciousCake2 from '../assets/delicious-cake-2.jpeg';
import deliciousCake4 from '../assets/delicious-cake-4.jpeg';
import deliciousCake3 from '../assets/deliciouus-cake-3.jpeg';
import deliciousCake6 from '../assets/delicous-cake-6.jpeg';
import deliciousCake7 from '../assets/delicous-cake-7.jpeg';
import deliciousCake8 from '../assets/delicous-cake-8.jpeg';
import deliciousCake9 from '../assets/delicous-cake-9.jpeg';
import deliciousCake5 from '../assets/delious cake-5.jpeg';
import fruitCakes from '../assets/fruit-cakes.jpg';
import giantCookie from '../assets/Giant Cookie.jpeg';
import heartCake from '../assets/heart cake.jpeg';
import heroCake1 from '../assets/hero-cake-1.jpg';
import heroCake2 from '../assets/hero-cake-2.jpg';
import heroCake3 from '../assets/hero-cake-3.jpg';
import letterCake from '../assets/letter cake.jpeg';
import loafsJpg from '../assets/loafs.jpg';
import miniCupcakes from '../assets/mini cupcakes.jpeg';
import muffinsJpg from '../assets/muffins.jpg';
import numberCake from '../assets/number cake.jpeg';
import poundCake from '../assets/pound cake.jpeg';
import roundCake from '../assets/round cake.jpeg';
import sheetCake from '../assets/sheet cake.jpeg';
import squareCake from '../assets/square cake.jpeg';

// AI-powered smart image matching based on product name
const getSmartImage = (productName: string, category?: string): string => {
  const name = (productName || '').toLowerCase().trim();
  const cat = (category || '').toLowerCase();
  
  // ===== TIER CAKES - Highest Priority =====
  if (name.includes('2 tier') || name.includes('2-tier') || name.includes('two tier')) return tier2Cake;
  if (name.includes('3 tier') || name.includes('3-tier') || name.includes('three tier')) return tier3Cake;
  if (name.includes('4 tier') || name.includes('4-tier') || name.includes('four tier')) return tier4Cake;
  
  // ===== SPECIAL SHAPE CAKES =====
  if (name.includes('heart')) return heartCake;
  if (name.includes('letter')) return letterCake;
  if (name.includes('number') || name.includes('digit')) return numberCake;
  if (name.includes('round')) return roundCake;
  if (name.includes('square')) return squareCake;
  if (name.includes('sheet')) return sheetCake;
  if (name.includes('pound')) return poundCake;
  
  // ===== OCCASION CAKES =====
  if (name.includes('birthday')) return birthdayCakes;
  if (name.includes('fruit')) return fruitCakes;
  
  // ===== CUPCAKES =====
  if (cat === 'cupcakes' || name.includes('cupcake')) {
    if (name.includes('mini')) return miniCupcakes;
    if (name.includes('24') || name.includes('2 dozen')) return cupcakesBox24;
    if (name.includes('12') || name.includes('dozen')) return cupcakesBox12;
    if (name.includes('6') || name.includes('half')) return cupcakesBox6;
    return cupcakesJpg;
  }
  
  // ===== COOKIES =====
  if (cat === 'cookies' || name.includes('cookie')) {
    if (name.includes('giant') || name.includes('large') || name.includes('jumbo')) return giantCookie;
    if (name.includes('24') || name.includes('2 dozen')) return cookieBox24;
    if (name.includes('12') || name.includes('dozen')) return cookieBox12;
    if (name.includes('box')) return cookieBox;
    return cookiesJpg;
  }
  
  // ===== BROWNIES =====
  if (cat === 'brownies' || name.includes('brownie')) {
    if (name.includes('6') || name.includes('box')) return browniesBox6;
    return browniesJpg;
  }
  
  // ===== MUFFINS =====
  if (cat === 'muffins' || name.includes('muffin')) return muffinsJpg;
  
  // ===== BREAD & LOAVES =====
  if (name.includes('banana') && (name.includes('bread') || name.includes('loaf'))) return bananaBread;
  if (name.includes('bread') || name.includes('loaf')) return loafsJpg;
  
  // ===== CAKE POPS =====
  if (name.includes('cake pop') || name.includes('cakepop')) return cakePopsJpeg;
  
  // ===== CINNAMON ROLLS =====
  if (name.includes('cinnamon')) return cinnamonRollsJpeg;
  
  // ===== DEFAULT FOR CAKES CATEGORY =====
  if (cat === 'cakes' || name.includes('cake')) {
    // Rotate through delicious cake images based on name hash
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const cakeImages = [deliciousCake1, deliciousCake2, deliciousCake3, deliciousCake4, deliciousCake5, deliciousCake6, deliciousCake7, deliciousCake8, deliciousCake9];
    return cakeImages[hash % cakeImages.length];
  }
  
  // ===== ULTIMATE FALLBACK =====
  return deliciousCake1;
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
        .order('name');

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
              
              // ALWAYS use smart image matching based on product name (ignores database image_url)
              // This ensures images work in both development and production
              const image = getSmartImage(name, category);
              
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
