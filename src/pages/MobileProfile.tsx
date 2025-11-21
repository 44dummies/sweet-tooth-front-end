import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { User, Package, Bell, LogOut, ChevronRight } from "lucide-react";

const MobileProfile = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view your profile</p>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              {profile.avatar ? (
                <img 
                  src={profile.avatar}
                  alt={profile.username || 'Profile'}
                  className="w-20 h-20 rounded-full border-4 border-primary/20"
                />
              ) : (
                <Avatar className="w-20 h-20 border-4 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold">{profile.first_name} {profile.last_name}</h2>
                {profile.username && (
                  <p className="text-muted-foreground">@{profile.username}</p>
                )}
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/profile')}
            >
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </Card>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center justify-between p-4 bg-card rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Order History</p>
                  <p className="text-xs text-muted-foreground">{orders.length} orders</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="w-full flex items-center justify-between p-4 bg-card rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    {notificationsEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="w-full flex items-center justify-between p-4 bg-card rounded-lg">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-primary">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="text-left">
                  <p className="font-medium">Theme</p>
                  <p className="text-xs text-muted-foreground">Light / Dark mode</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {orders.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold mb-3">Recent Orders</h3>
              <div className="space-y-2">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Order #{order.id.substring(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">Ksh {order.total_amount}</p>
                      <p className="text-xs text-muted-foreground">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default MobileProfile;
