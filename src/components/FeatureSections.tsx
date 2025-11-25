import { motion } from "framer-motion";
import { useReducedAnimations } from "@/hooks/use-mobile";
import { Truck, Palette, Heart } from "lucide-react";

const FeatureSections = () => {
  const reduceAnimations = useReducedAnimations();
  
  const features = [
    {
      title: "Fast Delivery",
      subtitle: "Accelerating your celebrations",
      description: "Quick, reliable delivery for your special moments. We understand timing is everything.",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
      icon: Truck,
      accent: "from-blue-500 to-cyan-500",
    },
    {
      title: "Custom Designs",
      subtitle: "Building creative dreams",
      description: "Tailored cake designs for any occasion. From birthdays to weddings, we bring your vision to life.",
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80",
      icon: Palette,
      accent: "from-purple-500 to-pink-500",
    },
    {
      title: "Premium Quality",
      subtitle: "Boosting your happiness",
      description: "Quality ingredients, exceptional taste. Every bite creates unforgettable moments of joy.",
      image: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=800&q=80",
      icon: Heart,
      accent: "from-rose-500 to-red-500",
    },
  ];

  return (
    <div className="relative w-full bg-gradient-to-b from-background via-secondary/20 to-background py-12 md:py-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="group"
                initial={reduceAnimations ? { opacity: 0 } : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: reduceAnimations ? 0.2 : 0.5, delay: reduceAnimations ? 0 : index * 0.1 }}
              >
                <div className="relative h-full bg-card rounded-3xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10">
                  {/* Image Container */}
                  <div className="relative h-44 md:h-48 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    
                    {/* Floating Icon Badge */}
                    <motion.div 
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 p-4 rounded-2xl bg-gradient-to-br ${feature.accent} shadow-xl`}
                      whileHover={reduceAnimations ? undefined : { scale: 1.1, rotate: 5 }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-5 md:p-6 pt-8 md:pt-10 text-center">
                    <p className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">{feature.subtitle}</p>
                    <h3 className="text-lg md:text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Bottom Accent Line */}
                  <div className={`h-1 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r ${feature.accent}`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeatureSections;
