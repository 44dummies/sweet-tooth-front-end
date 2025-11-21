import { MessageCircle, X, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFloatingChat } from "@/contexts/FloatingChatContext";

const FloatingChat = () => {
  const { isOpen, openChat, closeChat } = useFloatingChat();

  const handleWhatsApp = () => {
    window.open(
      "https://wa.me/254795436192",
      "_blank"
    );
  };

  const handleEmail = () => {
    window.location.href = "mailto:muindidamian@gmail.com";
  };

  const handleCall = () => {
    window.location.href = "tel:+254795436192";
  };

  return (
    <>
      {/* Modern Centered Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeChat}
          />
          
          {/* Modal Content */}
          <div className="relative z-10 bg-gradient-to-br from-card via-card to-card/95 rounded-3xl shadow-2xl border-2 border-primary/20 p-6 sm:p-8 w-full max-w-md animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-2xl text-foreground">Get in Touch</h3>
                <p className="text-sm text-muted-foreground mt-1">We're here to help you!</p>
              </div>
              <button
                onClick={closeChat}
                className="p-2 rounded-full hover:bg-muted/50 transition-all hover:rotate-90 duration-300"
                aria-label="Close"
              >
                <X size={24} className="text-muted-foreground" />
              </button>
            </div>
            
            {/* Contact Options */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  handleWhatsApp();
                  closeChat();
                }}
                className="w-full h-14 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white rounded-xl justify-start gap-4 text-base font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <MessageCircle size={24} />
                <div className="text-left">
                  <div>WhatsApp</div>
                  <div className="text-xs text-white/80">+254 795 436 192</div>
                </div>
              </Button>
              
              <Button
                onClick={() => {
                  handleCall();
                  closeChat();
                }}
                variant="outline"
                className="w-full h-14 rounded-xl justify-start gap-4 text-base font-medium border-2 hover:bg-primary/5 hover:border-primary/50 transition-all transform hover:scale-105"
              >
                <Phone size={24} className="text-primary" />
                <div className="text-left">
                  <div>Call Us</div>
                  <div className="text-xs text-muted-foreground">+254 795 436 192</div>
                </div>
              </Button>
              
              <Button
                onClick={() => {
                  handleEmail();
                  closeChat();
                }}
                variant="outline"
                className="w-full h-14 rounded-xl justify-start gap-4 text-base font-medium border-2 hover:bg-primary/5 hover:border-primary/50 transition-all transform hover:scale-105"
              >
                <Mail size={24} className="text-primary" />
                <div className="text-left">
                  <div>Email</div>
                  <div className="text-xs text-muted-foreground">muindidamian@gmail.com</div>
                </div>
              </Button>
            </div>
            
            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground">
                Available Mon-Sat: 8AM - 8PM
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-full p-4 shadow-2xl hover:shadow-primary/50 transition-all hover:scale-110 animate-float"
          aria-label="Open chat"
        >
          <MessageCircle size={28} />
        </button>
      )}
    </>
  );
};

export default FloatingChat;
