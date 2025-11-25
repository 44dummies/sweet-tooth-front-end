import React, { useState, useEffect } from "react";
import ModernNavbar from "@/components/ModernNavbar";
import Footer from "@/components/Footer";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, Trash2, Plus, Minus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNotifications } from "@/hooks/useNotifications";
import LocationPicker from "@/components/LocationPicker";

const Checkout = () => {
  const { items, totalPrice, clearCart, updateQuantity, removeItem } = useCart();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { permission, requestPermission, sendNotification } = useNotifications();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    deliveryDate: "",
    cakeSpecifications: "",
  });
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPlacedAnimation, setShowPlacedAnimation] = useState(false);
  const [notificationRequested, setNotificationRequested] = useState(false);

  useEffect(() => {
    if (user && !notificationRequested && permission !== 'granted') {
      const timer = setTimeout(() => {
        requestPermission();
        setNotificationRequested(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, permission, notificationRequested, requestPermission]);

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        phone: profile.phone || "",
        address: profile.address || "",
      }));
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (address: string, coordinates?: { lat: number; lng: number }) => {
    setFormData((prev) => ({ ...prev, address }));
    if (coordinates) {
      setDeliveryCoords(coordinates);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      toast.error("Please sign in to place an order");
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!formData.phone) {
      toast.error("Please provide a phone number for delivery coordination");
      return;
    }

    if (!formData.address) {
      toast.error("Please enter a delivery address");
      return;
    }

    if (!formData.deliveryDate) {
      toast.error("Please select a delivery date");
      return;
    }

    setIsSubmitting(true);

    try {
      let orderId = null;

      try {
        const orderData: any = {
          customer_name: formData.name,
          customer_email: formData.email || user.email,
          customer_phone: formData.phone,
          delivery_address: formData.address,
          delivery_date: formData.deliveryDate,
          special_instructions: formData.cakeSpecifications || null,
          total_amount: totalPrice,
          status: 'PENDING',
          payment_status: 'PENDING',
        };

        if (deliveryCoords) {
          orderData.delivery_lat = deliveryCoords.lat;
          orderData.delivery_lng = deliveryCoords.lng;
        }

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single();

        if (orderError) {
          console.error('Supabase order insert error:', orderError);
          throw orderError;
        }

        if (order) {
          orderId = order.id;

          const itemsPayload = items.map(item => ({
            order_id: order.id,
            product_name: item.title,
            quantity: item.quantity,
            price: item.price
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsPayload);

          if (itemsError) {
            console.error('Failed to insert order items:', itemsError);
          }
        }
      } catch (supabaseError: any) {
        console.error('SUPABASE ERROR:', supabaseError);
        toast.error(`Database error: ${supabaseError?.message || 'Failed to save order'}`);
      }

      clearCart();

      const orderData = {
        id: orderId || Date.now(),
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
        items: items,
        total: totalPrice,
        deliveryDate: formData.deliveryDate,
        cakeSpecifications: formData.cakeSpecifications,
        orderDate: new Date().toISOString(),
        status: "pending",
      };

      const existingOrders = JSON.parse(localStorage.getItem("sweet_tooth_orders") || "[]");
      existingOrders.push(orderData);
      localStorage.setItem("sweet_tooth_orders", JSON.stringify(existingOrders));

      if (orderId) {
        try {
          const { error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
            body: {
              orderId: orderId,
              customerPhone: formData.phone,
              customerName: formData.name,
              totalAmount: totalPrice,
            }
          });

          if (whatsappError) {
            console.error('WhatsApp notification error:', whatsappError);
          }

          if (formData.email) {
            const { error: emailError } = await supabase.functions.invoke('send-email-notification', {
              body: {
                orderId: orderId,
                customerEmail: formData.email,
                customerName: formData.name,
              }
            });

            if (emailError) {
              console.error('Email notification error:', emailError);
            }
          }
        } catch (notifError) {
          console.error('Notification error:', notifError);
        }
      }

      setShowPlacedAnimation(true);

      sendNotification('Order Placed Successfully! 🎉', {
        body: `Your order #${orderId?.toString().slice(0, 8) || 'NEW'} has been received. We'll notify you when it's confirmed.`,
        icon: '/logo.png',
        badge: '/logo.png',
      });

      toast.success("Order confirmed! We'll contact you soon via WhatsApp.");
      setTimeout(() => {
        setShowPlacedAnimation(false);
        navigate("/");
      }, 1100);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col pb-20 md:pb-8">
      <ModernNavbar />
      {showPlacedAnimation && <LoadingOverlay />}
      <main className="container mx-auto px-4 py-6 md:py-8 flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Complete Your Order</h1>
          {!user && !authLoading && (
            <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base w-full sm:w-auto justify-center">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">
                Sign in required to place order
              </span>
            </div>
          )}
          {user && profile && (
            <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 sm:px-4 py-2 rounded-full w-full sm:w-auto justify-center">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">
                Signed in as {profile.first_name}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <form className="lg:col-span-2 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="bg-card p-4 sm:p-6 rounded-lg border">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Order Information</h2>
              {user && profile ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-lg border border-primary/20">
                    <p className="text-sm font-medium text-foreground mb-2">Ordering as:</p>
                    <p className="font-semibold text-lg">{formData.name}</p>
                    <p className="text-sm text-muted-foreground">{formData.email}</p>
                    {formData.phone && (
                      <p className="text-sm text-muted-foreground mt-1">📱 {formData.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="checkout-address-logged" className="block text-sm font-medium">
                      Delivery Location *
                    </label>
                    <LocationPicker
                      value={formData.address}
                      onChange={handleLocationChange}
                      placeholder="Click to select delivery location on map"
                    />
                    <p className="text-xs text-muted-foreground">
                      Click to open map and select your exact delivery location
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label htmlFor="checkout-name" className="block text-sm font-medium mb-2">Full Name *</label>
                    <input
                      id="checkout-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-email" className="block text-sm font-medium mb-2">Email</label>
                    <input
                      id="checkout-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-phone" className="block text-sm font-medium mb-2">Phone Number *</label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="254712345678"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-address" className="block text-sm font-medium mb-2">Delivery Location *</label>
                    <LocationPicker
                      value={formData.address}
                      onChange={handleLocationChange}
                      placeholder="Click to select delivery location on map"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card p-4 sm:p-6 rounded-lg border">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Delivery & Special Requests</h2>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="checkout-delivery-date" className="block text-sm font-medium mb-2">Preferred Delivery Date *</label>
                  <input
                    id="checkout-delivery-date"
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground [color-scheme:light] dark:[color-scheme:dark]"
                    required
                    autoComplete="off"
                  />
                  {formData.deliveryDate && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {new Date(formData.deliveryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-cake-specs" className="block text-sm font-medium mb-2">Special Requests (Optional)</label>
                  <textarea
                    id="checkout-cake-specs"
                    name="cakeSpecifications"
                    value={formData.cakeSpecifications}
                    onChange={handleChange}
                    placeholder="Any special requests, dietary requirements, or customization details..."
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    autoComplete="off"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    e.g., "No nuts", "Gluten-free", "Happy Birthday John on the cake"
                  </p>
                </div>
              </div>
            </div>

            {!user ? (
              <Button
                type="button"
                onClick={() => {
                  toast.info("Please sign in to place your order");
                  navigate("/login", { state: { from: { pathname: "/checkout" } } });
                }}
                size="lg"
                className="w-full h-12 text-lg rounded-full gap-2"
              >
                <Lock size={18} />
                Sign In to Place Order
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full h-12 text-lg rounded-full"
              >
                {isSubmitting ? "Processing Order..." : "Place Order"}
              </Button>
            )}
          </form>

          <aside className="bg-card border rounded-lg p-4 sm:p-6 h-fit lg:sticky lg:top-24">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Order Summary</h2>
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Button variant="outline" onClick={() => navigate('/menu')}>
                  Browse Menu
                </Button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-2 sm:gap-3 pb-2 sm:pb-3 border-b">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs sm:text-sm truncate">{item.title}</div>
                        {item.variant && (
                          <div className="text-xs text-primary">{item.variant}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-xs sm:text-sm font-semibold text-primary">
                            Ksh{(item.price * item.quantity).toFixed(2)}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-xs text-destructive h-6 px-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 pt-3 sm:pt-4 space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>Ksh{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Delivery:</span>
                    <span>To be confirmed</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-primary">Ksh{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
