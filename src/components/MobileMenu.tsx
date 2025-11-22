import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import cinnamonRollsImg from '@/assets/cinnamon-rolls.jpg';
import browniesImg from '@/assets/brownies.jpg';
import cookiesImg from '@/assets/cookies.jpg';
import cakePopsImg from '@/assets/cake-pops.jpg';
import cupcakesImg from '@/assets/cupcakes.jpg';
import bananaBreadImg from '@/assets/banana-bread.jpg';
import fruitcakeImg from '@/assets/fruit-cakes.jpg';
import birthdayCakesImg from '@/assets/birthday-cakes.jpg';

const MobileMenu = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('available', true)
        .order('title');

      if (error) throw error;
      setProducts(data || []);
      
      const uniqueCategories = Array.from(
        new Set((data || []).map((item: any) => item.category).filter(Boolean))
      );
      setCategories(uniqueCategories as string[]);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: imageMap[product.image_key] || cinnamonRollsImg,
    });
    toast({
      title: "Added to cart",
      description: product.title,
      duration: 2000,
    });
  };

  const toggleWishlist = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
      });
      navigate('/login');
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existing) {
        await supabase.from('favorites').delete().eq('id', existing.id);
        toast({ title: "Removed from favorites", duration: 2000 });
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          product_id: productId,
        });
        toast({ title: "Added to favorites", duration: 2000 });
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const filteredProducts = products.filter(p => 
    (selectedCategory === 'all' || p.category === selectedCategory) &&
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pt-16 pb-20 relative">
      {/* Search Bar */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm px-4 py-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-accent rounded-full p-1"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="sticky top-[8.25rem] z-20 bg-background/95 backdrop-blur-sm px-4 py-2 border-b">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-secondary text-foreground'
            }`}
          >
            All
          </motion.button>
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-foreground'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product, index) => {
              const image = imageMap[product.image_key] || cinnamonRollsImg;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden border shadow-sm">
                    <div className="relative">
                      <img
                        src={image}
                        alt={product.title}
                        className="w-full h-44 object-cover"
                      />
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => toggleWishlist(product.id, e)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Heart className="w-4 h-4" />
                      </motion.button>
                      {product.stock_quantity > 0 && (
                        <Badge className="absolute bottom-2 left-2 bg-green-600 text-white text-[10px]">
                          {product.stock_quantity} left
                        </Badge>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-sm mb-1 line-clamp-1">{product.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-bold">
                          Ksh {product.price.toLocaleString()}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={product.stock_quantity === 0}
                          className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-4 h-4 text-white" />
                        </motion.button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MobileMenu;
