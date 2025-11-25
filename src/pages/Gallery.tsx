import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModernNavbar from "@/components/ModernNavbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

const Gallery = () => {
  const galleryImages = [
    { id: 1, name: "delicious-cake-1.jpeg", alt: "Beautiful layered chocolate cake" },
    { id: 2, name: "delicious-cake-2.jpeg", alt: "Vanilla birthday cake with flowers" },
    { id: 3, name: "deliciouus-cake-3.jpeg", alt: "Red velvet cake slice" },
    { id: 4, name: "delicious-cake-4.jpeg", alt: "Strawberry shortcake" },
    { id: 5, name: "delious cake-5.jpeg", alt: "Custom wedding cake" },
    { id: 6, name: "delicous-cake-6.jpeg", alt: "Chocolate truffle cake" },
    { id: 7, name: "delicous-cake-7.jpeg", alt: "Fruit tart assortment" },
    { id: 8, name: "delicous-cake-8.jpeg", alt: "Cupcake collection" },
    { id: 9, name: "delicous-cake-9.jpeg", alt: "Tiramisu cake" },
  ];

  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const selectedImage = galleryImages.find((img) => img.id === selectedImageId);
  const selectedIndex = galleryImages.findIndex((img) => img.id === selectedImageId);

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedImageId(galleryImages[selectedIndex - 1].id);
    } else {
      setSelectedImageId(galleryImages[galleryImages.length - 1].id);
    }
  };

  const handleNext = () => {
    if (selectedIndex < galleryImages.length - 1) {
      setSelectedImageId(galleryImages[selectedIndex + 1].id);
    } else {
      setSelectedImageId(galleryImages[0].id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0 relative">
      <ModernNavbar />
      <main className="flex-1 pt-4 md:pt-8 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Our Gallery
              </span>
            </motion.h1>
            <motion.p
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Explore our collection of beautiful handcrafted cakes and pastries
            </motion.p>
          </motion.div>

          {}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {galleryImages.map((image, index) => (
              <motion.div
                key={image.id}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.9 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 100
                    }
                  }
                }}
                whileHover={{ y: -8 }}
              >
                <Card
                  className="overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-primary/30"
                  onClick={() => setSelectedImageId(image.id)}
                >
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <img
                      src={new URL(`../assets/${image.name}`, import.meta.url).href}
                      alt={image.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='18' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3EImage not found%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="bg-white/90 dark:bg-black/90 rounded-full p-4 backdrop-blur-sm">
                        <ZoomIn className="w-8 h-8 text-primary" />
                      </div>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {}
      <Dialog open={selectedImageId !== null} onOpenChange={(open) => {
        if (!open) setSelectedImageId(null);
      }}>
        <DialogContent className="max-w-4xl p-0 bg-black border-0">
          <DialogDescription className="sr-only">Image gallery viewer</DialogDescription>
          <div className="relative w-full h-[600px] flex items-center justify-center">
            {selectedImage && (
              <>
                <img
                  src={new URL(`../assets/${selectedImage.name}`, import.meta.url).href}
                  alt={selectedImage.alt}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect fill='%23374151' width='600' height='600'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23d1d5db' text-anchor='middle' dominant-baseline='middle'%3EImage not found%3C/text%3E%3C/svg%3E";
                  }}
                />

                {}
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors duration-200 z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors duration-200 z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {}
                <button
                  onClick={() => setSelectedImageId(null)}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors duration-200 z-10"
                  aria-label="Close gallery"
                >
                  <X className="w-6 h-6" />
                </button>

                {}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                  {selectedIndex + 1} / {galleryImages.length}
                </div>

                {}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded text-sm text-center">
                  {selectedImage.alt}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Gallery;
