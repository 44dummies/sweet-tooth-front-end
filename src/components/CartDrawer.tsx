import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Trash2, Lock } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const CartDrawer = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please sign in to checkout");
      setOpen(false);
      setTimeout(() => {
        navigate("/login", { state: { from: { pathname: "/checkout" } } });
      }, 150);
      return;
    }

    setOpen(false);
    setTimeout(() => {
      navigate("/checkout");
    }, 150);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full border-2 hover:scale-105 transition-transform">
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 min-w-[20px] flex items-center justify-center p-0 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold shadow-md">
              {totalItems > 99 ? '99+' : totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Shopping Cart</span>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground">Add some delicious pastries to get started!</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-2xl border-2 border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 rounded-xl object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{item.title}</h4>
                    <div className="flex items-baseline gap-3">
                      <p className="text-sm text-muted-foreground">Ksh{item.price.toFixed(2)} each</p>
                      <p className="text-primary font-bold">Ksh{(item.price * item.quantity).toFixed(2)} total</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:scale-110 active:scale-95 transition-transform"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:scale-110 active:scale-95 transition-transform"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 ml-auto text-destructive hover:text-destructive hover:scale-110 active:scale-95 transition-transform"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 pt-4 space-y-4">
              <div className="flex items-center justify-between text-lg animate-fade-in">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary animate-pulse">
                  Ksh{totalPrice.toFixed(2)}
                </span>
              </div>
              {!user && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    You need to sign in to place an order. Click checkout to continue.
                  </p>
                </div>
              )}
              <Button
                className="w-full h-12 text-lg rounded-full hover:scale-105 active:scale-95 transition-transform duration-300 shadow-lg hover:shadow-xl"
                size="lg"
                onClick={handleCheckout}
              >
                {user ? "Proceed to Checkout" : "Sign In to Checkout"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
