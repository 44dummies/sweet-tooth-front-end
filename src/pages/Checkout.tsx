import React, { useState, useEffect } from "react";
import ModernNavbar from "@/components/ModernNavbar";
import Footer from "@/components/Footer";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNotifications } from "@/hooks/useNotifications";

const defaultProductImage = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80";

const Checkout = () => {
  const { items, totalPrice, clearCart, addItem, updateQuantity, removeItem } = useCart();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { permission, requestPermission, sendNotification } = useNotifications();

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    deliveryDate: "",
    cakeSpecifications: "",
  });
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


  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('in_stock', true)
          .order('name');

        if (error) throw error;


        const mappedItems = (data || []).map(item => ({
          id: item.id,
          image: item.image_url || defaultProductImage,
          title: item.name || item.title,
          description: item.description || '',
          price: item.price,
        }));

        setMenuItems(mappedItems);
      } catch (err) {
        console.error('Error fetching menu items:', err);
      } finally {
        setLoadingMenu(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleAddProduct = () => {
    if (selectedProduct) {
      addItem({
        id: selectedProduct.id,
        title: selectedProduct.title,
        price: selectedProduct.price,
        image: selectedProduct.image,
      });
      for (let i = 1; i < productQuantity; i++) {
        addItem({
          id: selectedProduct.id,
          title: selectedProduct.title,
          price: selectedProduct.price,
          image: selectedProduct.image,
        });
      }
      toast.success(`${selectedProduct.title} added to cart!`);
      setSelectedProduct(null);
      setProductQuantity(1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([{
            customer_name: formData.name,
            customer_email: formData.email || user.email,
            customer_phone: formData.phone,
            delivery_address: formData.address,
            delivery_date: formData.deliveryDate,
            special_instructions: formData.cakeSpecifications || null,
            total_amount: totalPrice,
            status: 'pending',
            payment_status: 'pending',
          }])
          .select()
          .single();

        if (orderError) {
          console.error('❌ Supabase order insert error:', orderError);
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
            console.error('❌ Failed to insert order items:', itemsError);
          }
        }
      } catch (supabaseError: any) {
        console.error('❌ SUPABASE ERROR:', supabaseError);
        console.error('Error details:', {
          message: supabaseError?.message,
          details: supabaseError?.details,
          hint: supabaseError?.hint,
          code: supabaseError?.code
        });
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

      clearCart();
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {}
          <div className="lg:col-span-1 bg-card p-4 sm:p-6 rounded-lg border h-fit lg:sticky lg:top-24">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Select Products</h2>
            {loadingMenu ? (
              <div className="text-center py-8">
                <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="mt-2 text-sm text-muted-foreground">Loading menu...</p>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No products available at the moment.</p>
              </div>
            ) : (
            <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
              {menuItems.map((item) => {
                const isInCart = items.some((cartItem) => cartItem.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!isInCart) {
                        addItem({
                          id: item.id,
                          title: item.title,
                          price: item.price,
                          image: item.image,
                        });
                        setSelectedProduct(item);
                        toast.success(`${item.title} added to cart!`);
                      } else {
                        setSelectedProduct(item);
                      }
                    }}
                    className={`w-full text-left p-2 sm:p-3 rounded-lg border-2 transition-all relative group ${
                      selectedProduct?.id === item.id
                        ? "border-primary bg-primary/10"
                        : isInCart
                        ? "border-green-500 bg-green-500/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-20 sm:h-24 object-cover rounded-md mb-2"
                    />
                    <div className="font-medium text-xs sm:text-sm">{item.title}</div>
                    <div className="text-xs sm:text-sm text-primary font-semibold">Ksh{item.price}</div>
                    {isInCart && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                          In Cart
                        </span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                            toast.success(`${item.title} removed from cart!`);
                          }}
                          className="text-xs bg-destructive text-white px-2 py-1 rounded hover:bg-destructive/90 transition-colors cursor-pointer"
                        >
                          Remove
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            )}

            {}
            {selectedProduct && (() => {
              const isInCart = items.some((item) => item.id === selectedProduct.id);
              const cartItem = items.find((item) => item.id === selectedProduct.id);
              return (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t space-y-3 sm:space-y-4">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    className="w-full h-32 sm:h-40 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-2">{selectedProduct.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                      {selectedProduct.description}
                    </p>
                    <div className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4">
                      Ksh{selectedProduct.price}
                    </div>

                    {!isInCart ? (
                      <>
                        {}
                        <div className="flex items-center gap-2 mb-4">
                          <button
                            onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                            className="p-2 rounded-lg border hover:bg-secondary"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="flex-1 text-center font-semibold">
                            {productQuantity}
                          </span>
                          <button
                            onClick={() => setProductQuantity(productQuantity + 1)}
                            className="p-2 rounded-lg border hover:bg-secondary"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <Button
                          onClick={handleAddProduct}
                          className="w-full rounded-full h-10"
                        >
                          Add to Cart
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="bg-green-500/10 border border-green-500 rounded-lg p-3 mb-4">
                          <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                            ✓ This item is in your cart
                          </p>
                          {cartItem && (
                            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                              Quantity: {cartItem.quantity}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              removeItem(selectedProduct.id);
                              toast.success("Item removed from cart");
                            }}
                            variant="outline"
                            className="flex-1 rounded-full border-destructive text-destructive hover:bg-destructive/10"
                          >
                            Remove from Cart
                          </Button>
                          <Button
                            onClick={() => {
                              addItem({
                                id: selectedProduct.id,
                                title: selectedProduct.title,
                                price: selectedProduct.price,
                                image: selectedProduct.image,
                              });
                              toast.success("Added another to cart");
                            }}
                            className="flex-1 rounded-full"
                          >
                            Add More
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {}
          <form className="lg:col-span-2 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {}
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

                  {}
                  <div className="space-y-2">
                    <label htmlFor="checkout-address-logged" className="block text-sm font-medium">
                      Delivery Address *
                    </label>
                    <textarea
                      id="checkout-address-logged"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your delivery address (street, building, city)"
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      required
                      autoComplete="street-address"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the address where you'd like your order delivered
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
                    <label htmlFor="checkout-address" className="block text-sm font-medium mb-2">Delivery Address *</label>
                    <textarea
                      id="checkout-address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street address, city, postal code"
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      autoComplete="street-address"
                    />
                  </div>
                </div>
              )}
            </div>

            {}
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

            {}
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

          {}
          <aside className="bg-card border rounded-lg p-4 sm:p-6 h-fit lg:sticky lg:top-24">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Order Summary</h2>
            {items.length === 0 ? (
              <p className="text-muted-foreground">Your cart is empty</p>
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
                        <div className="text-xs text-muted-foreground">x{item.quantity}</div>
                        <div className="text-xs sm:text-sm font-semibold text-primary mt-0.5 sm:mt-1">
                          Ksh{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-destructive mt-0.5 sm:mt-1 h-5 sm:h-6 px-1 sm:px-2"
                        >
                          Remove
                        </Button>
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
