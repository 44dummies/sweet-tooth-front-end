import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const FeatureSections = () => {
  const ref = useRef<HTMLDivElement>(null);
  
  const features = [
    {
      title: "Accelerating your celebrations",
      description: "Fast, reliable cake delivery for your special moments. We understand timing is everything when it comes to celebrations.",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
      reverse: false,
    },
    {
      title: "Building creative designs",
      description: "Custom cake designs tailored to your vision. From birthdays to weddings, we bring your dream cake to life.",
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80",
      reverse: true,
    },
    {
      title: "Boosting your happiness",
      description: "Quality ingredients, exceptional taste. Every bite is crafted to create unforgettable moments of joy.",
      image: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=800&q=80",
      reverse: false,
    },
  ];

  return (
    <div ref={ref} className="relative w-full bg-background py-8 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        {features.map((feature, index) => {
          const featureRef = useRef<HTMLDivElement>(null);
          const { scrollYProgress } = useScroll({
            target: featureRef,
            offset: ["start end", "center center"],
          });

          const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
          const x = useTransform(
            scrollYProgress,
            [0, 0.5],
            [feature.reverse ? 100 : -100, 0]
          );

          return (
            <motion.div
              key={index}
              ref={featureRef}
              className={`grid md:grid-cols-2 gap-6 md:gap-16 items-center mb-12 md:mb-32 last:mb-0 ${
                feature.reverse ? "md:grid-flow-dense" : ""
              }`}
              style={{ opacity } as any}
            >
              <motion.div
                className={feature.reverse ? "md:col-start-2" : ""}
                style={{ x: feature.reverse ? x : useTransform(x, (v) => -v) } as any}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-foreground">
                  {feature.title}
                </h2>
                <p className="text-base md:text-xl text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>

              <motion.div
                className={feature.reverse ? "md:col-start-1 md:row-start-1" : ""}
                style={{ x } as any}
              >
                <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureSections;
