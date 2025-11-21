import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Heart, ExternalLink, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CakeImage {
  id: string;
  title: string;
  url: string;
  image: string;
  category: string;
  photographer?: string;
}

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("cakes");
  const [images, setImages] = useState<CakeImage[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchImages = useCallback(async (query: string, pageNum: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${pageNum}&per_page=30&client_id=your_access_key`,
        {
          headers: {
            'Authorization': 'Client-ID RJPLm3G4yhiK7f3Vu6tqLnfqz-g2d6lMQs1nFOsE0Po'
          }
        }
      );
      
      if (!response.ok) {
        const fallbackImages = generateFallbackImages(pageNum, query);
        setImages(prev => pageNum === 1 ? fallbackImages : [...prev, ...fallbackImages]);
        setHasMore(pageNum < 10);
        return;
      }

      const data = await response.json();
      const newImages: CakeImage[] = data.results.map((photo: any) => ({
        id: photo.id,
        title: photo.alt_description || photo.description || `Beautiful ${query}`,
        url: photo.links.html,
        image: photo.urls.regular,
        category: query,
        photographer: photo.user.name
      }));

      setImages(prev => pageNum === 1 ? newImages : [...prev, ...newImages]);
      setHasMore(data.results.length > 0 && pageNum < data.total_pages);
    } catch (error) {
      console.error('Error fetching images:', error);
      const fallbackImages = generateFallbackImages(pageNum, query);
      setImages(prev => pageNum === 1 ? fallbackImages : [...prev, ...fallbackImages]);
      setHasMore(pageNum < 10);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateFallbackImages = (pageNum: number, category: string): CakeImage[] => {
    const categoryMap: { [key: string]: string[] } = {
      "Wedding": [
        "photo-1519225421980-715cb0215aed",
        "photo-1464349095431-e9a21285b5f3",
        "photo-1535254973040-607b474cb50d",
        "photo-1621303837174-89787a7d4729",
        "photo-1606890737304-57a1ca8a5b62",
        "photo-1600002415506-dd06090d3480"
      ],
      "Birthday": [
        "photo-1558636508-e0db3814bd1d",
        "photo-1578985545062-69928b1d9587",
        "photo-1557925923-cd4648e211a0",
        "photo-1595295333158-4742f28fbd85",
        "photo-1612182062366-8e0b3151d1a8"
      ],
      "Baby Shower": [
        "photo-1542826438-bd32f43d626f",
        "photo-1563729784474-d77dbb933a9e",
        "photo-1587241321921-91a834d6d191",
        "photo-1603532648955-039310d9ed75"
      ],
      "Anniversary": [
        "photo-1586985289688-ca3cf47d3e6e",
        "photo-1488477181946-6428a0291777",
        "photo-1614707267537-b85aaf00c4b7",
        "photo-1576717585940-08317b57e8a7"
      ],
      "Graduation": [
        "photo-1602351447937-745cb720612f",
        "photo-1571115177098-24ec42ed204d",
        "photo-1486427944299-d1955d23e34d",
        "photo-1612201142855-7873f715d8c5"
      ],
      "cakes": [
        "photo-1562440499-64c9a3f4efae",
        "photo-1606313564200-e75d5e30476c",
        "photo-1584182812719-fa23bcc09e0a",
        "photo-1565958011703-44f9829ba187"
      ]
    };

    const imagesToUse = categoryMap[category] || categoryMap["cakes"];
    const randomSeed = pageNum * Date.now();
    
    return Array.from({ length: 30 }, (_, i) => {
      const randomIndex = (randomSeed + i) % imagesToUse.length;
      const imageId = imagesToUse[randomIndex];
      const cacheBuster = `${Date.now()}-${pageNum}-${i}`;
      
      return {
        id: `${pageNum}-${i}-${cacheBuster}`,
        title: `Beautiful ${category} Cake Design ${i + 1}`,
        url: `https://www.pinterest.com/pin/cake-${randomIndex}/`,
        image: `https://images.unsplash.com/${imageId}?w=500&q=80&t=${cacheBuster}`,
        category: category
      };
    });
  };

  useEffect(() => {
    fetchImages(searchQuery || "cakes", 1);
    setPage(1);
  }, [searchQuery, fetchImages]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 500
      ) {
        if (!loading && hasMore) {
          setPage(prev => prev + 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  useEffect(() => {
    if (page > 1) {
      fetchImages(searchQuery || "cakes", page);
    }
  }, [page, searchQuery, fetchImages]);

  const cakeCategories = [
    { name: "All Designs", query: "cakes", emoji: "🎂" },
    { name: "Wedding", query: "Wedding", emoji: "💍" },
    { name: "Birthday", query: "Birthday", emoji: "🎈" },
    { name: "Baby Shower", query: "Baby Shower", emoji: "👶" },
    { name: "Anniversary", query: "Anniversary", emoji: "💝" },
    { name: "Graduation", query: "Graduation", emoji: "🎓" },
  ];

  const handleCategoryClick = (query: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSearchQuery(query);
    setPage(1);
    setImages([]);
  };

  const handleSearchSubmit = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPage(1);
    setImages([]);
  };

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
                  placeholder="Search millions of cake designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  className="pl-10 h-12 text-base"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <Card key={image.id} className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
                    onClick={() => window.open(image.url, '_blank')}>
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={image.image}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-sm font-medium line-clamp-2">{image.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-white/80 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                              {image.category}
                            </span>
                            {image.photographer && (
                              <span className="text-xs text-white/60">by {image.photographer}</span>
                            )}
                            <button 
                              className="ml-auto p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Heart className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {loading && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="ml-3 text-muted-foreground">Loading more designs...</p>
                </div>
              )}

              {!loading && images.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No designs found. Try a different search term.</p>
                </div>
              )}

              {!loading && !hasMore && images.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You've reached the end of results</p>
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
                    onClick={() => handleCategoryClick(category.query)}
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
