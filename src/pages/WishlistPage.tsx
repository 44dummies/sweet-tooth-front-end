import { useState, useEffect } from "react";
import { Heart, Trash2, ShoppingCart, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ModernNavbar from "@/components/ModernNavbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
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
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  in_stock: boolean;
  dietary_tags?: string[];
}

interface Favorite {
  id: string;
  product_id: string;
  created_at: string;
  products: Product;
}

const WishlistPage = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchFavorites();
    }
  }, [user?.email]);

  const fetchFavorites = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {

      const { data: favoritesData, error: favError } = await supabase
        .from('favorites')
        .select('id, product_id, created_at')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });

      if (favError) throw favError;

      if (!favoritesData || favoritesData.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }


      const productIds = favoritesData.map(fav => fav.product_id);
      const { data: productsData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (prodError) throw prodError;


      const combinedData = favoritesData.map(fav => {
        const product = productsData?.find(p => p.id === fav.product_id);
        return {
          id: fav.id,
          product_id: fav.product_id,
          created_at: fav.created_at,
          products: product ? {
            id: product.id,
            name: product.title || product.name,
            description: product.description,
            price: product.price,
            image_url: imageMap[product.image_key || product.id] || cinnamonRollsImg,
            category: product.category,
            in_stock: product.available && product.stock_quantity > 0,
            dietary_tags: product.dietary_tags || []
          } : null
        };
      }).filter(item => item.products !== null);

      setFavorites(combinedData as any);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites', { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string, productName: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      toast.success(`Removed ${productName} from favorites`, { duration: 3000 });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites', { duration: 3000 });
    }
  };

  const addToCartFromWishlist = (product: Product) => {
    const imageUrl = imageMap[product.id] || cinnamonRollsImg;
    addItem({
      id: product.id,
      title: product.name,
      price: product.price,
      image: imageUrl,
    });
    toast.success(`Added ${product.name} to cart`, { duration: 3000 });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <Card className="p-8 max-w-md text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-6">
            Please login to view your saved favorites
          </p>
          <Link to="/login">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 pb-20 md:pb-12 px-3 md:px-4 overflow-x-hidden relative" style={{ scrollBehavior: 'smooth' }}>
      <ModernNavbar />
      <div className="max-w-6xl mx-auto pt-4 md:pt-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2 md:gap-3">
            <Heart className="w-6 h-6 md:w-8 md:h-8 text-red-500 fill-current animate-pulse" />
            My Wishlist
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="bg-muted rounded-lg h-48 mb-4" />
                <div className="bg-muted h-6 rounded mb-2" />
                <div className="bg-muted h-4 rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-24 h-24 mx-auto mb-6 text-muted-foreground opacity-20" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding your favorite items to save them for later!
            </p>
            <Link to="/#menu">
              <Button>Browse Menu</Button>
            </Link>
          </Card>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {favorites.map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="relative">
                      <img
                        src={favorite.products.image_url}
                        alt={favorite.products.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {!favorite.products.in_stock && (
                        <Badge
                          variant="destructive"
                          className="absolute top-2 left-2"
                        >
                          Out of Stock
                        </Badge>
                      )}

                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFavorite(favorite.id, favorite.products.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="p-6">
                      <div className="mb-2">
                        <Badge variant="secondary" className="mb-2">
                          {favorite.products.category}
                        </Badge>
                        <h3 className="text-xl font-semibold mb-2">
                          {favorite.products.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {favorite.products.description}
                        </p>
                      </div>

                      {favorite.products.dietary_tags && favorite.products.dietary_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {favorite.products.dietary_tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-primary">
                          Ksh {favorite.products.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Added {new Date(favorite.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => addToCartFromWishlist(favorite.products)}
                          disabled={!favorite.products.in_stock}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Link to="/menu">
                          <Button variant="outline" size="icon" title="View in menu">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {favorites.length > 0 && (
          <div className="mt-8 text-center">
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <h3 className="font-semibold mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-muted-foreground">
                Items in your wishlist are saved to your account. You can access them from any device!
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
