import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Package, Users } from "lucide-react";

const SalesAnalytics = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*,order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const dailyRevenue = processDailyRevenue(orders || []);
      const productSales = processProductSales(orders || []);
      const orderStatus = processOrderStatus(orders || []);
      const stats = calculateStats(orders || []);

      setAnalytics({
        dailyRevenue,
        productSales,
        orderStatus,
        stats,
      });
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const processDailyRevenue = (orders: any[]) => {
    const grouped: any = {};

    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!grouped[date]) {
        grouped[date] = { date, revenue: 0, orders: 0 };
      }
      grouped[date].revenue += order.total_amount;
      grouped[date].orders += 1;
    });

    return Object.values(grouped).slice(-30);
  };

  const processProductSales = (orders: any[]) => {
    const products: any = {};

    orders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const productName = item.product_name || 'Unknown Product';
        if (!products[productName]) {
          products[productName] = { name: productName, quantity: 0, revenue: 0 };
        }
        products[productName].quantity += item.quantity;
        products[productName].revenue += item.price * item.quantity;
      });
    });

    return Object.values(products).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 8);
  };

  const processOrderStatus = (orders: any[]) => {
    const statuses: any = {};

    orders.forEach(order => {
      const status = order.status || 'PENDING';
      if (!statuses[status]) {
        statuses[status] = { name: status, value: 0 };
      }
      statuses[status].value += 1;
    });

    return Object.values(statuses);
  };

  const calculateStats = (orders: any[]) => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.payment_status === 'PAID' ? o.total_amount : 0), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const uniqueCustomers = new Set(orders.map(o => o.customer_phone)).size;

    return {
      totalRevenue,
      totalOrders: orders.length,
      avgOrderValue,
      uniqueCustomers,
    };
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];

  if (loading) {
    return <div className="p-6 text-center">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="p-6 text-center">No data available</div>;
  }

  return (
    <div className="space-y-6">
      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold mt-2">Ksh {analytics.stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500/20" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold mt-2">{analytics.stats.totalOrders}</p>
            </div>
            <Package className="w-10 h-10 text-blue-500/20" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold mt-2">Ksh {Math.round(analytics.stats.avgOrderValue).toLocaleString()}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-500/20" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unique Customers</p>
              <p className="text-2xl font-bold mt-2">{analytics.stats.uniqueCustomers}</p>
            </div>
            <Users className="w-10 h-10 text-orange-500/20" />
          </div>
        </div>
      </div>

      {}
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Daily Revenue (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.dailyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={2} name="Revenue (Ksh)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Top Products by Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.productSales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#764ba2" name="Revenue (Ksh)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.orderStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.orderStatus.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
