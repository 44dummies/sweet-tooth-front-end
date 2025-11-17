import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const Gallery = () => {
  const galleryImages = [
    { id: 1, name: "delicious-cake-1.jpg", alt: "Beautiful layered chocolate cake" },
    { id: 2, name: "delicious-cake-2.jpg", alt: "Vanilla birthday cake with flowers" },
    { id: 3, name: "delicious-cake-3.jpg", alt: "Red velvet cake slice" },
    { id: 4, name: "delicious-cake-4.jpg", alt: "Strawberry shortcake" },
    { id: 5, name: "delicious-cake-5.jpg", alt: "Custom wedding cake" },
    { id: 6, name: "delicious-cake-6.jpg", alt: "Chocolate truffle cake" },
    { id: 7, name: "delicious-cake-7.jpg", alt: "Fruit tart assortment" },
    { id: 8, name: "delicious-cake-8.jpg", alt: "Cupcake collection" },
    { id: 9, name: "delicious-cake-9.jpg", alt: "Tiramisu cake" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Gallery
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of beautiful handcrafted cakes and pastries
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image) => (
              <Card
                key={image.id}
                className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-square bg-muted relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <p className="text-muted-foreground text-sm text-center px-4">
                      {image.name}
                      <br />
                      <span className="text-xs opacity-70">
                        Replace with your image
                      </span>
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    {image.alt}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
