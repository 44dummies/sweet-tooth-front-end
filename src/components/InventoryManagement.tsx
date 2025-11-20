import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Minus, AlertTriangle, Package } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  available: boolean;
  category: string;
}

const InventoryManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('title');

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId: string, newQuantity: number) => {
    if (newQuantity < 0) {
      toast.error('Stock cannot be negative');
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newQuantity })
        .eq('id', productId);

      if (error) throw error;
      
      toast.success('Stock updated');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update stock');
    }
  };

  const toggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ available: !currentStatus })
        .eq('id', productId);

      if (error) throw error;
      
      toast.success(currentStatus ? 'Product disabled' : 'Product enabled');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const updatePrice = async (productId: string, newPrice: number) => {
    if (newPrice <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ price: newPrice })
        .eq('id', productId);

      if (error) throw error;
      
      toast.success('Price updated');
      fetchProducts();
      setEditingProduct(null);
    } catch (err) {
      toast.error('Failed to update price');
    }
  };

  const getLowStockProducts = () => {
    return products.filter(p => p.stock_quantity <= p.low_stock_threshold && p.available);
  };

  const getOutOfStockProducts = () => {
    return products.filter(p => p.stock_quantity === 0 && p.available);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading inventory...</div>;
  }

  const lowStockProducts = getLowStockProducts();
  const outOfStockProducts = getOutOfStockProducts();

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {outOfStockProducts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <strong>Out of Stock Alert!</strong>
          </div>
          <p className="text-sm mt-2">
            {outOfStockProducts.map(p => p.title).join(', ')} - Please restock immediately
          </p>
        </div>
      )}

      {lowStockProducts.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
            <AlertTriangle className="w-5 h-5" />
            <strong>Low Stock Warning</strong>
          </div>
          <p className="text-sm mt-2">
            {lowStockProducts.map(p => `${p.title} (${p.stock_quantity} left)`).join(', ')}
          </p>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-6 h-6" />
            Inventory Management
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium">Price</th>
                <th className="text-left p-4 font-medium">Stock</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-secondary/20">
                  <td className="p-4 font-medium">{product.title}</td>
                  <td className="p-4">{product.category}</td>
                  <td className="p-4">
                    {editingProduct === product.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={product.price}
                          onBlur={(e) => updatePrice(product.id, parseFloat(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updatePrice(product.id, parseFloat(e.currentTarget.value));
                            }
                          }}
                          className="w-24 px-2 py-1 border rounded"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingProduct(product.id)}
                        className="hover:text-primary"
                      >
                        Ksh {product.price.toLocaleString()}
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStock(product.id, product.stock_quantity - 1)}
                        disabled={product.stock_quantity === 0}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className={`w-12 text-center font-semibold ${
                        product.stock_quantity === 0 ? 'text-red-500' :
                        product.stock_quantity <= product.low_stock_threshold ? 'text-orange-500' :
                        'text-green-500'
                      }`}>
                        {product.stock_quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStock(product.id, product.stock_quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      product.available ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'
                    }`}>
                      {product.available ? 'Available' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button
                      size="sm"
                      variant={product.available ? 'destructive' : 'default'}
                      onClick={() => toggleAvailability(product.id, product.available)}
                    >
                      {product.available ? 'Disable' : 'Enable'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground mb-2">Total Products</p>
          <p className="text-3xl font-bold">{products.length}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground mb-2">Low Stock Items</p>
          <p className="text-3xl font-bold text-orange-500">{lowStockProducts.length}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground mb-2">Out of Stock</p>
          <p className="text-3xl font-bold text-red-500">{outOfStockProducts.length}</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
