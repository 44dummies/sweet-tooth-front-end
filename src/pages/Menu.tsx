import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import ModernNavbar from "@/components/ModernNavbar";
import Footer from "@/components/Footer";
import MenuCard from "@/components/MenuCard";
import FloatingChat from "@/components/FloatingChat";
import { Sparkles, CalendarClock, Truck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import cinnamonRollsImg from "@/assets/cinnamon-rolls.jpg";
import browniesImg from "@/assets/brownies.jpg";
import cookiesImg from "@/assets/cookies.jpg";
import cakePopsImg from "@/assets/cake-pops.jpg";
import cupcakesImg from "@/assets/cupcakes.jpg";
import bananaBreadImg from "@/assets/banana-bread.jpg";
import fruitcakeImg from "@/assets/fruit-cakes.jpg";
import birthdayCakesImg from "@/assets/birthday-cakes.jpg";

const imageMap: Record<string, string> = {
  "cinnamon-rolls": cinnamonRollsImg,
  "cinnamon rolls": cinnamonRollsImg,
  "brownies": browniesImg,
  "cookies": cookiesImg,
  "cake-pops": cakePopsImg,
  "cake pops": cakePopsImg,
  "cupcakes": cupcakesImg,
  "banana-bread": bananaBreadImg,
  "banana bread": bananaBreadImg,
  "fruitcake": fruitcakeImg,
  "birthday-cakes": birthdayCakesImg,
  "birthday cakes": birthdayCakesImg,
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

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
    console.log('🔗 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

    try {

      const { data, error, status, statusText } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📦 Supabase response:', { data, error, status, statusText });

      if (error) {
        console.error('❌ Error fetching products:', error.message, error.details, error.hint, error.code);

        setMenuItems([]);
        setCategories([]);
      } else if (data && data.length > 0) {
        console.log(`✅ Found ${data.length} products in database`);
        console.log('📦 Raw first product:', data[0]);

        const products: Product[] = data
          .map((item) => normalizeProduct(item))
          .filter((product) => product.available);

        console.log('📋 Mapped products count:', products.length);
        console.log('📋 First mapped product:', products[0]);
        setMenuItems(products);


        const uniqueCategories = Array.from(
          new Set(products.map(item => item.category).filter(Boolean))
        ) as string[];
        console.log('🏷️ Categories found:', uniqueCategories);
        setCategories(uniqueCategories);
      } else {
        console.log('⚠️ No products in database. Status:', status);
        setMenuItems([]);
        setCategories([]);
      }
    } catch (err) {
      console.error('💥 Failed to fetch products:', err);
      setMenuItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === "all"
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);


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
        <motion.section
          className="py-8 bg-background border-b sticky top-20 z-40 backdrop-blur-lg bg-background/80"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3 justify-center">
              <motion.button
                onClick={() => setSelectedCategory("all")}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === "all"
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                All Items
              </motion.button>
              {categories.map((category, index) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all capitalize ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + (index * 0.05) }}
                >
                  {category}
                </motion.button>
              ))}
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
            ) : filteredItems.length === 0 ? (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-xl text-muted-foreground mb-4">
                  {menuItems.length === 0
                    ? "No products found. Check browser console (F12) for debug info."
                    : "No items match this category just yet."}
                </p>
                {menuItems.length === 0 && (
                  <div className="text-sm text-muted-foreground space-y-2 max-w-md mx-auto text-left bg-muted/50 p-4 rounded-lg">
                    <p><strong>Troubleshooting:</strong></p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Open browser console (F12 → Console tab)</li>
                      <li>Look for error messages starting with ❌ or 💥</li>
                      <li>If you see "No products in database", run the SQL seed in Supabase</li>
                      <li>If you see RLS or permission errors, check your Supabase policies</li>
                    </ol>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredItems.map((item) => {
                  const image = item.image_url || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80";
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
