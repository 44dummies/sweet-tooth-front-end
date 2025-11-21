import { useState, useEffect } from "react";
import { Heart, Trash2, ShoppingCart, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

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
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          product_id,
          created_at,
          products!inner (
            id,
            name,
            description,
            price,
            image_url,
            category,
            in_stock,
            dietary_tags
          )
        `)
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFavorites((data as any) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
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
      toast.success(`Removed ${productName} from favorites`);
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  const addToCartFromWishlist = (product: Product) => {
    addItem({
      id: product.id,
      title: product.name,
      price: product.price,
      image: product.image_url,
    });
    toast.success(`Added ${product.name} to cart`);
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden group hover:shadow-xl transition-shadow duration-300">
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
                        <Link to={`/menu/${favorite.products.id}`}>
                          <Button variant="outline" size="icon">
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
