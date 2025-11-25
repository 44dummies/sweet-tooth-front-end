import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!supported) {
      toast.error('Notifications are not supported in this browser');
      return false;
    }

    if (permission === 'granted') {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notifications enabled! You\'ll receive updates about your orders.');
        return true;
      } else if (result === 'denied') {
        toast.error('Notification permission denied. You can enable it in your browser settings.');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted' && supported) {
      try {
        new Notification(title, {
          icon: '/logo.png',
          badge: '/logo.png',
          ...options,
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  };

  return {
    permission,
    supported,
    requestPermission,
    sendNotification,
  };
};
