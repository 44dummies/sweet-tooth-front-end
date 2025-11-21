import { useState } from "react";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const inspirationSources = [
    {
      name: "Pinterest Cakes",
      url: "https://www.pinterest.com/search/pins/?q=custom%20cakes",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
      description: "Browse thousands of cake designs"
    },
    {
      name: "Instagram Bakeries",
      url: "https://www.instagram.com/explore/tags/customcakes/",
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400",
      description: "Latest trending cake designs"
    },
    {
      name: "Cake Decorating Ideas",
      url: "https://www.google.com/search?q=custom+cake+designs&tbm=isch",
      image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400",
      description: "Google image search for cakes"
    },
    {
      name: "Wedding Cakes",
      url: "https://www.theknot.com/wedding-cakes",
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400",
      description: "Elegant wedding cake designs"
    },
    {
      name: "Birthday Cake Ideas",
      url: "https://www.google.com/search?q=birthday+cake+designs&tbm=isch",
      image: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400",
      description: "Fun birthday cake inspirations"
    },
    {
      name: "Cake Boss Designs",
      url: "https://www.tlc.com/shows/cake-boss",
      image: "https://images.unsplash.com/photo-1562440499-64c9a3f4efae?w=400",
      description: "Professional cake artistry"
    },
  ];

  const filteredSources = inspirationSources.filter(source =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Explore Cake Designs</h1>
          <p className="text-muted-foreground mb-6">
            Find inspiration for your custom cake from top bakeries and designers
          </p>

          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search cake styles, themes, occasions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredSources.map((source) => (
              <Card
                key={source.name}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => window.open(source.url, '_blank')}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={source.image}
                    alt={source.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{source.name}</h3>
                  <p className="text-sm text-muted-foreground">{source.description}</p>
                </div>
              </Card>
            ))}
          </div>

          {filteredSources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Explore;
