import { motion } from "framer-motion";
import { Mail, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFloatingChat } from "@/contexts/FloatingChatContext";

const ContactSection = () => {
  const { openChat } = useFloatingChat();

  const contactOptions = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Quick responses via WhatsApp",
      action: () => window.open("https://wa.me/254795436192", "_blank"),
      bgColor: "from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-600 hover:to-emerald-700",
    },
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us a detailed message",
      action: () => window.location.href = "mailto:muindidamian@gmail.com",
      bgColor: "from-blue-500 to-indigo-600",
      hoverColor: "hover:from-blue-600 hover:to-indigo-700",
    },
    {
      icon: Send,
      title: "Live Chat",
      description: "Chat with us in real-time",
      action: openChat,
      bgColor: "from-purple-500 to-pink-600",
      hoverColor: "hover:from-purple-600 hover:to-pink-700",
    },
  ];

  return (
    <section id="contact" className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            Get In Touch
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions or ready to order? Choose your preferred way to reach us!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {contactOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Button
                  onClick={option.action}
                  className={`w-full h-auto p-6 md:p-8 flex flex-col items-center gap-4 bg-gradient-to-br ${option.bgColor} ${option.hoverColor} text-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 rounded-2xl`}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
                    <Icon className="w-12 h-12 md:w-16 md:h-16 relative z-10" />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-xl md:text-2xl font-bold">
                      {option.title}
                    </h3>
                    <p className="text-sm md:text-base text-white/90">
                      {option.description}
                    </p>
                  </div>

                  <div className="mt-2 px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                    Click to Connect
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-12 md:mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-sm md:text-base text-muted-foreground">
            💬 We typically respond within 1-2 hours during business hours (9 AM - 8 PM)
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
