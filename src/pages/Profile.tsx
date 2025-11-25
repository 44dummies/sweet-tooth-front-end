import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, MapPin, Phone, Mail, Package, LogOut, Settings, Trash2, AlertTriangle, Check, Image } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ModernNavbar from "@/components/ModernNavbar";
import Footer from "@/components/Footer";

// Generate avatars for selection
const generateAvatars = () => {
  const styles = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'micah', 'pixel-art'];
  const seeds = Array.from({ length: 12 }, (_, i) => `avatar-${i}`);
  
  return seeds.map((seed, index) => ({
    id: `${styles[index % styles.length]}-${seed}`,
    url: `https://api.dicebear.com/7.x/${styles[index % styles.length]}/svg?seed=${seed}`,
    style: styles[index % styles.length]
  }));
};

const avatars = generateAvatars();

interface OrderHistory {
  id: string;
  customer_name: string;
  status: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  items: any[];
  order_items?: any[];
}

const Profile = () => {
  const { user, profile, signOut, updateProfile, deleteAccount, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    avatar: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { state: { from: { pathname: "/profile" } } });
    }
    // Don't redirect to profile setup if they've skipped it
    // Users can complete profile details from the profile page itself
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        postal_code: profile.postal_code || "",
        avatar: profile.avatar || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const userEmail = profile?.email || user.email;
      if (!userEmail) return;
      
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('customer_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load order history');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await updateProfile(formData);

    if (error) {
      if (error.message && (error.message.includes('duplicate key') || error.message.includes('username'))) {
        toast.error('Failed to update profile: Username already taken');
      } else {
        toast.error(error?.message || 'Failed to update profile');
      }
      setSaving(false);
      return;
    }

    toast.success('Profile updated successfully!');
    setEditing(false);
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    const { error } = await deleteAccount();
    
    if (error) {
      toast.error('Failed to delete account');
      return;
    }

    toast.success('Account deleted successfully');
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-purple-100 text-purple-800',
      READY_FOR_PICKUP: 'bg-green-100 text-green-800',
      IN_DELIVERY: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Handle case where profile is still loading or doesn't exist
  const displayProfile = profile || {
    first_name: user.user_metadata?.first_name || '',
    last_name: user.user_metadata?.last_name || '',
    email: user.email || '',
    username: '',
    avatar: '',
  };

  const initials = `${displayProfile.first_name?.[0] || user.email?.[0] || ''}${displayProfile.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 relative">
      <ModernNavbar />
      
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {displayProfile.avatar ? (
              <img 
                src={displayProfile.avatar} 
                alt={`${displayProfile.username || 'User'}'s avatar`}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-background shadow-lg"
              />
            ) : (
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl">
                  {initials || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                {displayProfile.first_name || displayProfile.last_name 
                  ? `${displayProfile.first_name} ${displayProfile.last_name}`.trim() 
                  : 'Welcome!'}
              </h1>
              {displayProfile.username && (
                <p className="text-sm text-muted-foreground mb-1">
                  @{displayProfile.username}
                </p>
              )}
              <p className="text-muted-foreground flex items-center gap-2 justify-center sm:justify-start">
                <Mail size={16} />
                <span className="text-sm sm:text-base break-all">{displayProfile.email || user.email}</span>
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2 w-full sm:w-auto">
              <LogOut size={16} />
              <span className="sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid h-auto">
            <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
              <Settings size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Profile</span>
              <span className="xs:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
              <Package size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Orders</span>
              <span className="xs:hidden">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
              <User size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Account</span>
              <span className="xs:hidden">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings Tab */}
          <TabsContent value="profile" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Update your profile details</CardDescription>
                  </div>
                  {!editing && (
                    <Button onClick={() => setEditing(true)} variant="outline" className="w-full sm:w-auto">
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                {(!profile?.phone || !profile?.address) && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Complete Your Profile</p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          Phone number and address are required for placing orders
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Avatar Selection - Show when editing */}
                {editing && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Select Avatar
                    </Label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                      {avatars.map((avatar) => (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, avatar: avatar.url })}
                          className={`relative aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                            formData.avatar === avatar.url
                              ? 'border-primary ring-2 ring-primary ring-offset-2'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <img
                            src={avatar.url}
                            alt={`Avatar ${avatar.id}`}
                            className="w-full h-full rounded-lg object-cover"
                          />
                          {formData.avatar === avatar.url && (
                            <div className="absolute inset-0 bg-primary/20 rounded-lg flex items-center justify-center">
                              <Check className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    {formData.avatar && (
                      <div className="bg-secondary/30 rounded-lg p-3 flex items-center gap-3">
                        <img
                          src={formData.avatar}
                          alt="Selected avatar"
                          className="w-12 h-12 rounded-full border-2 border-primary"
                        />
                        <div>
                          <p className="text-xs text-muted-foreground">Selected Avatar</p>
                          <p className="text-sm font-medium">
                            {formData.first_name || formData.last_name 
                              ? `${formData.first_name} ${formData.last_name}`.trim() 
                              : 'Your Profile'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        disabled={!editing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        disabled={!editing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!editing}
                      className="pl-10"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!editing}
                      className="pl-10"
                      placeholder="123 Main St"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={!editing}
                      placeholder="New York"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      disabled={!editing}
                      placeholder="10001"
                    />
                  </div>
                </div>

                {editing && (
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                    <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        if (profile) {
                          setFormData({
                            first_name: profile.first_name || "",
                            last_name: profile.last_name || "",
                            phone: profile.phone || "",
                            address: profile.address || "",
                            city: profile.city || "",
                            postal_code: profile.postal_code || "",
                            avatar: profile.avatar || "",
                          });
                        }
                      }}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Management Tab */}
          <TabsContent value="account" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Account Management</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Manage your account settings and data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-4 sm:p-6">
                {/* Logout Section */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <LogOut className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium">Sign Out</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sign out of your account on this device. You can sign back in anytime.
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleSignOut} variant="outline" className="w-full sm:w-auto">
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </Button>
                </div>

                {/* Delete Account Section */}
                <div className="border border-destructive/50 rounded-lg p-4 space-y-3 bg-destructive/5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-destructive">Delete Account</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                        <li>All your profile information will be deleted</li>
                        <li>Your order history will be removed</li>
                        <li>You will be signed out immediately</li>
                      </ul>
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full sm:w-auto">
                        <Trash2 size={16} className="mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Order History Tab */}
          <TabsContent value="orders" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Order History</CardTitle>
                <CardDescription className="text-xs sm:text-sm">View your past orders and their status</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {loadingOrders ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <Button onClick={() => navigate('/')} className="mt-4">
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-3 sm:p-4 hover:bg-secondary/20 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0 mb-3">
                          <div className="flex-1">
                            <p className="font-medium text-sm sm:text-base">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="sm:text-right">
                            <p className="font-bold text-base sm:text-lg">Ksh{order.total_amount.toFixed(2)}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status.replace(/_/g, ' ')}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                                {order.payment_status}
                              </span>
                            </div>
                          </div>
                        </div>
                        {order.order_items && order.order_items.length > 0 && (
                          <div className="border-t pt-3 mt-3">
                            <p className="text-xs sm:text-sm font-medium mb-2">Items:</p>
                            <ul className="space-y-1">
                              {order.order_items.map((item: any, idx: number) => (
                                <li key={idx} className="text-xs sm:text-sm text-muted-foreground flex justify-between gap-2">
                                  <span className="flex-1">
                                    {item.quantity}x {item.product_name}
                                  </span>
                                  <span className="font-medium">Ksh{(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
