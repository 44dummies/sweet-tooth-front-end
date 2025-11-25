export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image_url?: string;
  in_stock: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address?: string;
  delivery_date?: string;
  special_instructions?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  user_email?: string;
  notification_sent?: boolean;
  confirmed_at?: string;
  confirmed_by?: string;
  created_at: string;
  updated_at?: string;
  order_items?: OrderItem[];
}

export interface CustomOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  cake_size: string;
  cake_flavor: string;
  cake_type: string;
  delivery_date: string;
  special_requests?: string;
  image_url?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id?: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: 'EMAIL' | 'WHATSAPP' | 'SMS';
  recipient: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  order_id?: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_email: string;
  product_id: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  username?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  last_active_at?: string;
}

export interface VisitorLog {
  id: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  visited_at: string;
}

export interface PageView {
  id: string;
  page_path: string;
  visitor_log_id?: string;
  viewed_at: string;
}

export interface SalesAnalytics {
  dailyRevenue: Array<{ date: string; revenue: number }>;
  productSales: Array<{ name: string; quantity: number; revenue: number }>;
  orderStatus: Array<{ name: string; value: number }>;
  stats: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    completedOrders: number;
  };
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}
