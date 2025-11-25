import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFloatingChat } from "@/contexts/FloatingChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'customer' | 'admin';
  message: string;
  read: boolean;
  created_at: string;
}

const FloatingChat = () => {
  const { isOpen, openChat, closeChat } = useFloatingChat();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      initializeConversation();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (conversationId) {
      subscribeToMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeConversation = async () => {
    if (!user?.email || !profile) return;

    setLoading(true);
    try {

      const { data: existingConv, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('customer_email', user.email)
        .single();

      if (convError && convError.code !== 'PGRST116') {
        throw convError;
      }

      let convId: string;

      if (existingConv) {
        convId = existingConv.id;
        setConversationId(convId);
      } else {

        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            customer_name: `${profile.first_name} ${profile.last_name}`,
            customer_email: user.email,
            last_message: 'New conversation started',
            status: 'active'
          })
          .select()
          .single();

        if (createError) throw createError;

        convId = newConv.id;
        setConversationId(convId);


        await supabase
          .from('conversation_messages')
          .insert({
            conversation_id: convId,
            customer_email: user.email,
            sender_type: 'admin',
            message: "Hi! Welcome to Sweet Tooth Pastries. How can we help you today?",
            read: false
          });
      }


      const { data: msgs, error: msgsError } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (msgsError) throw msgsError;

      setMessages(msgs || []);


      await supabase
        .from('conversation_messages')
        .update({ read: true })
        .eq('conversation_id', convId)
        .eq('sender_type', 'admin')
        .eq('read', false);


      await supabase
        .from('conversations')
        .update({ unread_customer_count: 0 })
        .eq('id', convId);

    } catch (err) {
      console.error('Error initializing conversation:', err);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`customer-chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMsg = payload.new as Message;


          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });


          if (newMsg.sender_type === 'admin') {
            if (isMinimized || !isOpen) {
              setUnreadCount(prev => prev + 1);
              toast.success('New message from Sweet Tooth Support!');
            }


            if (isOpen && !isMinimized) {
              supabase
                .from('conversation_messages')
                .update({ read: true })
                .eq('id', newMsg.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !conversationId || !user?.email) return;

    const messageText = inputMessage;
    setInputMessage("");

    try {
      const { error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversationId,
          customer_email: user.email,
          sender_type: 'customer',
          message: messageText,
          read: false
        });

      if (error) throw error;


      await supabase
        .from('conversations')
        .update({
          last_message: messageText,
          last_message_at: new Date().toISOString(),
          unread_admin_count: messages.filter(m => m.sender_type === 'customer' && !m.read).length + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      toast.success('Message sent!');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
      setInputMessage(messageText);
    }
  };

  const handleWhatsApp = () => {
    const message = inputMessage || "Hi, I'd like to inquire about your cakes.";
    window.open(
      `https://wa.me/254795436192?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
    setUnreadCount(0);


    if (conversationId) {
      supabase
        .from('conversation_messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'admin')
        .eq('read', false);
    }
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
                onClick={handleMinimize}
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
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_type === 'customer' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className="flex flex-col gap-1 max-w-[80%]">
                  {message.sender_type === 'admin' && (
                    <div className="flex items-center gap-2 px-2">
                      <Avatar className="h-5 w-5 border border-primary/30">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                          ST
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] text-muted-foreground font-medium">Sweet Tooth Team</span>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      message.sender_type === 'customer'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 text-foreground rounded-bl-sm border border-green-200 dark:border-green-800'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.message}</p>
                    <div className={`flex items-center gap-1 mt-1 ${
                      message.sender_type === 'customer' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      <p className="text-[10px]">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {message.sender_type === 'customer' && message.read && (
                        <CheckCheck size={12} className="text-green-400" />
                      )}
                    </div>
                  </div>
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
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border-2 focus:border-primary"
              />
              <Button
                onClick={sendMessage}
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
             onClick={handleRestore}>
          <div className="flex items-center gap-3 relative">
            <Avatar className="h-8 w-8 border-2 border-primary/30">
              <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
                ST
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">Sweet Tooth Support</p>
              <p className="text-xs text-muted-foreground">{messages.length} messages</p>
            </div>
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => { openChat(); setUnreadCount(0); }}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-full p-3 md:p-4 shadow-2xl hover:shadow-primary/50 transition-all hover:scale-110 animate-float"
          aria-label="Open chat"
        >
          <MessageCircle size={24} className="md:w-7 md:h-7" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-red-500 text-white text-xs animate-bounce">
              {unreadCount}
            </Badge>
          )}
        </button>
      )}
    </>
  );
};

export default FloatingChat;
