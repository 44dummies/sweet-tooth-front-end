import { useState } from "react";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Heart, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const pinterestImages = [
    {
      id: 1,
      title: "Elegant 3-Tier Wedding Cake",
      url: "https://www.pinterest.com/pin/elegant-wedding-cake--123456789/",
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500",
      category: "Wedding"
    },
    {
      id: 2,
      title: "Rainbow Birthday Cake",
      url: "https://www.pinterest.com/pin/rainbow-birthday-cake--987654321/",
      image: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=500",
      category: "Birthday"
    },
    {
      id: 3,
      title: "Floral Garden Cake",
      url: "https://www.pinterest.com/pin/floral-garden-cake--456789123/",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500",
      category: "Custom"
    },
    {
      id: 4,
      title: "Chocolate Drip Cake",
      url: "https://www.pinterest.com/pin/chocolate-drip-cake--789123456/",
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500",
      category: "Chocolate"
    },
    {
      id: 5,
      title: "Minimalist Modern Cake",
      url: "https://www.pinterest.com/pin/minimalist-cake--321654987/",
      image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=500",
      category: "Modern"
    },
    {
      id: 6,
      title: "Rustic Naked Cake",
      url: "https://www.pinterest.com/pin/rustic-naked-cake--654987321/",
      image: "https://images.unsplash.com/photo-1562440499-64c9a3f4efae?w=500",
      category: "Rustic"
    },
    {
      id: 7,
      title: "Fondant Rose Cake",
      url: "https://www.pinterest.com/pin/fondant-rose-cake--147258369/",
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500",
      category: "Elegant"
    },
    {
      id: 8,
      title: "Unicorn Fantasy Cake",
      url: "https://www.pinterest.com/pin/unicorn-cake--963852741/",
      image: "https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=500",
      category: "Kids"
    },
    {
      id: 9,
      title: "Geometric Modern Cake",
      url: "https://www.pinterest.com/pin/geometric-cake--852741963/",
      image: "https://images.unsplash.com/photo-1602351447937-745cb720612f?w=500",
      category: "Modern"
    },
    {
      id: 10,
      title: "Vintage Buttercream Cake",
      url: "https://www.pinterest.com/pin/vintage-buttercream--741963852/",
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
      category: "Vintage"
    },
    {
      id: 11,
      title: "Gold Leaf Luxury Cake",
      url: "https://www.pinterest.com/pin/gold-leaf-cake--369258147/",
      image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500",
      category: "Luxury"
    },
    {
      id: 12,
      title: "Pastel Watercolor Cake",
      url: "https://www.pinterest.com/pin/watercolor-cake--258147369/",
      image: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=500",
      category: "Artistic"
    },
  ];

  const cakeCategories = [
    { name: "All Designs", query: "custom cakes", emoji: "🎂" },
    { name: "Wedding", query: "wedding cakes elegant", emoji: "💍" },
    { name: "Birthday", query: "birthday cakes creative", emoji: "🎈" },
    { name: "Baby Shower", query: "baby shower cakes", emoji: "👶" },
    { name: "Anniversary", query: "anniversary cakes romantic", emoji: "💝" },
    { name: "Graduation", query: "graduation cakes", emoji: "🎓" },
  ];

  const filteredImages = searchQuery.trim()
    ? pinterestImages.filter(img =>
        img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pinterestImages;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Explore Cake Designs
            </h1>
            <p className="text-muted-foreground">
              Browse beautiful cake designs for inspiration
            </p>
          </div>

          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="browse">Browse Gallery</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
                <Input
                  type="text"
                  placeholder="Search cake designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={image.image}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-sm font-medium line-clamp-2">{image.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-white/80 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                              {image.category}
                            </span>
                            <button className="ml-auto p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                              <Heart className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredImages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No designs found for "{searchQuery}"</p>
                </div>
              )}

              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-semibold mb-2">Love a Design?</h3>
                    <p className="text-sm text-muted-foreground">
                      Save the image and upload it when placing your custom order
                    </p>
                  </div>
                  <button
                    onClick={() => window.location.href = '/custom-order'}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
                  >
                    Create Custom Order
                  </button>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-semibold mb-2">Browse More on Pinterest</h3>
                    <p className="text-sm text-muted-foreground">
                      Explore millions of cake design ideas
                    </p>
                  </div>
                  <a
                    href="https://www.pinterest.com/search/pins/?q=custom%20cakes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    Open Pinterest
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {cakeCategories.map((category) => (
                  <Card
                    key={category.name}
                    className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-primary/50"
                    onClick={() => {
                      window.open(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(category.query)}`, '_blank');
                    }}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                        {category.emoji}
                      </div>
                      <h3 className="font-semibold text-sm md:text-base group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-8 text-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
                <h3 className="text-xl font-semibold mb-2">Found Your Perfect Design?</h3>
                <p className="text-muted-foreground mb-4">
                  Save the image and upload it when placing your custom order
                </p>
                <button
                  onClick={() => window.location.href = '/custom-order'}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Custom Order
                </button>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Explore;
