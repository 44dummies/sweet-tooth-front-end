import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFloatingChat } from "@/contexts/FloatingChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

const FloatingChat = () => {
  const { isOpen, openChat, closeChat } = useFloatingChat();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! Welcome to Sweet Tooth Pastries. How can we help you today?",
      sender: 'support',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");

    setTimeout(() => {
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your message! Our team will respond shortly. For immediate assistance, you can also reach us on WhatsApp: +254 795 436 192",
        sender: 'support',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, autoReply]);
    }, 1000);
  };

  const handleWhatsApp = () => {
    const message = inputMessage || "Hi, I'd like to inquire about your cakes.";
    window.open(
      `https://wa.me/254795436192?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <>
      {isOpen && !isMinimized && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-[95vw] max-w-[380px] h-[600px] max-h-[80vh] bg-background border-2 border-border rounded-2xl shadow-2xl flex flex-col animate-scale-in">
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-white/30">
                  <AvatarFallback className="bg-white/20 text-white font-semibold">
                    ST
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="font-semibold text-base">Sweet Tooth Support</h3>
                <p className="text-xs text-white/80">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Minimize2 size={18} />
              </button>
              <button
                onClick={closeChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className={`text-[10px] mt-1 ${
                    message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {user && profile && (
            <div className="px-4 py-2 bg-secondary/20 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Chatting as {profile.first_name} {profile.last_name}
              </p>
            </div>
          )}

          <div className="p-4 border-t border-border bg-background rounded-b-xl">
            <div className="flex gap-2 mb-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border-2 focus:border-primary"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="rounded-xl h-10 w-10 bg-primary hover:bg-primary/90"
              >
                <Send size={18} />
              </Button>
            </div>
            <button
              onClick={handleWhatsApp}
              className="w-full text-xs text-center text-muted-foreground hover:text-primary transition-colors py-1"
            >
              Continue on WhatsApp →
            </button>
          </div>
        </div>
      )}

      {isOpen && isMinimized && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 bg-background border-2 border-border rounded-xl shadow-xl p-3 cursor-pointer hover:shadow-2xl transition-all"
             onClick={() => setIsMinimized(false)}>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border-2 border-primary/30">
              <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
                ST
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">Sweet Tooth Support</p>
              <p className="text-xs text-muted-foreground">{messages.length} messages</p>
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-full p-3 md:p-4 shadow-2xl hover:shadow-primary/50 transition-all hover:scale-110 animate-float"
          aria-label="Open chat"
        >
          <MessageCircle size={24} className="md:w-7 md:h-7" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-background rounded-full animate-pulse"></span>
        </button>
      )}
    </>
  );
};

export default FloatingChat;
