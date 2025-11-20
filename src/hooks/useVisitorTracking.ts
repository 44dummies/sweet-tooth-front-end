import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const getVisitorId = (): string => {
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('SamsungBrowser') > -1) return 'Samsung Internet';
  if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
  if (ua.indexOf('Trident') > -1) return 'Internet Explorer';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1) return 'Safari';
  return 'Unknown';
};

const getOS = (): string => {
  const ua = navigator.userAgent;
  if (ua.indexOf('Win') > -1) return 'Windows';
  if (ua.indexOf('Mac') > -1) return 'macOS';
  if (ua.indexOf('X11') > -1) return 'UNIX';
  if (ua.indexOf('Linux') > -1) return 'Linux';
  if (/Android/.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
  return 'Unknown';
};

export const useVisitorTracking = () => {
  const visitStartTime = useRef<number>(Date.now());
  const currentPage = useRef<string>(window.location.pathname);
  const pageStartTime = useRef<number>(Date.now());

  useEffect(() => {
    const visitorId = getVisitorId();
    const sessionId = getSessionId();

    const logVisit = async () => {
      try {
        await supabase.from('visitor_logs').insert([
          {
            visitor_id: visitorId,
            session_id: sessionId,
            page_url: window.location.pathname,
            referrer: document.referrer || 'direct',
            device_type: getDeviceType(),
            browser: getBrowser(),
            os: getOS(),
            user_agent: navigator.userAgent,
          },
        ]);
      } catch (error) {
        console.error('Error logging visit:', error);
      }
    };

    const logPageView = async (url: string, title: string) => {
      try {
        await supabase.from('page_views').insert([
          {
            visitor_id: visitorId,
            session_id: sessionId,
            page_url: url,
            page_title: title,
          },
        ]);
      } catch (error) {
        console.error('Error logging page view:', error);
      }
    };

    logVisit();
    logPageView(window.location.pathname, document.title);

    const handleRouteChange = () => {
      const newPage = window.location.pathname;
      if (newPage !== currentPage.current) {
        const timeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000);
        
        supabase
          .from('page_views')
          .update({ time_on_page: timeOnPage })
          .eq('visitor_id', visitorId)
          .eq('session_id', sessionId)
          .eq('page_url', currentPage.current)
          .order('created_at', { ascending: false })
          .limit(1)
          .then(() => {
            currentPage.current = newPage;
            pageStartTime.current = Date.now();
            logPageView(newPage, document.title);
          });
      }
    };

    window.addEventListener('popstate', handleRouteChange);

    const handleBeforeUnload = async () => {
      const visitDuration = Math.floor((Date.now() - visitStartTime.current) / 1000);
      const timeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000);

      try {
        await supabase
          .from('visitor_logs')
          .update({ visit_duration: visitDuration })
          .eq('visitor_id', visitorId)
          .eq('session_id', sessionId);

        await supabase
          .from('page_views')
          .update({ time_on_page: timeOnPage })
          .eq('visitor_id', visitorId)
          .eq('session_id', sessionId)
          .eq('page_url', currentPage.current)
          .order('created_at', { ascending: false })
          .limit(1);
      } catch (error) {
        console.error('Error updating visit duration:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};
