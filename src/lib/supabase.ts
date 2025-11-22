import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using localStorage fallback.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: window.sessionStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export type Order = {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  delivery_address: string;
  preferred_delivery_date?: string;
  cake_specifications?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'IN_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  total_amount: number;
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  created_at: string;
  user_email?: string;
  notification_sent?: boolean;
  confirmed_at?: string;
  confirmed_by?: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  quantity: number;
  price: number;
};

export type CustomOrder = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  order_details: string;
  status: 'PENDING' | 'CONTACTED' | 'QUOTED' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED';
  created_at: string;
};
