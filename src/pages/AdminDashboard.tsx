import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Order, OrderItem } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  LogOut, Package, DollarSign, Users, TrendingUp, BarChart3, 
  PackageSearch, Star, MessageSquare, CheckCircle2, XCircle,
  Clock, Truck, ChefHat, AlertTriangle, Eye, Send, RefreshCw,
  Tag, ShoppingBag, Calendar, ArrowUpRight, ArrowDownRight,
  Activity, PieChart, Target, Wallet, CreditCard, Receipt,
  Filter, Download, Search, MoreHorizontal, Bell, Settings,
  Zap, Award, TrendingDown, Percent, ShoppingCart, Globe
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import AdminBottomNav from "@/components/AdminBottomNav";
import AdminMessaging from "@/components/AdminMessaging";
import logo from "@/assets/logo.png";

const AdminDashboard = () => {
  const [orders, setOrders] = useState<(Order & { order_items?: OrderItem[] })[]>([]);
  const [customOrders, setCustomOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30d");
  const [searchQuery, setSearchQuery] = useState("");
  const [dataError, setDataError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLiveUpdating, setIsLiveUpdating] = useState(false);
  const idleTimerRef = useRef<number | null>(null);
  const lastActiveKey = 'admin:lastActive';
  const reauthFlagKey = 'admin:forceReauth';
  const navigate = useNavigate();

  // Generate demo data for analytics when database access fails
  const generateDemoData = () => {
    const today = new Date();
    const demoOrders: any[] = [];
    const statusOptions = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERED', 'CANCELLED'];
    const paymentOptions = ['PAID', 'PENDING', 'FAILED'];
    const products = ['Birthday Cake', 'Wedding Cake', 'Cupcakes (12)', 'Pastry Box', 'Custom Cake', 'Bread Loaf', 'Cookies (24)', 'Croissants (6)'];
    
    for (let i = 0; i < 150; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));
      const amount = Math.floor(Math.random() * 8000) + 500;
      
      demoOrders.push({
        id: `demo-${i}`,
        customer_name: `Customer ${i + 1}`,
        customer_phone: `+254${Math.floor(Math.random() * 900000000 + 100000000)}`,
        customer_email: `customer${i + 1}@example.com`,
        total_amount: amount,
        status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
        payment_status: paymentOptions[Math.floor(Math.random() * paymentOptions.length)],
        created_at: date.toISOString(),
        order_items: [
          { product_name: products[Math.floor(Math.random() * products.length)], quantity: Math.floor(Math.random() * 3) + 1, price: amount }
        ]
      });
    }
    
    return demoOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  useEffect(() => {
    if (localStorage.getItem(reauthFlagKey) === '1') {
      localStorage.removeItem(reauthFlagKey);
      supabase.auth.signOut().finally(() => navigate("/admin/login", { replace: true, state: { reason: 'reauth' } }));
      return;
    }

    checkAuth();
    fetchAllData();

    // Real-time subscriptions for all data changes
    const ordersChannel = supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('Order change detected:', payload);
        setIsLiveUpdating(true);
        setLastUpdate(new Date());
        
        if (payload.eventType === 'INSERT') {
          toast.success('🎉 New order received!', { 
            description: `From ${payload.new.customer_name}`, 
            duration: 5000 
          });
        } else if (payload.eventType === 'UPDATE') {
          const statusChanged = payload.old?.status !== payload.new?.status;
          const paymentChanged = payload.old?.payment_status !== payload.new?.payment_status;
          
          if (statusChanged) {
            toast.info('📦 Order status updated', {
              description: `${payload.new.customer_name}: ${payload.new.status}`,
              duration: 3000
            });
          }
          if (paymentChanged) {
            toast.info('💳 Payment status updated', {
              description: `${payload.new.customer_name}: ${payload.new.payment_status}`,
              duration: 3000
            });
          }
        }
        
        fetchAllData();
        setTimeout(() => setIsLiveUpdating(false), 1000);
      })
      .subscribe();

    const customOrdersChannel = supabase
      .channel('admin-custom-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_orders' }, (payload) => {
        setIsLiveUpdating(true);
        setLastUpdate(new Date());
        
        if (payload.eventType === 'INSERT') {
          toast.success('🎂 New custom order!', { 
            description: `From ${payload.new.customer_name}`, 
            duration: 5000 
          });
        } else if (payload.eventType === 'UPDATE') {
          toast.info('✅ Custom order updated', {
            description: `Status: ${payload.new.status}`,
            duration: 3000
          });
        }
        
        fetchAllData();
        setTimeout(() => setIsLiveUpdating(false), 1000);
      })
      .subscribe();

    const reviewsChannel = supabase
      .channel('admin-reviews-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, (payload) => {
        setIsLiveUpdating(true);
        setLastUpdate(new Date());
        
        if (payload.eventType === 'INSERT') {
          toast.success('⭐ New review submitted!', { 
            description: `From ${payload.new.name}`, 
            duration: 5000 
          });
        } else if (payload.eventType === 'UPDATE') {
          if (payload.new.approved && !payload.old?.approved) {
            toast.info('✅ Review approved', {
              description: `From ${payload.new.name}`,
              duration: 3000
            });
          }
        } else if (payload.eventType === 'DELETE') {
          toast.info('🗑️ Review deleted', { duration: 2000 });
        }
        
        fetchAllData();
        setTimeout(() => setIsLiveUpdating(false), 1000);
      })
      .subscribe();

    const productsChannel = supabase
      .channel('admin-products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        setIsLiveUpdating(true);
        setLastUpdate(new Date());
        
        if (payload.eventType === 'UPDATE') {
          const stockChanged = payload.old?.in_stock !== payload.new?.in_stock;
          const offerChanged = payload.old?.on_offer !== payload.new?.on_offer;
          
          if (stockChanged) {
            toast.info('📦 Product stock updated', {
              description: `${payload.new.name}: ${payload.new.in_stock ? 'Available' : 'Sold Out'}`,
              duration: 2000
            });
          }
          if (offerChanged) {
            toast.info('🏷️ Product offer updated', {
              description: `${payload.new.name}: ${payload.new.on_offer ? 'On Offer' : 'Regular Price'}`,
              duration: 2000
            });
          }
        }
        
        fetchAllData();
        setTimeout(() => setIsLiveUpdating(false), 1000);
      })
      .subscribe();

    // Activity tracking for session timeout
    const markActive = () => localStorage.setItem(lastActiveKey, Date.now().toString());
    const checkIdle = () => {
      const last = Number(localStorage.getItem(lastActiveKey) || Date.now());
      const idleMs = Date.now() - last;
      const limit = 30 * 60 * 1000; // 30 min timeout
      if (idleMs > limit) {
        window.clearInterval(idleTimerRef.current!);
        supabase.auth.signOut().finally(() => navigate("/admin/login", { replace: true, state: { reason: 'timeout' } }));
      }
    };

    markActive();
    const activityEvents: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    activityEvents.forEach((evt) => window.addEventListener(evt, markActive, { passive: true }));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) markActive(); });
    idleTimerRef.current = window.setInterval(checkIdle, 30000);

    const beforeUnload = () => {
      localStorage.setItem(reauthFlagKey, '1');
      markActive();
    };
    window.addEventListener('beforeunload', beforeUnload);

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(customOrdersChannel);
      supabase.removeChannel(reviewsChannel);
      supabase.removeChannel(productsChannel);
      if (idleTimerRef.current) window.clearInterval(idleTimerRef.current);
      activityEvents.forEach((evt) => window.removeEventListener(evt, markActive));
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    const adminEmail = "muindidamian@gmail.com";
    if (session.user.email !== adminEmail) {
      await supabase.auth.signOut();
      toast.error("Access denied. Admin only.");
      navigate("/admin/login");
      return;
    }
    setUser(session.user);
  };

  const fetchAllData = async () => {
    setLoading(true);
    setDataError(null);
    
    try {
      // Try fetching orders without user join to avoid RLS issues
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, customer_name, customer_phone, customer_email, total_amount, status, payment_status, created_at, delivery_address, delivery_date, special_instructions')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Orders fetch error:', ordersError);
        setDataError(`Error loading orders: ${ordersError.message}`);
        setOrders([]);
      } else {
        // Fetch order items separately to avoid join issues
        const orderIds = ordersData?.map(o => o.id) || [];
        let orderItems: any[] = [];
        
        if (orderIds.length > 0) {
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);
          orderItems = itemsData || [];
        }
        
        // Merge order items back to orders
        const ordersWithItems = ordersData?.map(order => ({
          ...order,
          order_items: orderItems.filter(item => item.order_id === order.id)
        })) || [];
        
        setOrders(ordersWithItems);
      }

      // Fetch other data
      const [customOrdersRes, reviewsRes, productsRes] = await Promise.all([
        supabase.from('custom_orders').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('name')
      ]);

      setCustomOrders(customOrdersRes.data || []);
      setReviews(reviewsRes.data || []);
      setProducts(productsRes.data || []);
      
    } catch (err) {
      console.error('Data fetch error:', err);
      setDataError(`Error loading data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem(lastActiveKey);
    localStorage.removeItem(reauthFlagKey);
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      toast.success('Order status updated');
      fetchAllData();
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('orders').update({ payment_status: newStatus }).eq('id', orderId);
      if (error) throw error;
      toast.success('Payment status updated');
      fetchAllData();
    } catch (err) {
      toast.error('Failed to update payment');
    }
  };

  const approveReview = async (reviewId: string) => {
    try {
      const { error } = await supabase.from('reviews').update({ approved: true }).eq('id', reviewId);
      if (error) throw error;
      toast.success('Review approved');
      fetchAllData();
    } catch (err) {
      toast.error('Failed to approve review');
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
      toast.success('Review deleted');
      fetchAllData();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const toggleProductStock = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('products').update({ in_stock: !currentStatus }).eq('id', productId);
      if (error) throw error;
      toast.success(currentStatus ? 'Product marked as sold out' : 'Product now available');
      fetchAllData();
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const toggleProductOffer = async (productId: string, currentOffer: boolean) => {
    try {
      const { error } = await supabase.from('products').update({ on_offer: !currentOffer }).eq('id', productId);
      if (error) throw error;
      toast.success(!currentOffer ? 'Product added to offers' : 'Product removed from offers');
      fetchAllData();
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const approveCustomOrder = async (orderId: string) => {
    try {
      const { error } = await supabase.from('custom_orders').update({ status: 'confirmed' }).eq('id', orderId);
      if (error) throw error;
      toast.success('Custom order approved!');
      fetchAllData();
    } catch (err) {
      toast.error('Failed to approve custom order');
    }
  };

  // Advanced Analytics Calculations
  const analytics = useMemo(() => {
    const now = new Date();
    const daysAgo = (days: number) => {
      const date = new Date(now);
      date.setDate(date.getDate() - days);
      return date;
    };

    const rangeDays = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    const rangeStart = daysAgo(rangeDays);
    const prevRangeStart = daysAgo(rangeDays * 2);

    const filteredOrders = orders.filter(o => new Date(o.created_at) >= rangeStart);
    const prevOrders = orders.filter(o => new Date(o.created_at) >= prevRangeStart && new Date(o.created_at) < rangeStart);

    // Revenue calculations
    const totalRevenue = filteredOrders.filter(o => o.payment_status === 'PAID').reduce((sum, o) => sum + o.total_amount, 0);
    const prevRevenue = prevOrders.filter(o => o.payment_status === 'PAID').reduce((sum, o) => sum + o.total_amount, 0);
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Order calculations
    const totalOrders = filteredOrders.length;
    const prevTotalOrders = prevOrders.length;
    const ordersGrowth = prevTotalOrders > 0 ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : 0;

    // Average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const prevAvgOrder = prevTotalOrders > 0 ? prevRevenue / prevTotalOrders : 0;
    const avgOrderGrowth = prevAvgOrder > 0 ? ((avgOrderValue - prevAvgOrder) / prevAvgOrder) * 100 : 0;

    // Unique customers
    const uniqueCustomers = new Set(filteredOrders.map(o => o.customer_phone)).size;
    const prevUniqueCustomers = new Set(prevOrders.map(o => o.customer_phone)).size;
    const customersGrowth = prevUniqueCustomers > 0 ? ((uniqueCustomers - prevUniqueCustomers) / prevUniqueCustomers) * 100 : 0;

    // Conversion metrics
    const pendingOrders = filteredOrders.filter(o => o.status === 'PENDING' || o.status === 'pending').length;
    const confirmedOrders = filteredOrders.filter(o => ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'IN_DELIVERY', 'DELIVERED'].includes(o.status?.toUpperCase() || '')).length;
    const deliveredOrders = filteredOrders.filter(o => o.status?.toUpperCase() === 'DELIVERED').length;
    const cancelledOrders = filteredOrders.filter(o => o.status?.toUpperCase() === 'CANCELLED').length;
    const conversionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

    // Payment metrics
    const paidOrders = filteredOrders.filter(o => o.payment_status === 'PAID').length;
    const pendingPayments = filteredOrders.filter(o => o.payment_status === 'PENDING' || o.payment_status === 'pending').length;
    const paymentSuccessRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;

    // Daily revenue chart data
    const dailyData: { [key: string]: { date: string; revenue: number; orders: number; fullDate: string } } = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.created_at);
      const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDate = date.toISOString().split('T')[0];
      if (!dailyData[fullDate]) {
        dailyData[fullDate] = { date: key, revenue: 0, orders: 0, fullDate };
      }
      if (order.payment_status === 'PAID') {
        dailyData[fullDate].revenue += order.total_amount;
      }
      dailyData[fullDate].orders += 1;
    });
    const dailyRevenue = Object.values(dailyData).sort((a, b) => a.fullDate.localeCompare(b.fullDate));

    // Product sales breakdown
    const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
    filteredOrders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const name = item.product_name || 'Unknown';
        if (!productSales[name]) {
          productSales[name] = { name, quantity: 0, revenue: 0 };
        }
        productSales[name].quantity += item.quantity || 1;
        productSales[name].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

    // Order status distribution
    const statusDistribution = [
      { name: 'Pending', value: pendingOrders, color: '#f59e0b' },
      { name: 'Confirmed', value: confirmedOrders, color: '#3b82f6' },
      { name: 'Delivered', value: deliveredOrders, color: '#10b981' },
      { name: 'Cancelled', value: cancelledOrders, color: '#ef4444' },
    ].filter(s => s.value > 0);

    // Payment status distribution
    const paymentDistribution = [
      { name: 'Paid', value: paidOrders, color: '#10b981' },
      { name: 'Pending', value: pendingPayments, color: '#f59e0b' },
      { name: 'Failed', value: filteredOrders.filter(o => o.payment_status === 'FAILED').length, color: '#ef4444' },
    ].filter(s => s.value > 0);

    // Hourly distribution
    const hourlyData: { [key: number]: number } = {};
    for (let i = 0; i < 24; i++) hourlyData[i] = 0;
    filteredOrders.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      hourlyData[hour]++;
    });
    const hourlyOrders = Object.entries(hourlyData).map(([hour, count]) => ({
      hour: `${hour}:00`,
      orders: count
    }));

    // Weekly comparison
    const weeklyData: { [key: string]: { week: string; revenue: number; orders: number } } = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!weeklyData[key]) {
        weeklyData[key] = { week: key, revenue: 0, orders: 0 };
      }
      if (order.payment_status === 'PAID') {
        weeklyData[key].revenue += order.total_amount;
      }
      weeklyData[key].orders += 1;
    });
    const weeklyRevenue = Object.values(weeklyData).slice(-12);

    return {
      totalRevenue,
      revenueGrowth,
      totalOrders,
      ordersGrowth,
      avgOrderValue,
      avgOrderGrowth,
      uniqueCustomers,
      customersGrowth,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      conversionRate,
      paymentSuccessRate,
      paidOrders,
      pendingPayments,
      dailyRevenue,
      topProducts,
      statusDistribution,
      paymentDistribution,
      hourlyOrders,
      weeklyRevenue,
      todayOrders: orders.filter(o => new Date(o.created_at).toDateString() === now.toDateString()).length,
      todayRevenue: orders.filter(o => new Date(o.created_at).toDateString() === now.toDateString() && o.payment_status === 'PAID').reduce((sum, o) => sum + o.total_amount, 0),
    };
  }, [orders, dateRange]);

  const CHART_COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PREPARING': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'READY_FOR_PICKUP': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
      case 'IN_DELIVERY': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'DELIVERED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => `Ksh ${amount.toLocaleString()}`;
  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-pink-500/20 rounded-full animate-spin border-t-pink-500"></div>
            <img src={logo} alt="Loading" className="absolute inset-0 m-auto w-12 h-12" />
          </div>
          <p className="text-lg font-medium text-white/70 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/30 dark:from-slate-950 dark:via-purple-950/50 dark:to-slate-950">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-border/40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={logo} alt="Sweet Tooth" className="w-12 h-12" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Sales & Analytics Portal
                </h1>
                <p className="text-xs text-muted-foreground">Sweet Tooth Pastries</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full">
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isLiveUpdating ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-xs font-medium text-muted-foreground">Live</span>
                <span className="text-[10px] text-muted-foreground/60">
                  {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px] h-9 text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="365d">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchAllData} className="gap-2 h-9">
                <RefreshCw className="w-3 h-3" />
                <span className="hidden md:inline">Refresh</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 h-9">
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5 md:flex md:w-auto gap-2 mb-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-1.5 rounded-xl border">
            <TabsTrigger value="overview" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg relative">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
              {analytics.pendingOrders > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500 border-2 border-white">
                  {analytics.pendingOrders}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
              <PackageSearch className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg relative">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Reviews</span>
              {reviews.filter(r => !r.approved).length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-amber-500 border-2 border-white">
                  {reviews.filter(r => !r.approved).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB - Main Dashboard */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-pink-500 to-rose-600">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-3">
                    <DollarSign className="w-10 h-10 text-white/90" />
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      {formatPercent(analytics.revenueGrowth)}
                    </Badge>
                  </div>
                  <p className="text-white/80 text-sm font-medium mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(analytics.totalRevenue)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {analytics.revenueGrowth >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-white/80" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-white/80" />
                    )}
                    <span className="text-xs text-white/70">vs previous period</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-3">
                    <ShoppingBag className="w-10 h-10 text-white/90" />
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      {formatPercent(analytics.ordersGrowth)}
                    </Badge>
                  </div>
                  <p className="text-white/80 text-sm font-medium mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-white">{analytics.totalOrders}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Activity className="w-4 h-4 text-white/80" />
                    <span className="text-xs text-white/70">{analytics.todayOrders} today</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-3">
                    <Receipt className="w-10 h-10 text-white/90" />
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      {formatPercent(analytics.avgOrderGrowth)}
                    </Badge>
                  </div>
                  <p className="text-white/80 text-sm font-medium mb-1">Avg Order Value</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(analytics.avgOrderValue)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-white/80" />
                    <span className="text-xs text-white/70">per transaction</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-3">
                    <Users className="w-10 h-10 text-white/90" />
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      {formatPercent(analytics.customersGrowth)}
                    </Badge>
                  </div>
                  <p className="text-white/80 text-sm font-medium mb-1">Customers</p>
                  <p className="text-3xl font-bold text-white">{analytics.uniqueCustomers}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Globe className="w-4 h-4 text-white/80" />
                    <span className="text-xs text-white/70">unique buyers</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Today's Revenue</p>
                      <p className="text-xl font-bold">{formatCurrency(analytics.todayRevenue)}</p>
                    </div>
                    <Wallet className="w-8 h-8 text-green-500/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
                      <p className="text-xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
                    </div>
                    <Target className="w-8 h-8 text-blue-500/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Payment Success</p>
                      <p className="text-xl font-bold">{analytics.paymentSuccessRate.toFixed(1)}%</p>
                    </div>
                    <CreditCard className="w-8 h-8 text-purple-500/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Pending Orders</p>
                      <p className="text-xl font-bold">{analytics.pendingOrders}</p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-500/40" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Charts */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-pink-500" />
                    Revenue Trend
                  </CardTitle>
                  <CardDescription>Daily revenue performance over selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.dailyRevenue}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        formatter={(value: any) => formatCurrency(value)}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={2} fill="url(#revenueGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-500" />
                    Order Status
                  </CardTitle>
                  <CardDescription>Current order distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={analytics.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <Card className="border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Top Performing Products
                </CardTitle>
                <CardDescription>Best sellers by revenue in selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                    <YAxis dataKey="name" type="category" width={120} stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      formatter={(value: any, name: string) => [name === 'revenue' ? formatCurrency(value) : value, name]}
                    />
                    <Bar dataKey="revenue" fill="url(#barGradient)" radius={[0, 8, 8, 0]}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB - Detailed Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Weekly Revenue Comparison
                  </CardTitle>
                  <CardDescription>Week-over-week performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={analytics.weeklyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                      <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} />
                      <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" fill="#8b5cf6" name="Revenue (Ksh)" />
                      <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#ec4899" strokeWidth={2} name="Orders" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Hourly Order Distribution
                  </CardTitle>
                  <CardDescription>Peak hours analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.hourlyOrders}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                      <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-500" />
                  Payment Analytics
                </CardTitle>
                <CardDescription>Payment status and success metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPieChart>
                        <Pie
                          data={analytics.paymentDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.paymentDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Payment Success Rate</span>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-3xl font-bold text-green-600">{analytics.paymentSuccessRate.toFixed(1)}%</p>
                      <Progress value={analytics.paymentSuccessRate} className="mt-2 h-2" />
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Orders Paid</span>
                        <Wallet className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{analytics.paidOrders} / {analytics.totalOrders}</p>
                      <p className="text-xs text-muted-foreground mt-1">{analytics.pendingPayments} pending payments</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    Conversion Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Delivery Rate</span>
                      <span className="font-semibold">{analytics.conversionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={analytics.conversionRate} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Delivered</p>
                      <p className="text-lg font-bold text-green-600">{analytics.deliveredOrders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cancelled</p>
                      <p className="text-lg font-bold text-red-600">{analytics.cancelledOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-blue-500" />
                    Order Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending</span>
                    <Badge className="bg-amber-100 text-amber-800">{analytics.pendingOrders}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Confirmed</span>
                    <Badge className="bg-blue-100 text-blue-800">{analytics.confirmedOrders}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <Badge className="bg-green-100 text-green-800">{analytics.deliveredOrders}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Percent className="w-4 h-4 text-pink-500" />
                    Growth Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Revenue</span>
                    <div className="flex items-center gap-1">
                      {analytics.revenueGrowth >= 0 ? <ArrowUpRight className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                      <span className={`text-sm font-semibold ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(analytics.revenueGrowth)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Orders</span>
                    <div className="flex items-center gap-1">
                      {analytics.ordersGrowth >= 0 ? <ArrowUpRight className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                      <span className={`text-sm font-semibold ${analytics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(analytics.ordersGrowth)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Customers</span>
                    <div className="flex items-center gap-1">
                      {analytics.customersGrowth >= 0 ? <ArrowUpRight className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                      <span className={`text-sm font-semibold ${analytics.customersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(analytics.customersGrowth)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ORDERS TAB */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-pink-500" />
                    All Orders ({orders.length})
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={fetchAllData} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Order</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Customer</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Amount</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Status</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Payment</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Date</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-secondary/20 transition-colors">
                          <td className="p-3">
                            <code className="text-xs bg-secondary px-2 py-1 rounded">#{order.id.substring(0, 8)}</code>
                          </td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-sm">{order.customer_name}</p>
                              <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-sm">Ksh {order.total_amount.toLocaleString()}</td>
                          <td className="p-3">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border-0 ${getStatusColor(order.status)}`}
                            >
                              <option value="PENDING">Pending</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="PREPARING">Preparing</option>
                              <option value="READY_FOR_PICKUP">Ready</option>
                              <option value="IN_DELIVERY">Delivery</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <select
                              value={order.payment_status}
                              onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border-0 ${
                                order.payment_status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              <option value="PENDING">Pending</option>
                              <option value="PAID">Paid</option>
                              <option value="FAILED">Failed</option>
                              <option value="REFUNDED">Refunded</option>
                            </select>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              {order.status === 'PENDING' && (
                                <Button size="sm" onClick={() => updateOrderStatus(order.id, 'CONFIRMED')} className="h-8 bg-green-500 hover:bg-green-600 text-xs">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Confirm
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => {
                                  const msg = `Hello ${order.customer_name}, regarding order #${order.id.substring(0, 8)}...`;
                                  window.open(`https://wa.me/${order.customer_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                                }}
                              >
                                WhatsApp
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-purple-500" />
                  Custom Order Requests ({customOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customOrders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>No custom orders yet</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {customOrders.map((req) => (
                      <div key={req.id} className="p-4 border rounded-xl hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{req.customer_name}</h3>
                            <p className="text-sm text-muted-foreground">{req.customer_phone}</p>
                          </div>
                          <Badge className={req.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                            {req.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm mb-4">
                          <p><span className="font-medium">Size:</span> {req.cake_size}</p>
                          <p><span className="font-medium">Flavor:</span> {req.cake_flavor}</p>
                          <p><span className="font-medium">Type:</span> {req.cake_type}</p>
                          <p><span className="font-medium">Delivery:</span> {new Date(req.delivery_date).toLocaleDateString()}</p>
                          {req.special_requests && (
                            <p className="p-2 bg-secondary/50 rounded text-xs mt-2">{req.special_requests}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {req.status === 'pending' && (
                            <Button size="sm" onClick={() => approveCustomOrder(req.id)} className="bg-green-500 hover:bg-green-600">
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => {
                            const msg = `Hello ${req.customer_name}, regarding your custom cake order...`;
                            window.open(`https://wa.me/${req.customer_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                          }}>
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <AdminMessaging />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PackageSearch className="w-5 h-5 text-blue-500" />
                  Product Management ({products.length})
                </CardTitle>
                <CardDescription>
                  Toggle stock status and offers. Changes sync to customers in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Product</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Price</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Stock</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">In Stock</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">On Offer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-secondary/20">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {product.image_url && (
                                <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                              )}
                              <div>
                                <p className="font-medium text-sm">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-semibold">Ksh {product.price?.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`text-sm font-medium ${product.stock_quantity <= 5 ? 'text-red-500' : 'text-green-600'}`}>
                              {product.stock_quantity}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={product.in_stock !== false}
                                onCheckedChange={() => toggleProductStock(product.id, product.in_stock !== false)}
                              />
                              <span className={`text-xs ${product.in_stock !== false ? 'text-green-600' : 'text-red-500'}`}>
                                {product.in_stock !== false ? 'Available' : 'Sold Out'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={product.on_offer === true}
                                onCheckedChange={() => toggleProductOffer(product.id, product.on_offer === true)}
                              />
                              {product.on_offer && (
                                <Badge className="bg-pink-100 text-pink-800 text-xs">
                                  <Tag className="w-3 h-3 mr-1" /> Offer
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Customer Reviews
                  </CardTitle>
                  <div className="flex gap-4 text-sm">
                    <span className="text-orange-500 font-medium">Pending: {reviews.filter(r => !r.approved).length}</span>
                    <span className="text-green-500 font-medium">Approved: {reviews.filter(r => r.approved).length}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className={`p-4 rounded-xl border ${!review.approved ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200' : 'bg-white dark:bg-gray-800'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-pink-100 to-purple-100 text-pink-700">
                              {review.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.name}</p>
                            <p className="text-xs text-muted-foreground">{review.email}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={review.approved ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                            {review.approved ? 'Approved' : 'Pending'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                      <div className="flex gap-2 mt-4">
                        {!review.approved && (
                          <Button size="sm" onClick={() => approveReview(review.id)} className="bg-green-500 hover:bg-green-600">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => deleteReview(review.id)}>
                          <XCircle className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AdminBottomNav />
    </div>
  );
};

export default AdminDashboard;
