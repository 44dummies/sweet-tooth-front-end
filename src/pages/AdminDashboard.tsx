import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Order, OrderItem } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  LogOut, Package, DollarSign, Users, TrendingUp, BarChart3, 
  PackageSearch, Star, MessageSquare, CheckCircle2, XCircle,
  Clock, Truck, ChefHat, AlertTriangle, Eye, Send, RefreshCw,
  ToggleLeft, ToggleRight, Tag, ShoppingBag
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SalesAnalytics from "@/components/SalesAnalytics";
import InventoryManagement from "@/components/InventoryManagement";
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const idleTimerRef = useRef<number | null>(null);
  const lastActiveKey = 'admin:lastActive';
  const reauthFlagKey = 'admin:forceReauth';
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem(reauthFlagKey) === '1') {
      localStorage.removeItem(reauthFlagKey);
      supabase.auth.signOut().finally(() => navigate("/admin/login", { replace: true, state: { reason: 'reauth' } }));
      return;
    }

    checkAuth();
    fetchAllData();

    const ordersChannel = supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          toast.success('🎉 New order received!', { description: `From ${payload.new.customer_name}`, duration: 5000 });
        }
        fetchOrders();
      })
      .subscribe();

    const customOrdersChannel = supabase
      .channel('admin-custom-orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'custom_orders' }, (payload) => {
        toast.success('🎂 New custom order!', { description: `From ${payload.new.customer_name}`, duration: 5000 });
        fetchCustomOrders();
      })
      .subscribe();

    const reviewsChannel = supabase
      .channel('admin-reviews-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' }, (payload) => {
        toast.success('⭐ New review submitted!', { description: `From ${payload.new.name}`, duration: 5000 });
        fetchReviews();
      })
      .subscribe();

    const markActive = () => localStorage.setItem(lastActiveKey, Date.now().toString());
    const checkIdle = () => {
      const last = Number(localStorage.getItem(lastActiveKey) || Date.now());
      const idleMs = Date.now() - last;
      const limit = 5 * 60 * 1000;
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
    await Promise.all([fetchOrders(), fetchCustomOrders(), fetchReviews(), fetchProducts()]);
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchCustomOrders = async () => {
    try {
      const { data, error } = await supabase.from('custom_orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCustomOrders(data || []);
    } catch (err) {
      console.error('Error fetching custom orders:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
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
      const order = orders.find(o => o.id === orderId);
      const { error } = await supabase.from('orders').update({
        status: newStatus,
        confirmed_by: user?.email || 'admin',
        notification_sent: newStatus === 'CONFIRMED' ? false : undefined,
      }).eq('id', orderId);

      if (error) throw error;

      if (newStatus === 'CONFIRMED' && order) {
        try {
          if (order.customer_email) {
            await supabase.functions.invoke('send-email-notification', {
              body: { orderId, customerEmail: order.customer_email, customerName: order.customer_name, type: 'order_confirmed', totalAmount: order.total_amount }
            });
          }
          if (order.customer_phone) {
            await supabase.functions.invoke('send-whatsapp-notification', {
              body: { orderId, customerPhone: order.customer_phone, customerName: order.customer_name, totalAmount: order.total_amount, type: 'order_confirmed' }
            });
          }
          await supabase.from('orders').update({ notification_sent: true }).eq('id', orderId);
          toast.success('Order confirmed & customer notified!');
        } catch (notifError) {
          toast.warning('Order confirmed but notification failed');
        }
      } else {
        toast.success('Order status updated');
      }
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('orders').update({ payment_status: newStatus }).eq('id', orderId);
      if (error) throw error;
      toast.success('Payment status updated');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update payment');
    }
  };

  const approveReview = async (reviewId: string) => {
    try {
      const { error } = await supabase.from('reviews').update({ approved: true }).eq('id', reviewId);
      if (error) throw error;
      toast.success('Review approved & now visible!');
      fetchReviews();
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
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const toggleProductStock = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('products').update({ in_stock: !currentStatus }).eq('id', productId);
      if (error) throw error;
      toast.success(currentStatus ? 'Product marked as sold out' : 'Product now available');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const toggleProductOffer = async (productId: string, currentOffer: boolean) => {
    try {
      const { error } = await supabase.from('products').update({ on_offer: !currentOffer }).eq('id', productId);
      if (error) throw error;
      toast.success(!currentOffer ? 'Product added to offers' : 'Product removed from offers');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const approveCustomOrder = async (orderId: string) => {
    try {
      const { error } = await supabase.from('custom_orders').update({ status: 'confirmed' }).eq('id', orderId);
      if (error) throw error;
      toast.success('Custom order approved!');
      fetchCustomOrders();
    } catch (err) {
      toast.error('Failed to approve custom order');
    }
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'PENDING' || o.status === 'pending').length,
    confirmedOrders: orders.filter(o => o.status === 'CONFIRMED').length,
    totalRevenue: orders.filter(o => o.payment_status === 'PAID').reduce((sum, o) => sum + o.total_amount, 0),
    pendingRevenue: orders.filter(o => o.payment_status === 'PENDING' || o.payment_status === 'pending').reduce((sum, o) => sum + o.total_amount, 0),
    customRequests: customOrders.filter(o => o.status === 'pending').length,
    pendingReviews: reviews.filter(r => !r.approved).length,
    todayOrders: orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length,
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'CONFIRMED': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'PREPARING': return <ChefHat className="w-4 h-4 text-purple-500" />;
      case 'READY_FOR_PICKUP': return <Package className="w-4 h-4 text-green-500" />;
      case 'IN_DELIVERY': return <Truck className="w-4 h-4 text-indigo-500" />;
      case 'DELIVERED': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PREPARING': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'READY_FOR_PICKUP': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'IN_DELIVERY': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'DELIVERED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <img src={logo} alt="Loading" className="w-20 h-20 animate-bounce mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={logo} alt="Sweet Tooth" className="w-10 h-10 md:w-12 md:h-12" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Sweet Tooth Pastries</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">{user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 rounded-full">
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5 md:flex md:w-auto md:inline-flex gap-1 mb-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-1 rounded-xl">
            <TabsTrigger value="dashboard" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white relative">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
              {stats.pendingOrders > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500">{stats.pendingOrders}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <PackageSearch className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white relative">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Reviews</span>
              {stats.pendingReviews > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-orange-500">{stats.pendingReviews}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white border-0 shadow-lg shadow-pink-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-100 text-xs font-medium">Today's Orders</p>
                      <p className="text-3xl font-bold mt-1">{stats.todayOrders}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0 shadow-lg shadow-orange-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-xs font-medium">Pending</p>
                      <p className="text-3xl font-bold mt-1">{stats.pendingOrders}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg shadow-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-xs font-medium">Revenue</p>
                      <p className="text-2xl font-bold mt-1">Ksh {stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-violet-500 text-white border-0 shadow-lg shadow-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-xs font-medium">Custom Orders</p>
                      <p className="text-3xl font-bold mt-1">{stats.customRequests}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <ChefHat className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="w-5 h-5 text-pink-500" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {orders.slice(0, 8).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-pink-200">
                              <AvatarFallback className="bg-gradient-to-br from-pink-100 to-purple-100 text-pink-700 font-semibold">
                                {order.customer_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{order.customer_name}</p>
                              <p className="text-xs text-muted-foreground">Ksh {order.total_amount.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <Badge variant="secondary" className={`${getStatusColor(order.status)} text-xs`}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Pending Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {reviews.filter(r => !r.approved).slice(0, 5).map((review) => (
                        <div key={review.id} className="p-3 bg-secondary/30 rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-sm">{review.name}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: review.rating }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-7 text-green-600 hover:bg-green-100" onClick={() => approveReview(review.id)}>
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-red-600 hover:bg-red-100" onClick={() => deleteReview(review.id)}>
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{review.comment}</p>
                        </div>
                      ))}
                      {reviews.filter(r => !r.approved).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Star className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No pending reviews</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Sales Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SalesAnalytics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-pink-500" />
                    All Orders ({orders.length})
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-2">
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

            <InventoryManagement />
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
