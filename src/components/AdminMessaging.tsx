import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Search, CheckCheck, Clock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Conversation {
  id: string;
  customer_name: string;
  customer_email: string;
  last_message: string;
  last_message_at: string;
  unread_admin_count: number;
  unread_customer_count: number;
  status: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'customer' | 'admin';
  message: string;
  read: boolean;
  created_at: string;
}

const AdminMessaging = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    subscribeToConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      markMessagesAsRead(selectedConversation.id);
      subscribeToMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error('Error loading conversations:', err);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      toast.error('Failed to load messages');
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {

      await supabase
        .from('conversation_messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'customer')
        .eq('read', false);


      await supabase
        .from('conversations')
        .update({ unread_admin_count: 0 })
        .eq('id', conversationId);

      loadConversations();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const subscribeToConversations = () => {
    const channel = supabase
      .channel('admin-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
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
          setMessages(prev => [...prev, newMsg]);

          if (newMsg.sender_type === 'customer') {
            markMessagesAsRead(conversationId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {

      const { error: msgError } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: selectedConversation.id,
          customer_email: selectedConversation.customer_email,
          sender_type: 'admin',
          message: newMessage,
          read: false
        });

      if (msgError) throw msgError;


      await supabase
        .from('conversations')
        .update({
          last_message: newMessage,
          last_message_at: new Date().toISOString(),
          unread_customer_count: selectedConversation.unread_customer_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedConversation.id);

      setNewMessage("");
      toast.success('Message sent!');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((acc, conv) => acc + conv.unread_admin_count, 0);

  return (
    <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
      {}
      <Card className={`md:col-span-1 flex flex-col ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Conversations
              {totalUnread > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {totalUnread}
                </Badge>
              )}
            </h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.id === conv.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {conv.customer_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm truncate">
                          {conv.customer_name}
                        </p>
                        {conv.unread_admin_count > 0 && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            {conv.unread_admin_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs opacity-80 truncate">
                        {conv.last_message || 'No messages yet'}
                      </p>
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(conv.last_message_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {}
      <Card className={`md:col-span-2 flex flex-col ${
        selectedConversation ? 'flex' : 'hidden md:flex'
      }`}>
        {selectedConversation ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                {}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedConversation.customer_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedConversation.customer_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.customer_email}
                  </p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.sender_type === 'admin'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <p className="text-xs opacity-70">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                        {msg.sender_type === 'admin' && (
                          msg.read ? (
                            <CheckCheck className="w-3 h-3 opacity-70" />
                          ) : (
                            <Clock className="w-3 h-3 opacity-70" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminMessaging;
