import { useState, useEffect, useCallback } from "react";
import SidePanelNav from "@/components/SidePanelNav";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CakeImage {
  id: string;
  title: string;
  url: string;
  image: string;
  category: string;
  photographer?: string;
}

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("whole complete full cakes decoration");
  const [images, setImages] = useState<CakeImage[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchImages = useCallback(async (query: string, pageNum: number) => {
    setLoading(true);
    try {
      // Enhanced query to get full cake images, not slices
      const enhancedQuery = `${query} whole full complete cake dessert decoration design -slice`;
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(enhancedQuery)}&page=${pageNum}&per_page=30&client_id=your_access_key&orientation=squarish`,
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
      fetchImages(searchQuery || "whole complete full cakes", page);
    }
  }, [page, searchQuery, fetchImages]);

  const handleSearchSubmit = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPage(1);
    setImages([]);
    fetchImages(searchQuery, 1);
  };

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-20 pb-20 md:pb-8">
      <SidePanelNav />
      
      <main className="container mx-auto px-4 pt-4 md:pt-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Explore Cake Designs
            </h1>
            <p className="text-muted-foreground">
              Browse thousands of beautiful cake designs from around the internet
            </p>
          </div>

          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
              <Input
                type="text"
                placeholder="Search for wedding cakes, birthday cakes, decorations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Image Grid */}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-sm font-medium line-clamp-2">{image.title}</p>
                        {image.photographer && (
                          <p className="text-xs text-white/60 mt-1">Photo by {image.photographer}</p>
                        )}
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
                    Explore millions of cake design ideas from around the world
                  </p>
                </div>
                <a
                  href="https://www.pinterest.com/search/pins/?q=custom%20cakes%20whole%20full"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  Open Pinterest
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Explore;
