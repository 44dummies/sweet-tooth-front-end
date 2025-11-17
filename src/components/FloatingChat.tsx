import { useState } from "react";
import { MessageCircle, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsApp = () => {
    window.open(
      "https://wa.me/254795436192?text=Hello%20Sweet%20Tooth%20Bakery!%20I%E2%80%99d%20like%20to%20place%20an%20order%20or%20inquire%20about%20your%20cakes.",
      "_blank"
    );
  };

  const handleEmail = () => {
    window.location.href = "mailto:hello@sweettooth.com";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 bg-card rounded-2xl shadow-luxury border-2 border-border p-6 animate-scale-in w-72">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Contact Us</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-3">
            <Button
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-xl justify-start space-x-3"
            >
              <MessageCircle size={20} />
              <span>WhatsApp</span>
            </Button>
            <Button
              onClick={handleEmail}
              variant="outline"
              className="w-full rounded-xl justify-start space-x-3 border-2"
            >
              <Mail size={20} />
              <span>Email</span>
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-luxury hover:shadow-xl transition-all hover:scale-110 animate-float"
        aria-label="Open chat"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default FloatingChat;
