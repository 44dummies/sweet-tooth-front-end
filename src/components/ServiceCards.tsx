import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReducedAnimations } from "@/hooks/use-mobile";

const ServiceCards = () => {
  const navigate = useNavigate();
  const reduceAnimations = useReducedAnimations();

  const services = [
    {
      title: "Wedding Cakes",
      description: "Elegant multi-tier wedding cakes designed to match your special day.",
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
      cakeType: "Wedding Cake",
    },
    {
      title: "Birthday Cakes",
      description: "Custom birthday cakes that bring joy to your celebration.",
      image: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&q=80",
      cakeType: "Birthday Cake",
    },
    {
      title: "Corporate Events",
      description: "Professional cakes for corporate gatherings and special occasions.",
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80",
      cakeType: "Corporate Event Cake",
    },
    {
      title: "Custom Designs",
      description: "Unique cake designs crafted to your exact specifications.",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80",
      cakeType: "Custom Design",
    },
  ];

  return (
    <div className="w-full bg-background py-8 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          className="text-center mb-8 md:mb-20"
          initial={reduceAnimations ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduceAnimations ? 0.2 : 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-foreground">
            Our Services
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            From weddings to birthdays, we create unforgettable cakes for every occasion
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 overflow-hidden">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="group relative"
              initial={reduceAnimations ? { opacity: 0 } : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reduceAnimations ? 0.2 : 0.6, delay: reduceAnimations ? 0 : index * 0.1 }}
              onClick={() => navigate('/custom-order', { state: { cakeType: service.cakeType } })}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-500">
                {}
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className={`w-full h-full object-cover transition-transform ${reduceAnimations ? 'duration-300' : 'duration-700 group-hover:scale-110'}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>

                {}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{service.title}</h3>
                  <p className="text-white/90 mb-3 md:mb-4 text-xs md:text-sm leading-relaxed">
                    {service.description}
                  </p>

                  {}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/custom-order', { state: { cakeType: service.cakeType } });
                    }}
                    className="flex items-center gap-2 text-white font-semibold group/btn cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md"
                    whileHover={reduceAnimations ? undefined : { x: 5 }}
                    whileTap={reduceAnimations ? undefined : { scale: 0.95 }}
                  >
                    <span>Order Now</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </motion.button>
                </div>

                {}
                <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 rounded-2xl transition-colors duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceCards;
