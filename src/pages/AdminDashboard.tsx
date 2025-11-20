import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, Order, OrderItem } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, Package, DollarSign, Users, TrendingUp, BarChart3, PackageSearch, Star, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesAnalytics from "@/components/SalesAnalytics";
import InventoryManagement from "@/components/InventoryManagement";
import VisitorAnalytics from "@/components/VisitorAnalytics";
import logo from "@/assets/logo.png";

const AdminDashboard = () => {
  const [orders, setOrders] = useState<(Order & { order_items?: OrderItem[] })[]>([]);
  const [customOrders, setCustomOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Order status updated');
      fetchOrders();
    } catch (err) {
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
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Sweet Tooth" className="w-10 h-10" />
            <h1 className="text-xl font-bold">Sweet Tooth Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
              </div>
              <Package className="w-10 h-10 text-primary/20" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-3xl font-bold mt-2">{stats.pendingOrders}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-500/20" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">Ksh {stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500/20" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custom Requests</p>
                <p className="text-3xl font-bold mt-2">{stats.customRequests}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500/20" />
            </div>
          </div>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <PackageSearch className="w-4 h-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="visitors" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visitors
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Custom Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            {/* Orders Table */}
            <div className="bg-card rounded-lg border mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 font-medium">Order ID</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Phone</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Payment</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-secondary/20">
                    <td className="p-4 font-mono text-sm">{order.id.substring(0, 8)}</td>
                    <td className="p-4">{order.customer_name}</td>
                    <td className="p-4">{order.customer_phone}</td>
                    <td className="p-4 font-semibold">Ksh {order.total_amount.toLocaleString()}</td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="px-3 py-1 rounded border text-sm"
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
                    <td className="p-4">
                      <select
                        value={order.payment_status}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        className="px-3 py-1 rounded border text-sm"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="FAILED">Failed</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                    </td>
                    <td className="p-4 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const whatsappMsg = `Hello ${order.customer_name}, regarding your order #${order.id.substring(0, 8)}...`;
                          window.open(`https:
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
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <SalesAnalytics />
          </TabsContent>

          <TabsContent value="inventory" className="mt-6">
            <InventoryManagement />
          </TabsContent>

          <TabsContent value="visitors" className="mt-6">
            <VisitorAnalytics />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            {/* Reviews Management */}
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

          <TabsContent value="custom" className="mt-6">
            {/* Custom Orders */}
            <div className="bg-card rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Custom Order Requests</h2>
          </div>
          <div className="p-6 space-y-4">
            {customOrders.map((req) => (
              <div key={req.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{req.customer_name}</h3>
                    <p className="text-sm text-muted-foreground">{req.customer_phone}</p>
                    {req.customer_email && <p className="text-sm text-muted-foreground">{req.customer_email}</p>}
                  </div>
                  <span className="px-3 py-1 bg-secondary rounded-full text-sm">{req.status}</span>
                </div>
                <p className="text-sm mb-3">{req.order_details}</p>
                <Button
                  size="sm"
                  onClick={() => {
                    const whatsappMsg = `Hello ${req.customer_name}, regarding your custom order request: "${req.order_details}"`;
                    window.open(`https:
                  }}
                >
                  Contact Customer
                </Button>
              </div>
            ))}
          </div>
        </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
