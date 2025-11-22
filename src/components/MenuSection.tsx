import { useEffect, useState } from "react";
import MenuCard from "./MenuCard";
import { useScrollFade } from "@/hooks/useScrollFade";
import { useMergeScroll } from "@/hooks/useMergeScroll";
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

const MenuSection = () => {
  const { ref, scrollProgress } = useScrollFade();
  const { ref: mergeRef, mergeProgress } = useMergeScroll();
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
    <section id="menu" className="relative py-20 md:py-32 bg-secondary/30 section-merge" ref={mergeRef as any}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="text-center mb-16 animate-fade-in merge-scroll"
          style={{
            opacity: 1 - scrollProgress * 0.3,
            transform: `translateY(${scrollProgress * 10}px)`,
          }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Our Menu
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our delicious selection of home-baked treats, made fresh daily with premium ingredients
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-muted-foreground">Loading menu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 merge-group" ref={ref as any}>
            {menuItems.map((item, index) => {
              const image = imageMap[item.image_key || item.id] || cinnamonRollsImg;
              return (
                <div
                  key={item.id}
                  className="animate-fade-in merge-item merge-scroll"
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                    transform: `translateY(${Math.max(0, mergeProgress - 0.3) * 30}px) scale(${0.95 + mergeProgress * 0.05})`,
                    opacity: Math.max(0.7, 1 - (1 - mergeProgress) * 0.3),
                  }}
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MenuSection;
