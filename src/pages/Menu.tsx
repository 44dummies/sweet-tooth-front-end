import { useEffect, useState } from "react";
import SidePanelNav from "@/components/SidePanelNav";
import MobileMenu from "@/components/MobileMenu";
import Footer from "@/components/Footer";
import MenuCard from "@/components/MenuCard";
import FloatingChat from "@/components/FloatingChat";
import MobileBottomNav from "@/components/MobileBottomNav";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
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
  "brownies": browniesImg,
  "cookies": cookiesImg,
  "cake-pops": cakePopsImg,
  "cupcakes": cupcakesImg,
  "banana-bread": bananaBreadImg,
  "fruitcake": fruitcakeImg,
  "birthday-cakes": birthdayCakesImg,
};

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_key?: string;
  available: boolean;
  stock_quantity: number;
}

const Menu = () => {
  const [menuItems, setMenuItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

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
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set((data || []).map(item => item.category).filter(Boolean))
      );
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <>
      {/* Mobile Version */}
      <div className="md:hidden">
        <SidePanelNav />
        <MobileMenu />
        <MobileBottomNav />
      </div>

      {/* Desktop Version */}
      <div className="hidden md:block min-h-screen pt-20 pb-0 bg-background">
        <SidePanelNav />
        
        {/* Hero Section */}
        <section className="pt-12 pb-16 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Our Menu
                </span>
              </h1>
              <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
                Explore our delicious selection of home-baked treats, made fresh daily with premium ingredients
              </p>
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 bg-background border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3 justify-center">
              <motion.button
                onClick={() => setSelectedCategory("all")}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === "all"
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                All Items
              </motion.button>
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all capitalize ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Menu Items Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-lg text-muted-foreground">Loading delicious items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">No items found in this category.</p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {filteredItems.map((item, index) => {
                  const image = imageMap[item.image_key || item.id] || cinnamonRollsImg;
                  return (
                    <motion.div
                      key={item.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <MenuCard 
                        id={item.id}
                        image={image}
                        title={item.title}
                        description={item.description}
                        price={item.price}
                        available={item.available}
                        stockQuantity={item.stock_quantity}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
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
