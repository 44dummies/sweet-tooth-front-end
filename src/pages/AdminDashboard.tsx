import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Order, OrderItem } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, Package, DollarSign, Users, TrendingUp, BarChart3, PackageSearch, Star, Eye, MessageSquare, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesAnalytics from "@/components/SalesAnalytics";
import InventoryManagement from "@/components/InventoryManagement";
import AdminBottomNav from "@/components/AdminBottomNav";
import AdminMessaging from "@/components/AdminMessaging";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import logo from "@/assets/logo.png";

const AdminDashboard = () => {
  const [orders, setOrders] = useState<(Order & { order_items?: OrderItem[] })[]>([]);
  const [customOrders, setCustomOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
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
    fetchOrders();
    fetchCustomOrders();
    fetchReviews();
    fetchMessages();

    const ordersChannel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast.success('New order received!', {
              description: `Order from ${payload.new.customer_name}`,
              duration: 5000,
            });
          }
          fetchOrders();
        }
      )
      .subscribe();

    const customOrdersChannel = supabase
      .channel('admin-custom-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'custom_orders'
        },
        (payload) => {
          toast.success('New custom order request!', {
            description: `From ${payload.new.customer_name}`,
            duration: 5000,
          });
          fetchCustomOrders();
        }
      )
      .subscribe();

    const reviewsChannel = supabase
      .channel('admin-reviews')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast.success('New review submitted!', {
              description: `From ${payload.new.name}`,
              duration: 5000,
            });
          }
          fetchReviews();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('admin-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customer_messages'
        },
        (payload) => {
          toast.success('New message received!', {
            description: `From ${payload.new.customer_name}`,
            duration: 5000,
          });
          fetchMessages();
        }
      )
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
    const activityEvents: (keyof WindowEventMap)[] = ["mousemove","keydown","click","touchstart","scroll"];
    activityEvents.forEach((evt) => window.addEventListener(evt, markActive, { passive: true }));
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) markActive();
    });
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

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomOrders(data || []);
    } catch (err) {
      console.error('Error fetching custom orders:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_messages')
        .select('*')
        .order('created_at', { ascending: false});

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const order = orders.find(o => o.id === orderId);

      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          confirmed_by: user?.email || 'admin',
          notification_sent: newStatus === 'CONFIRMED' ? false : undefined,
        })
        .eq('id', orderId);

      if (error) throw error;


      if (newStatus === 'CONFIRMED' && order?.customer_email) {
        try {

          if (order.customer_email) {
            await supabase.functions.invoke('send-email-notification', {
              body: {
                orderId: orderId,
                customerEmail: order.customer_email,
                customerName: order.customer_name,
                type: 'order_confirmed',
                totalAmount: order.total_amount,
              }
            });
          }


          if (order.customer_phone) {
            await supabase.functions.invoke('send-whatsapp-notification', {
              body: {
                orderId: orderId,
                customerPhone: order.customer_phone,
                customerName: order.customer_name,
                totalAmount: order.total_amount,
                type: 'order_confirmed',
              }
            });
          }


          await supabase
            .from('orders')
            .update({ notification_sent: true })
            .eq('id', orderId);

          toast.success('Order confirmed and customer notified!');
        } catch (notifError) {
          console.error('Notification error:', notifError);
          toast.warning('Order confirmed but notification failed');
        }
      } else {
        toast.success('Order status updated');
      }

      fetchOrders();
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error('Failed to update order');
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Payment status updated');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update payment');
    }
  };

  const approveReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ approved: true })
        .eq('id', reviewId);

      if (error) throw error;
      toast.success('Review approved');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to approve review');
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      toast.success('Review deleted');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'PENDING').length,
    totalRevenue: orders.filter(o => o.payment_status === 'PAID').reduce((sum, o) => sum + o.total_amount, 0),
    customRequests: customOrders.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img src={logo} alt="Loading" className="w-16 h-16 animate-heartbeat mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <img src={logo} alt="Sweet Tooth" className="w-8 h-8 md:w-10 md:h-10" />
            <h1 className="text-base md:text-xl font-bold truncate">Sweet Tooth Admin</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline truncate max-w-[120px] md:max-w-none">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs md:text-sm">
              <LogOut className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {}
      <div className="container mx-auto px-4 py-6">
        {}
        <Tabs defaultValue="summary" className="w-full pb-20 md:pb-0">
          <TabsList className="w-full grid grid-cols-5 md:inline-flex md:w-auto gap-1">
            <TabsTrigger value="summary" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Summary</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <PackageSearch className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-6 space-y-6">
            {}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs md:text-sm text-muted-foreground">Total Orders</p>
                    <Package className="w-8 h-8 text-primary/20" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{stats.totalOrders}</p>
                </div>
              </div>

              <div className="bg-card p-4 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                    <TrendingUp className="w-8 h-8 text-orange-500/20" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-orange-500">{stats.pendingOrders}</p>
                </div>
              </div>

              <div className="bg-card p-4 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs md:text-sm text-muted-foreground">Revenue</p>
                    <DollarSign className="w-8 h-8 text-green-500/20" />
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-green-600">Ksh {stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-card p-4 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs md:text-sm text-muted-foreground">Custom</p>
                    <Users className="w-8 h-8 text-blue-500/20" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-blue-600">{stats.customRequests}</p>
                </div>
              </div>
            </div>

            {}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border">
                <div className="p-4 border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Recent Orders
                  </h3>
                </div>
                <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">Ksh {order.total_amount.toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'PENDING' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400' :
                        order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                        'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-lg border">
                <div className="p-4 border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Recent Messages
                  </h3>
                </div>
                <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                  {messages.slice(0, 5).map((msg) => (
                    <div key={msg.id} className="flex items-start justify-between p-3 bg-secondary/20 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{msg.customer_name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{msg.message}</p>
                      </div>
                      {msg.status === 'unread' && (
                        <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">New</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {}
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Quick Stats</h3>
              </div>
              <div className="p-6">
                <SalesAnalytics />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            {}
            <div className="bg-card rounded-lg border mb-6">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5" />
              Menu Orders
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-2 md:p-4 font-medium text-xs md:text-sm">Order ID</th>
                  <th className="text-left p-2 md:p-4 font-medium text-xs md:text-sm">Customer</th>
                  <th className="text-left p-2 md:p-4 font-medium text-xs md:text-sm">Phone</th>
                  <th className="text-left p-2 md:p-4 font-medium text-xs md:text-sm">Amount</th>
                  <th className="text-left p-2 md:p-4 font-medium text-xs md:text-sm">Status</th>
                  <th className="text-left p-2 md:p-4 font-medium text-xs md:text-sm">Payment</th>
                  <th className="text-left p-2 md:p-4 font-medium text-xs md:text-sm">Date</th>
                  <th className="text-left p-2 md:p-4 font-medium text-xs md:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-secondary/20">
                    <td className="p-2 md:p-4 font-mono text-xs md:text-sm">{order.id.substring(0, 8)}</td>
                    <td className="p-2 md:p-4 text-xs md:text-sm">{order.customer_name}</td>
                    <td className="p-2 md:p-4 text-xs md:text-sm">{order.customer_phone}</td>
                    <td className="p-2 md:p-4 font-semibold text-xs md:text-sm">Ksh {order.total_amount.toLocaleString()}</td>
                    <td className="p-2 md:p-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="px-2 md:px-3 py-1 rounded border text-xs md:text-sm w-full"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="READY_FOR_PICKUP">Ready</option>
                        <option value="IN_DELIVERY">In Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-2 md:p-4">
                      <select
                        value={order.payment_status}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        className="px-2 md:px-3 py-1 rounded border text-xs md:text-sm w-full"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="FAILED">Failed</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                    </td>
                    <td className="p-2 md:p-4 text-xs md:text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-2 md:p-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          const whatsappMsg = `Hello ${order.customer_name}, regarding your order #${order.id.substring(0, 8)}...`;
                          window.open(`https://wa.me/254795436192?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
                        }}
                      >
                        WhatsApp
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

            {}
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Custom Order Requests
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {customOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No custom orders yet</p>
                  </div>
                ) : (
                  customOrders.map((req) => (
                    <div key={req.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">{req.customer_name}</h3>
                          <div className="flex flex-col gap-1 mt-1">
                            <p className="text-sm text-muted-foreground">{req.customer_phone}</p>
                            {req.customer_email && <p className="text-sm text-muted-foreground">{req.customer_email}</p>}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          req.status === 'pending' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400' :
                          req.status === 'confirmed' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                          req.status === 'completed' ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                          'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="space-y-2 mb-3 text-sm">
                        <p><span className="font-medium">Size:</span> {req.cake_size}</p>
                        <p><span className="font-medium">Flavor:</span> {req.cake_flavor}</p>
                        <p><span className="font-medium">Type:</span> {req.cake_type}</p>
                        <p><span className="font-medium">Delivery:</span> {new Date(req.delivery_date).toLocaleDateString()}</p>
                        {req.special_requests && (
                          <p className="p-2 bg-secondary/50 rounded text-xs">
                            <span className="font-medium">Special Requests:</span> {req.special_requests}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          const whatsappMsg = `Hello ${req.customer_name}, regarding your custom order:\n\nSize: ${req.cake_size}\nFlavor: ${req.cake_flavor}\nType: ${req.cake_type}\nDelivery: ${new Date(req.delivery_date).toLocaleDateString()}${req.special_requests ? `\nSpecial Requests: ${req.special_requests}` : ''}`;
                          window.open(`https://wa.me/${req.customer_phone}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
                        }}
                      >
                        Contact via WhatsApp
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <SalesAnalytics />
          </TabsContent>

          <TabsContent value="inventory" className="mt-6">
            <InventoryManagement />
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <AdminMessaging />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            {}
            <div className="bg-card rounded-lg border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Customer Reviews</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Pending: {reviews.filter(r => !r.approved).length}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Approved: {reviews.filter(r => r.approved).length}
                    </span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Customer</th>
                      <th className="text-left p-4 font-medium">Rating</th>
                      <th className="text-left p-4 font-medium">Review</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review) => (
                      <tr key={review.id} className="border-b hover:bg-secondary/20">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{review.name}</p>
                            <p className="text-xs text-muted-foreground">{review.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} size={16} className="fill-primary text-primary" />
                            ))}
                          </div>
                        </td>
                        <td className="p-4 max-w-md">
                          <p className="text-sm line-clamp-2">{review.comment}</p>
                        </td>
                        <td className="p-4 text-sm">
                          {new Date(review.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            review.approved
                              ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                              : 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
                          }`}>
                            {review.approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {!review.approved && (
                              <Button
                                size="sm"
                                onClick={() => approveReview(review.id)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                Approve
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteReview(review.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AdminBottomNav />
    </div>
  );
};

export default AdminDashboard;
