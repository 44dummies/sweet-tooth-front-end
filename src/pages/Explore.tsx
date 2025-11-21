import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

declare global {
  interface Window {
    PinUtils?: {
      build: () => void;
    };
  }
}

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("custom cakes");
  const [pinterestLoaded, setPinterestLoaded] = useState(false);

  useEffect(() => {
    if (!pinterestLoaded) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://assets.pinterest.com/js/pinit.js';
      script.onload = () => setPinterestLoaded(true);
      document.body.appendChild(script);
    }
  }, [pinterestLoaded]);

  const handleSearch = () => {
    if (pinterestLoaded && searchQuery.trim()) {
      const pinterestEmbeds = document.querySelectorAll('[data-pin-do="embedBoard"]');
      pinterestEmbeds.forEach(embed => {
        if (window.PinUtils) {
          window.PinUtils.build();
        }
      });
    }
  };

  const pinterestBoards = [
    {
      name: "Custom Cakes",
      url: "https://www.pinterest.com/search/pins/?q=custom%20cakes",
      boardUrl: "https://www.pinterest.com/ideas/cake-decorating/906801653714/",
      description: "Beautiful custom cake designs"
    },
    {
      name: "Wedding Cakes",
      url: "https://www.pinterest.com/search/pins/?q=wedding%20cakes",
      boardUrl: "https://www.pinterest.com/ideas/wedding-cakes/906801653790/",
      description: "Elegant wedding cake inspiration"
    },
    {
      name: "Birthday Cakes",
      url: "https://www.pinterest.com/search/pins/?q=birthday%20cakes",
      boardUrl: "https://www.pinterest.com/ideas/birthday-cake/906801653638/",
      description: "Creative birthday cake ideas"
    },
    {
      name: "Cupcakes",
      url: "https://www.pinterest.com/search/pins/?q=cupcake%20designs",
      boardUrl: "https://www.pinterest.com/ideas/cupcakes/906801653646/",
      description: "Adorable cupcake decorations"
    },
  ];

  const cakeCategories = [
    { name: "Wedding Cakes", query: "wedding cakes elegant", emoji: "💍" },
    { name: "Birthday Cakes", query: "birthday cakes creative", emoji: "🎂" },
    { name: "Baby Shower", query: "baby shower cakes", emoji: "👶" },
    { name: "Anniversary", query: "anniversary cakes romantic", emoji: "💝" },
    { name: "Graduation", query: "graduation cakes", emoji: "🎓" },
    { name: "Themed Cakes", query: "themed cakes unique", emoji: "🎨" },
  ];

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
              Find inspiration for your perfect custom cake
            </p>
          </div>

          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="browse">Browse Designs</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
                <Input
                  type="text"
                  placeholder="Search cake designs on Pinterest..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-12 text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pinterestBoards.map((board) => (
                  <Card key={board.name} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{board.name}</h3>
                          <p className="text-sm text-muted-foreground">{board.description}</p>
                        </div>
                        <a
                          href={board.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      
                      <div className="aspect-video bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-lg flex items-center justify-center relative overflow-hidden">
                        <a
                          data-pin-do="embedBoard"
                          data-pin-board-width="400"
                          data-pin-scale-height="240"
                          data-pin-scale-width="80"
                          href={board.boardUrl}
                          className="absolute inset-0"
                        ></a>
                        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-background/30 group-hover:opacity-0 transition-opacity duration-300">
                          <p className="text-sm font-medium">Click to view Pinterest board</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Search Pinterest Directly</h3>
                    <p className="text-sm text-muted-foreground">
                      Browse millions of cake design ideas on Pinterest
                    </p>
                  </div>
                  <a
                    href={`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(searchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    Open in Pinterest
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
