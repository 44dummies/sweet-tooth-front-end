import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';

const OrderNotificationListener = () => {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();

  useEffect(() => {
    if (!user?.email) return;

    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co') {
      console.warn('Supabase not configured, skipping realtime subscriptions');
      return;
    }

    // Subscribe to order status changes for this user
    const channel = supabase
      .channel('user-orders')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_email=eq.${user.email}`,
        },
        (payload) => {
          const newOrder = payload.new as any;
          const oldOrder = payload.old as any;

          // Check if status changed to CONFIRMED
          if (newOrder.status === 'CONFIRMED' && oldOrder.status !== 'CONFIRMED') {
            // Show toast notification
            toast.success('Order Confirmed! 🎉', {
              description: `Your order #${newOrder.id.slice(0, 8)} has been confirmed by the admin.`,
              duration: 3000,
            });

            // Send browser notification
            sendNotification('Order Confirmed! 🎉', {
              body: `Your order #${newOrder.id.slice(0, 8)} has been confirmed. We'll prepare it soon!`,
              icon: '/logo.png',
              badge: '/logo.png',
            });
          }

          // Notify for other status changes
          if (newOrder.status !== oldOrder.status) {
            const statusMessages: Record<string, string> = {
              PREPARING: 'Your order is being prepared',
              READY_FOR_PICKUP: 'Your order is ready for pickup',
              IN_DELIVERY: 'Your order is out for delivery',
              DELIVERED: 'Your order has been delivered',
              CANCELLED: 'Your order has been cancelled',
            };

            const message = statusMessages[newOrder.status];
            if (message) {
              toast.info(`Order Update: ${message}`, {
                description: `Order #${newOrder.id.slice(0, 8)}`,
                duration: 3000,
              });

              sendNotification(`Order Update: ${message}`, {
                body: `Order #${newOrder.id.slice(0, 8)}`,
                icon: '/logo.png',
              });
            }
          }
        }
      )
      .subscribe((status) => {
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email, sendNotification]);

  return null; // This is a listener component, no UI
};

export default OrderNotificationListener;
