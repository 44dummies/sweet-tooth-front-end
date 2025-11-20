import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Bell, CheckCircle2, Package, X } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  order_id: string;
  type: 'EMAIL' | 'WHATSAPP' | 'SMS';
  recipient: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  sent_at: string | null;
  created_at: string;
}

const OrderNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          if (newNotif.status === 'SENT') {
            toast.success(`Order confirmation sent via ${newNotif.type}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      if (data) {
        setNotifications(data);
        const unread = data.filter(n => n.status === 'SENT' && !n.sent_at).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => {
          setShowPanel(!showPanel);
          if (!showPanel) markAsRead();
        }}
        className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-h-[600px] bg-card border rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <h3 className="font-semibold">Order Notifications</h3>
            </div>
            <button
              onClick={() => setShowPanel(false)}
              className="hover:bg-primary-foreground/20 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[520px]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-secondary/50 transition-colors ${
                      notif.status === 'SENT' ? 'bg-green-50 dark:bg-green-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {notif.status === 'SENT' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : notif.status === 'FAILED' ? (
                        <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Bell className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-primary">
                            {notif.type}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              notif.status === 'SENT'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : notif.status === 'FAILED'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}
                          >
                            {notif.status}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-1">
                          To: {notif.recipient}
                        </p>
                        
                        <p className="text-sm line-clamp-2">{notif.message}</p>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default OrderNotification;
