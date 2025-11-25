import { useState, useEffect, useCallback, useRef } from "react";
import ModernNavbar from "@/components/ModernNavbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, RefreshCw, Filter } from "lucide-react";
import { useReducedAnimations } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface CakeImage {
  id: number;
  url: string;
  title: string;
  category: string;
}

const categories = ["All", "Wedding Cake", "Birthday Cake", "Chocolate Cake", "Cupcakes", "Fruit Cake", "Cream Cake"];

// Large collection of verified working Unsplash cake images
const allCakeImages: CakeImage[] = [
  // Wedding Cakes
  { id: 1, url: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=600&q=80", title: "Elegant White Wedding Cake", category: "Wedding Cake" },
  { id: 2, url: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=600&q=80", title: "Tiered Floral Wedding Cake", category: "Wedding Cake" },
  { id: 3, url: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=600&q=80", title: "Classic White Wedding", category: "Wedding Cake" },
  { id: 4, url: "https://images.unsplash.com/photo-1522767131822-5e6e8f47f0b2?w=600&q=80", title: "Rose Gold Wedding Cake", category: "Wedding Cake" },
  { id: 5, url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", title: "Naked Wedding Cake", category: "Wedding Cake" },
  { id: 6, url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80", title: "Pink Floral Wedding", category: "Wedding Cake" },
  { id: 7, url: "https://images.unsplash.com/photo-1560180474-e8563fd75bab?w=600&q=80", title: "Rustic Wedding Cake", category: "Wedding Cake" },
  { id: 8, url: "https://images.unsplash.com/photo-1546198632-9ef6368bef12?w=600&q=80", title: "Vintage Wedding Cake", category: "Wedding Cake" },
  
  // Birthday Cakes
  { id: 9, url: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&q=80", title: "Rainbow Birthday Cake", category: "Birthday Cake" },
  { id: 10, url: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&q=80", title: "Minimalist Birthday", category: "Birthday Cake" },
  { id: 11, url: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&q=80", title: "Sprinkle Birthday Cake", category: "Birthday Cake" },
  { id: 12, url: "https://images.unsplash.com/photo-1559620192-032c4bc4674e?w=600&q=80", title: "Colorful Layer Cake", category: "Birthday Cake" },
  { id: 13, url: "https://images.unsplash.com/photo-1602351447937-745cb720612f?w=600&q=80", title: "Funfetti Birthday", category: "Birthday Cake" },
  { id: 14, url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80", title: "Pink Birthday Cake", category: "Birthday Cake" },
  { id: 15, url: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&q=80", title: "Candle Birthday Cake", category: "Birthday Cake" },
  { id: 16, url: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600&q=80", title: "Kids Birthday Cake", category: "Birthday Cake" },
  
  // Chocolate Cakes
  { id: 17, url: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&q=80", title: "Chocolate Drip Cake", category: "Chocolate Cake" },
  { id: 18, url: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&q=80", title: "Dark Chocolate Ganache", category: "Chocolate Cake" },
  { id: 19, url: "https://images.unsplash.com/photo-1578775887804-699de7086ff9?w=600&q=80", title: "Triple Chocolate Cake", category: "Chocolate Cake" },
  { id: 20, url: "https://images.unsplash.com/photo-1611293388250-580b08c4a145?w=600&q=80", title: "Chocolate Fudge Cake", category: "Chocolate Cake" },
  { id: 21, url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80", title: "Chocolate Layer Cake", category: "Chocolate Cake" },
  { id: 22, url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80", title: "Rich Chocolate Delight", category: "Chocolate Cake" },
  { id: 23, url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80", title: "Chocolate Truffle", category: "Chocolate Cake" },
  { id: 24, url: "https://images.unsplash.com/photo-1618426703623-c1b335803e07?w=600&q=80", title: "Dark Chocolate Slice", category: "Chocolate Cake" },
  
  // Cupcakes
  { id: 25, url: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&q=80", title: "Gourmet Cupcakes", category: "Cupcakes" },
  { id: 26, url: "https://images.unsplash.com/photo-1519869325930-281384150729?w=600&q=80", title: "Rainbow Cupcakes", category: "Cupcakes" },
  { id: 27, url: "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&q=80", title: "Frosted Cupcakes", category: "Cupcakes" },
  { id: 28, url: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=600&q=80", title: "Pink Frosted Cupcakes", category: "Cupcakes" },
  { id: 29, url: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&q=80", title: "Chocolate Cupcakes", category: "Cupcakes" },
  { id: 30, url: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&q=80", title: "Vanilla Cupcakes", category: "Cupcakes" },
  { id: 31, url: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=600&q=80", title: "Decorated Cupcakes", category: "Cupcakes" },
  { id: 32, url: "https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=600&q=80", title: "Strawberry Cupcakes", category: "Cupcakes" },
  
  // Fruit Cakes
  { id: 33, url: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=600&q=80", title: "Fresh Fruit Topped Cake", category: "Fruit Cake" },
  { id: 34, url: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&q=80", title: "Berry Cake", category: "Fruit Cake" },
  { id: 35, url: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80", title: "Mixed Berry Cake", category: "Fruit Cake" },
  { id: 36, url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80", title: "Tropical Fruit Cake", category: "Fruit Cake" },
  { id: 37, url: "https://images.unsplash.com/photo-1565661575885-da30e42e7e93?w=600&q=80", title: "Lemon Cake", category: "Fruit Cake" },
  { id: 38, url: "https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=600&q=80", title: "Orange Cake", category: "Fruit Cake" },
  
  // Cream Cakes
  { id: 39, url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80", title: "Classic Cheesecake", category: "Cream Cake" },
  { id: 40, url: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=600&q=80", title: "Blueberry Cheesecake", category: "Cream Cake" },
  { id: 41, url: "https://images.unsplash.com/photo-1567327613485-fbc7bf196198?w=600&q=80", title: "New York Cheesecake", category: "Cream Cake" },
  { id: 42, url: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=600&q=80", title: "Red Velvet Cream", category: "Cream Cake" },
  { id: 43, url: "https://images.unsplash.com/photo-1562440499-64c9a111f713?w=600&q=80", title: "Cream Slice", category: "Cream Cake" },
  { id: 44, url: "https://images.unsplash.com/photo-1557979619-445218f326b9?w=600&q=80", title: "Vanilla Cream Cake", category: "Cream Cake" },
  { id: 45, url: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600&q=80", title: "Whipped Cream Delight", category: "Cream Cake" },
  { id: 46, url: "https://images.unsplash.com/photo-1612809076001-73a8d91c8ec8?w=600&q=80", title: "Buttercream Art", category: "Cream Cake" },
];

// Shuffle array function
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const CakeInspo = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [likedImages, setLikedImages] = useState<number[]>([]);
  const [displayedImages, setDisplayedImages] = useState<CakeImage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const previousOrderRef = useRef<number[]>([]);
  const reduceAnimations = useReducedAnimations();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Load liked from localStorage
    const saved = localStorage.getItem('cake_inspo_likes');
    if (saved) setLikedImages(JSON.parse(saved));
    
    // Initial shuffle
    const shuffled = shuffleArray(allCakeImages);
    setDisplayedImages(shuffled);
    previousOrderRef.current = shuffled.map(img => img.id);
  }, []);

  const filteredImages = selectedCategory === "All" 
    ? displayedImages.filter(img => !imageErrors.has(img.id))
    : displayedImages.filter(img => img.category === selectedCategory && !imageErrors.has(img.id));

  const toggleLike = (id: number) => {
    setLikedImages(prev => {
      const newLikes = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('cake_inspo_likes', JSON.stringify(newLikes));
      return newLikes;
    });
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setImageErrors(new Set());
    
    // Shuffle until we get a different order
    let newShuffled = shuffleArray(allCakeImages);
    let attempts = 0;
    while (
      attempts < 5 && 
      newShuffled.slice(0, 8).map(img => img.id).join(',') === previousOrderRef.current.slice(0, 8).join(',')
    ) {
      newShuffled = shuffleArray(allCakeImages);
      attempts++;
    }
    
    previousOrderRef.current = newShuffled.map(img => img.id);
    
    setTimeout(() => {
      setDisplayedImages(newShuffled);
      setIsRefreshing(false);
      toast.success("Fresh inspiration loaded!", {
        description: "Showing cakes in a new order",
        duration: 2000,
      });
    }, 400);
  }, []);

  const handleImageError = (id: number) => {
    setImageErrors(prev => new Set([...prev, id]));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ModernNavbar />
      
      <main className="flex-1 pb-20 md:pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            className="text-center py-6 md:py-10"
            initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceAnimations ? 0 : 0.5 }}
          >
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Cake Inspiration</span>
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Get Inspired
              </span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
              Browse stunning cake designs for any occasion. Hit refresh for fresh ideas!
            </p>
          </motion.div>

          {/* Category Filter + Refresh */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Refresh Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="rounded-full gap-2 border-primary/50 hover:bg-primary/10"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? "Loading..." : "Refresh Ideas"}
              </Button>
            </div>
            
            {/* Category Pills */}
            <div className="flex flex-wrap justify-center gap-2 px-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full text-xs ${
                    selectedCategory === category 
                      ? "bg-gradient-to-r from-primary to-purple-600 border-0" 
                      : ""
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            {/* Results count */}
            <p className="text-center text-xs text-muted-foreground">
              {filteredImages.length} {filteredImages.length === 1 ? 'design' : 'designs'} found
            </p>
          </div>

          {/* Image Grid */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${selectedCategory}-${isRefreshing}`}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: reduceAnimations ? 0 : Math.min(index * 0.02, 0.3) }}
                >
                  <Card className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50">
                    <div className="aspect-square relative bg-secondary">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={() => handleImageError(image.id)}
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Like Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(image.id);
                        }}
                        className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 ${
                          likedImages.includes(image.id)
                            ? "bg-red-500 text-white scale-100"
                            : "bg-white/90 text-gray-600 opacity-0 group-hover:opacity-100 scale-90 hover:scale-100"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedImages.includes(image.id) ? "fill-current" : ""}`} />
                      </button>

                        {/* Category Badge */}
                        <div className="absolute top-2 left-2">
                          <span className="text-[10px] px-2 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm">
                            {image.category}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white text-sm font-medium truncate">{image.title}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

          {/* Empty State */}
          {!isRefreshing && filteredImages.length === 0 && (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No cakes found</p>
              <p className="text-muted-foreground mb-4">Try selecting a different category or refresh</p>
              <Button onClick={() => setSelectedCategory("All")} variant="outline">
                View All Cakes
              </Button>
            </div>
          )}

          {/* CTA Section */}
          <motion.div 
            className="mt-10 text-center bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-primary/10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-lg md:text-xl font-bold mb-2">Found Your Dream Cake?</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Save your favorites and reference them in your custom order!
            </p>
            <Button asChild className="rounded-full bg-gradient-to-r from-primary to-purple-600">
              <a href="/custom-order">Order Custom Cake</a>
            </Button>
          </motion.div>

          {/* Liked Images Summary */}
          {likedImages.length > 0 && (
            <motion.div 
              className="mt-4 p-3 bg-secondary/30 rounded-xl border border-border/50 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm text-muted-foreground">
                <Heart className="inline w-4 h-4 text-red-500 mr-1 fill-red-500" />
                You've liked <span className="font-bold text-primary">{likedImages.length}</span> designs
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CakeInspo;
