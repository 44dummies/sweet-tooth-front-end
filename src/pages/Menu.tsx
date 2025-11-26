import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import ModernNavbar from "@/components/ModernNavbar";
import Footer from "@/components/Footer";
import MenuCard from "@/components/MenuCard";
import FloatingChat from "@/components/FloatingChat";
import { Sparkles, CalendarClock, Truck } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Import all images statically for production builds
import tier2Cake from '@/assets/2 tier cake.jpeg';
import tier3Cake from '@/assets/3 tier cake.jpeg';
import tier4Cake from '@/assets/4 tier cake.jpeg';
import bananaBread from '@/assets/banana-bread.jpg';
import birthdayCakes from '@/assets/birthday-cakes.jpg';
import browniesBox6 from '@/assets/browies box of 6.jpeg';
import browniesJpeg from '@/assets/brownies.jpeg';
import browniesJpg from '@/assets/brownies.jpg';
import cakePopsJpeg from '@/assets/cake pops.jpeg';
import cakePopsJpg from '@/assets/cake-pops.jpg';
import cinnamonRollsJpeg from '@/assets/cinnamon rolls.jpeg';
import cinnamonRollsJpg from '@/assets/cinnamon-rolls.jpg';
import cookieBox from '@/assets/cookie box .jpeg';
import cookieBox12 from '@/assets/cookie box of 12.jpeg';
import cookieBox24 from '@/assets/cookie box of 24.jpeg';
import cookiesJpg from '@/assets/cookies.jpg';
import cupcakesBox12 from '@/assets/cupcakes box of 12.jpeg';
import cupcakesBox6 from '@/assets/cupcakes box of 6.jpeg';
import cupcakesJpg from '@/assets/cupcakes.jpg';
import deliciousCake1 from '@/assets/delicious-cake-1.jpeg';
import deliciousCake2 from '@/assets/delicious-cake-2.jpeg';
import deliciousCake4 from '@/assets/delicious-cake-4.jpeg';
import deliciousCake3 from '@/assets/deliciouus-cake-3.jpeg';
import deliciousCake6 from '@/assets/delicous-cake-6.jpeg';
import deliciousCake7 from '@/assets/delicous-cake-7.jpeg';
import deliciousCake8 from '@/assets/delicous-cake-8.jpeg';
import deliciousCake9 from '@/assets/delicous-cake-9.jpeg';
import deliciousCake5 from '@/assets/delious cake-5.jpeg';
import fruitCakes from '@/assets/fruit-cakes.jpg';
import giantCookie from '@/assets/Giant Cookie.jpeg';
import heartCake from '@/assets/heart cake.jpeg';
import letterCake from '@/assets/letter cake.jpeg';
import loafsJpg from '@/assets/loafs.jpg';
import miniCupcakes from '@/assets/mini cupcakes.jpeg';
import muffinsJpg from '@/assets/muffins.jpg';
import numberCake from '@/assets/number cake.jpeg';
import poundCake from '@/assets/pound cake.jpeg';
import roundCake from '@/assets/round cake.jpeg';
import sheetCake from '@/assets/sheet cake.jpeg';
import squareCake from '@/assets/square cake.jpeg';

// Static image map for database image_url lookup
const IMAGE_MAP: Record<string, string> = {
  // Tier cakes
  '2 tier cake.jpeg': tier2Cake,
  '3 tier cake.jpeg': tier3Cake,
  '4 tier cake.jpeg': tier4Cake,
  // Shape cakes
  'heart cake.jpeg': heartCake,
  'letter cake.jpeg': letterCake,
  'number cake.jpeg': numberCake,
  'round cake.jpeg': roundCake,
  'square cake.jpeg': squareCake,
  'sheet cake.jpeg': sheetCake,
  'pound cake.jpeg': poundCake,
  // Occasion cakes
  'birthday-cakes.jpg': birthdayCakes,
  'fruit-cakes.jpg': fruitCakes,
  // Cupcakes
  'mini cupcakes.jpeg': miniCupcakes,
  'cupcakes box of 12.jpeg': cupcakesBox12,
  'cupcakes box of 6.jpeg': cupcakesBox6,
  'cupcakes.jpg': cupcakesJpg,
  // Cookies
  'Giant Cookie.jpeg': giantCookie,
  'cookie box of 24.jpeg': cookieBox24,
  'cookie box of 12.jpeg': cookieBox12,
  'cookie box .jpeg': cookieBox,
  'cookies.jpg': cookiesJpg,
  // Brownies
  'browies box of 6.jpeg': browniesBox6,
  'brownies.jpeg': browniesJpeg,
  'brownies.jpg': browniesJpg,
  // Other
  'muffins.jpg': muffinsJpg,
  'banana-bread.jpg': bananaBread,
  'loafs.jpg': loafsJpg,
  'cake pops.jpeg': cakePopsJpeg,
  'cake-pops.jpg': cakePopsJpg,
  'cinnamon rolls.jpeg': cinnamonRollsJpeg,
  'cinnamon-rolls.jpg': cinnamonRollsJpg,
  // Delicious cakes
  'delicious-cake-1.jpeg': deliciousCake1,
  'delicious-cake-2.jpeg': deliciousCake2,
  'deliciouus-cake-3.jpeg': deliciousCake3,
  'delicious-cake-4.jpeg': deliciousCake4,
  'delious cake-5.jpeg': deliciousCake5,
  'delicous-cake-6.jpeg': deliciousCake6,
  'delicous-cake-7.jpeg': deliciousCake7,
  'delicous-cake-8.jpeg': deliciousCake8,
  'delicous-cake-9.jpeg': deliciousCake9,
};

// Get image from database path or use smart matching
const getProductImage = (imageUrl: string | null | undefined, productName: string, category?: string): string => {
  // Try to use database image_url first
  if (imageUrl) {
    // Extract filename from path like "/src/assets/heart cake.jpeg"
    const fileName = imageUrl.replace(/^.*[\\\/]/, '');
    if (IMAGE_MAP[fileName]) {
      return IMAGE_MAP[fileName];
    }
  }
  
  // Fall back to smart matching based on product name
  const name = (productName || '').toLowerCase().trim();
  const cat = (category || '').toLowerCase();
  
  // Tier cakes
  if (name.includes('2 tier') || name.includes('2-tier') || name.includes('two tier')) return tier2Cake;
  if (name.includes('3 tier') || name.includes('3-tier') || name.includes('three tier')) return tier3Cake;
  if (name.includes('4 tier') || name.includes('4-tier') || name.includes('four tier')) return tier4Cake;
  
  // Shape cakes
  if (name.includes('heart')) return heartCake;
  if (name.includes('letter')) return letterCake;
  if (name.includes('number') || name.includes('digit')) return numberCake;
  if (name.includes('round')) return roundCake;
  if (name.includes('square')) return squareCake;
  if (name.includes('sheet')) return sheetCake;
  if (name.includes('pound')) return poundCake;
  
  // Occasion cakes
  if (name.includes('birthday')) return birthdayCakes;
  if (name.includes('fruit')) return fruitCakes;
  
  // Cupcakes
  if (cat === 'cupcakes' || name.includes('cupcake')) {
    if (name.includes('mini')) return miniCupcakes;
    if (name.includes('12') || name.includes('dozen')) return cupcakesBox12;
    if (name.includes('6') || name.includes('half')) return cupcakesBox6;
    return cupcakesJpg;
  }
  
  // Cookies
  if (cat === 'cookies' || name.includes('cookie')) {
    if (name.includes('giant') || name.includes('large') || name.includes('jumbo')) return giantCookie;
    if (name.includes('24') || name.includes('2 dozen')) return cookieBox24;
    if (name.includes('12') || name.includes('dozen')) return cookieBox12;
    if (name.includes('box')) return cookieBox;
    return cookiesJpg;
  }
  
  // Brownies
  if (cat === 'brownies' || name.includes('brownie')) {
    if (name.includes('6') || name.includes('box')) return browniesBox6;
    return browniesJpg;
  }
  
  // Muffins
  if (cat === 'muffins' || name.includes('muffin')) return muffinsJpg;
  
  // Bread
  if (name.includes('banana') && (name.includes('bread') || name.includes('loaf'))) return bananaBread;
  if (name.includes('bread') || name.includes('loaf')) return loafsJpg;
  
  // Cake pops
  if (name.includes('cake pop') || name.includes('cakepop')) return cakePopsJpeg;
  
  // Cinnamon rolls
  if (name.includes('cinnamon')) return cinnamonRollsJpeg;
  
  // Default for cakes
  if (cat === 'cakes' || name.includes('cake')) {
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const cakeImages = [deliciousCake1, deliciousCake2, deliciousCake3, deliciousCake4, deliciousCake5, deliciousCake6, deliciousCake7, deliciousCake8, deliciousCake9];
    return cakeImages[hash % cakeImages.length];
  }
  
  return deliciousCake1;
};

const LARGE_CAKE_KEYWORDS = ["wedding", "tier", "custom", "anniversary", "birthday", "per kg"];

const getLeadTimeDays = (category?: string, title?: string) => {
  const normalizedCategory = (category || "").toLowerCase();
  const normalizedTitle = (title || "").toLowerCase();
  const isLargeCake =
    normalizedCategory === "wedding" ||
    (normalizedCategory === "cakes" && LARGE_CAKE_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword))) ||
    LARGE_CAKE_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword));

  return isLargeCake ? 3 : 2;
};

const normalizeProduct = (item: any): Product => {
  const title = item.name || item.title || "Unnamed Product";
  const category = item.category || "other";
  const id = item.id || `${title}-${category}`.toLowerCase().replace(/\s+/g, '-');


  let flavorOptions: string[] = [];
  if (item.flavor_options) {
    try {
      flavorOptions = typeof item.flavor_options === 'string'
        ? JSON.parse(item.flavor_options)
        : item.flavor_options;
    } catch {
      flavorOptions = [];
    }
  }

  return {
    id,
    title,
    description: item.description || "",
    price: item.price || 0,
    category,
    image_key: (item.image_key || title).toLowerCase().replace(/\s+/g, '-'),
    image_url: item.image_url || null,
    available: item.in_stock !== false && item.available !== false,
    leadTimeDays: getLeadTimeDays(category, title),
    hasVariants: item.has_variants || false,
    variantType: item.variant_type || 'flavor',
    flavorOptions,
  };
};

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_key?: string;
  image_url?: string | null;
  available: boolean;
  leadTimeDays: number;
  hasVariants: boolean;
  variantType: string;
  flavorOptions: string[];
}

const Menu = () => {
  const [menuItems, setMenuItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    console.log('🔍 Fetching products from Supabase...');

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Error fetching products:', error.message);
        setMenuItems([]);
      } else if (data && data.length > 0) {
        console.log(`✅ Found ${data.length} products in database`);

        const products: Product[] = data
          .map((item) => normalizeProduct(item))
          .filter((product) => product.available);

        setMenuItems(products);
      } else {
        console.log('⚠️ No products in database');
        setMenuItems([]);
      }
    } catch (err) {
      console.error('💥 Failed to fetch products:', err);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  return (
    <>
      {}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 origin-left z-50"
        style={{ scaleX }}
      />

      {}
      <div className="min-h-screen pb-0 bg-background relative">
        <ModernNavbar />

        {}
        <motion.section
          className="pt-12 pb-16 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20 overflow-hidden relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-20 left-10 w-72 h-72 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -30, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/50 dark:bg-black/30 backdrop-blur-sm border border-pink-200 dark:border-pink-800"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              >
                <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">
                  Fresh Daily • Premium Quality
                </span>
              </motion.div>

              <motion.h1
                className="text-7xl font-bold mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Our Menu
                </span>
              </motion.h1>

              <motion.p
                className="text-2xl text-muted-foreground max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Explore our delicious selection of home-baked treats, made fresh daily with premium ingredients
              </motion.p>
            </motion.div>
          </div>
        </motion.section>

        {}
        <motion.section
          className="py-10 bg-background"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <div className="p-6 rounded-3xl border bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-muted-foreground">Delivery Timelines</p>
                    <h3 className="text-2xl font-semibold mt-1">Crafted fresh, delivered on schedule</h3>
                    <p className="text-sm mt-3 text-muted-foreground max-w-2xl">
                      Every treat is baked to order. Large custom cakes need a touch more time for perfection, while everyday delights are ready lightning-fast.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border text-center">
                      <p className="text-xs text-muted-foreground inline-flex items-center gap-2 justify-center">
                        <Sparkles className="w-3 h-3" /> Large cakes
                      </p>
                      <p className="text-3xl font-bold">3<span className="text-base font-medium"> days</span></p>
                      <p className="text-[11px] text-muted-foreground">Wedding & custom tiers</p>
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border text-center">
                      <p className="text-xs text-muted-foreground inline-flex items-center gap-2 justify-center">
                        <Truck className="w-3 h-3" /> Treat boxes
                      </p>
                      <p className="text-3xl font-bold">2<span className="text-base font-medium"> days</span></p>
                      <p className="text-[11px] text-muted-foreground">Cupcakes, pastries & more</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-3xl border bg-card shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <CalendarClock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-widest text-muted-foreground">Heads-up</p>
                  <p className="text-base font-semibold">Delivery window starts after prep time.</p>
                  <p className="text-sm text-muted-foreground">Our concierge team confirms your slot via WhatsApp or email once the order is locked in.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="mt-4 text-lg text-muted-foreground">Loading delicious items...</p>
              </motion.div>
            ) : menuItems.length === 0 ? (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-xl text-muted-foreground mb-4">
                  No products found. Check browser console (F12) for debug info.
                </p>
                <div className="text-sm text-muted-foreground space-y-2 max-w-md mx-auto text-left bg-muted/50 p-4 rounded-lg">
                  <p><strong>Troubleshooting:</strong></p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open browser console (F12 → Console tab)</li>
                    <li>Look for error messages starting with ❌ or 💥</li>
                    <li>If you see "No products in database", run the SQL seed in Supabase</li>
                    <li>If you see RLS or permission errors, check your Supabase policies</li>
                  </ol>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {menuItems.map((item) => {
                  // Use database image_url with smart fallback matching
                  const image = getProductImage(item.image_url, item.title, item.category);
                  return (
                    <div key={item.id}>
                      <MenuCard
                        id={item.id}
                        image={image}
                        title={item.title}
                        description={item.description}
                        price={item.price}
                        available={item.available}
                        leadTimeDays={item.leadTimeDays}
                        hasVariants={item.hasVariants}
                        variantType={item.variantType}
                        flavorOptions={item.flavorOptions}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <Footer />
        <FloatingChat />
      </div>
    </>
  );
};

export default Menu;
