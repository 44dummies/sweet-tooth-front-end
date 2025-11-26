import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModernNavbar from "@/components/ModernNavbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

// Import all gallery images statically for production builds
import tier2Cake from '@/assets/2 tier cake.jpeg';
import tier3Cake from '@/assets/3 tier cake.jpeg';
import tier4Cake from '@/assets/4 tier cake.jpeg';
import poundCake from '@/assets/pound cake.jpeg';
import heartCake from '@/assets/heart cake.jpeg';
import letterCake from '@/assets/letter cake.jpeg';
import numberCake from '@/assets/number cake.jpeg';
import roundCake from '@/assets/round cake.jpeg';
import squareCake from '@/assets/square cake.jpeg';
import sheetCake from '@/assets/sheet cake.jpeg';
import birthdayCakes from '@/assets/birthday-cakes.jpg';
import fruitCakes from '@/assets/fruit-cakes.jpg';
import cupcakesBox6 from '@/assets/cupcakes box of 6.jpeg';
import cupcakesBox12 from '@/assets/cupcakes box of 12.jpeg';
import cupcakesBox24 from '@/assets/cupcakes box of 24.jpeg';
import miniCupcakes from '@/assets/mini cupcakes.jpeg';
import cookieBox12 from '@/assets/cookie box of 12.jpeg';
import cookieBox24 from '@/assets/cookie box of 24.jpeg';
import giantCookie from '@/assets/Giant Cookie.jpeg';
import browniesBox6 from '@/assets/browies box of 6.jpeg';
import cakePops from '@/assets/cake pops.jpeg';
import cinnamonRolls from '@/assets/cinnamon rolls.jpeg';
import bananaBread from '@/assets/banana-bread.jpg';
import deliciousCake1 from '@/assets/delicious-cake-1.jpeg';
import deliciousCake2 from '@/assets/delicious-cake-2.jpeg';
import deliciousCake3 from '@/assets/deliciouus-cake-3.jpeg';
import deliciousCake4 from '@/assets/delicious-cake-4.jpeg';
import deliciousCake5 from '@/assets/delious cake-5.jpeg';
import deliciousCake6 from '@/assets/delicous-cake-6.jpeg';
import deliciousCake7 from '@/assets/delicous-cake-7.jpeg';
import deliciousCake8 from '@/assets/delicous-cake-8.jpeg';
import deliciousCake9 from '@/assets/delicous-cake-9.jpeg';

const Gallery = () => {
  const galleryImages = [
    // Tier Cakes
    { id: 1, src: tier2Cake, alt: "Elegant 2-Tier Wedding Cake" },
    { id: 2, src: tier3Cake, alt: "Beautiful 3-Tier Celebration Cake" },
    { id: 3, src: tier4Cake, alt: "Grand 4-Tier Wedding Cake" },
    // Special Shape Cakes
    { id: 4, src: poundCake, alt: "Classic Pound Cake" },
    { id: 5, src: heartCake, alt: "Romantic Heart-Shaped Cake" },
    { id: 6, src: letterCake, alt: "Custom Letter Cake" },
    { id: 7, src: numberCake, alt: "Birthday Number Cake" },
    { id: 8, src: roundCake, alt: "Classic Round Cake" },
    { id: 9, src: squareCake, alt: "Modern Square Cake" },
    { id: 10, src: sheetCake, alt: "Party Sheet Cake" },
    // Occasion Cakes
    { id: 11, src: birthdayCakes, alt: "Colorful Birthday Cakes" },
    { id: 12, src: fruitCakes, alt: "Fresh Fruit-Topped Cakes" },
    // Cupcakes
    { id: 13, src: cupcakesBox6, alt: "Box of 6 Cupcakes" },
    { id: 14, src: cupcakesBox12, alt: "Box of 12 Cupcakes" },
    { id: 15, src: cupcakesBox24, alt: "Box of 24 Cupcakes" },
    { id: 16, src: miniCupcakes, alt: "Adorable Mini Cupcakes" },
    // Cookies
    { id: 17, src: cookieBox12, alt: "Box of 12 Cookies" },
    { id: 18, src: cookieBox24, alt: "Box of 24 Cookies" },
    { id: 19, src: giantCookie, alt: "Giant Cookie" },
    // Other Treats
    { id: 20, src: browniesBox6, alt: "Box of 6 Brownies" },
    { id: 21, src: cakePops, alt: "Colorful Cake Pops" },
    { id: 22, src: cinnamonRolls, alt: "Fresh Cinnamon Rolls" },
    { id: 23, src: bananaBread, alt: "Homemade Banana Bread" },
    // Showcase Cakes
    { id: 24, src: deliciousCake1, alt: "Artisan Chocolate Cake" },
    { id: 25, src: deliciousCake2, alt: "Elegant Vanilla Cake" },
    { id: 26, src: deliciousCake3, alt: "Red Velvet Masterpiece" },
    { id: 27, src: deliciousCake4, alt: "Strawberry Delight" },
    { id: 28, src: deliciousCake5, alt: "Custom Wedding Cake" },
    { id: 29, src: deliciousCake6, alt: "Chocolate Truffle Cake" },
    { id: 30, src: deliciousCake7, alt: "Gourmet Cake Creation" },
    { id: 31, src: deliciousCake8, alt: "Premium Celebration Cake" },
    { id: 32, src: deliciousCake9, alt: "Luxury Tiered Cake" },
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
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="max-w-full max-h-full object-contain"
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
