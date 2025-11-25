import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Minus, AlertTriangle, Package, Database, Trash2, Edit2, X, Upload, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Product {
  id: string;
  name?: string;
  title: string;
  description?: string;
  price: number;
  stock_quantity: number;
  available: boolean;
  in_stock?: boolean;
  category: string;
  image_url?: string;
  image_key?: string;
}

// Curated Kenyan bakery catalogue with transparent pricing rules
const SEED_PRODUCTS = [
  // Signature Cakes (baseline 1kg = 2000)
  {
    name: "Classic Black Forest (1kg)",
    description: "Layers of chocolate sponge, fresh cream, and locally sourced cherries.",
    price: 2000,
    category: "cakes",
    in_stock: true,
    stock_quantity: 16,
    image_url: "https://images.unsplash.com/photo-1505250469679-203ad9ced0cb?w=800&q=80",
    image_key: "black-forest"
  },
  {
    name: "Red Velvet Luxe (1.5kg)",
    description: "Deep red cocoa cake with whipped cream-cheese frosting.",
    price: 3000,
    category: "cakes",
    in_stock: true,
    stock_quantity: 12,
    image_url: "https://images.unsplash.com/photo-1509401934319-cb35b87bf1ec?w=800&q=80",
    image_key: "red-velvet"
  },
  {
    name: "Vanilla Bean Celebration (1kg)",
    description: "Madagascar vanilla sponge finished with silky buttercream.",
    price: 2000,
    category: "cakes",
    in_stock: true,
    stock_quantity: 18,
    image_url: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800&q=80",
    image_key: "vanilla-bean"
  },
  {
    name: "Salted Caramel Crunch (2kg)",
    description: "Two kilograms of caramel sponge layered with praline crunch.",
    price: 4000,
    category: "cakes",
    in_stock: true,
    stock_quantity: 8,
    image_url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80",
    image_key: "salted-caramel"
  },
  {
    name: "Passion Fruit Cheesecake (1kg)",
    description: "Baked cheesecake infused with Kenyan passion fruit pulp.",
    price: 2200,
    category: "cakes",
    in_stock: true,
    stock_quantity: 10,
    image_url: "https://images.unsplash.com/photo-1505253216365-1d0456a72ce5?w=800&q=80",
    image_key: "passion-cheesecake"
  },
  {
    name: "Mocha Espresso Torte (1.5kg)",
    description: "Chocolate espresso sponge with Kenyan AA coffee buttercream.",
    price: 3000,
    category: "cakes",
    in_stock: true,
    stock_quantity: 9,
    image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
    image_key: "mocha-torte"
  },

  // Everyday Treats
  {
    name: "Cinnamon Rolls (6pcs)",
    description: "Soft rolls baked with cinnamon sugar and vanilla glaze.",
    price: 600,
    category: "pastries",
    in_stock: true,
    stock_quantity: 24,
    image_url: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800&q=80",
    image_key: "cinnamon-rolls"
  },
  {
    name: "Cardamom Mandazi (10pcs)",
    description: "Golden mandazi with coconut milk and cardamom.",
    price: 450,
    category: "pastries",
    in_stock: true,
    stock_quantity: 30,
    image_url: "https://images.unsplash.com/photo-1496042399011-7c03a0be49b0?w=800&q=80",
    image_key: "mandazi"
  },
  {
    name: "Swahili Coconut Cupcakes (6pcs)",
    description: "Coconut cream cupcakes topped with toasted flakes.",
    price: 900,
    category: "cupcakes",
    in_stock: true,
    stock_quantity: 20,
    image_url: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&q=80",
    image_key: "coconut-cupcakes"
  },
  {
    name: "Chocolate Chip Cookies (12pcs)",
    description: "Chewy dark-chocolate chip cookies baked with brown butter.",
    price: 700,
    category: "cookies",
    in_stock: true,
    stock_quantity: 28,
    image_url: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800&q=80",
    image_key: "cookies"
  },
  {
    name: "Macadamia Brownies (8pcs)",
    description: "Fudgy brownies folded with Kenyan macadamia nuts.",
    price: 950,
    category: "brownies",
    in_stock: true,
    stock_quantity: 14,
    image_url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
    image_key: "brownies"
  },
  {
    name: "Tea-Time Marble Loaf", 
    description: "Vanilla-chocolate marble loaf perfect with afternoon chai.",
    price: 1200,
    category: "loaves",
    in_stock: true,
    stock_quantity: 15,
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    image_key: "marble-loaf"
  },
  {
    name: "White Chocolate Raspberry Slice",
    description: "Single-serve slice with raspberry coulis drizzle.",
    price: 450,
    category: "slices",
    in_stock: true,
    stock_quantity: 22,
    image_url: "https://images.unsplash.com/photo-1505251245473-0f252e5a5d87?w=800&q=80",
    image_key: "raspberry-slice"
  },
];

const CATEGORIES = ["cakes", "cupcakes", "pastries", "cookies", "brownies", "specialty", "loaves", "slices", "wedding"];
const LOW_STOCK_LIMIT = 5;

const isLowStock = (quantity: number) => quantity <= LOW_STOCK_LIMIT;

const InventoryManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category: "cakes",
    stock_quantity: 10,
    image_key: "",
    image_url: ""
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      // Map to expected format
      const mappedProducts = (data || []).map(p => ({
        ...p,
        title: p.name || p.title || 'Unnamed',
        available: p.in_stock !== false
      }));
      setProducts(mappedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const seedProducts = async () => {
    setSeeding(true);
    try {
      // First check if products already exist
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (count && count > 0) {
        const confirm = window.confirm(`There are already ${count} products in the database. Do you want to add more products? (Duplicates may be created)`);
        if (!confirm) {
          setSeeding(false);
          return;
        }
      }

      const { error } = await supabase
        .from('products')
        .insert(SEED_PRODUCTS);

      if (error) throw error;
      
      toast.success(`Successfully added ${SEED_PRODUCTS.length} products to the database!`);
      fetchProducts();
    } catch (err: any) {
      console.error('Error seeding products:', err);
      toast.error(`Failed to seed products: ${err.message || 'Unknown error'}`);
    } finally {
      setSeeding(false);
    }
  };

  const deleteAllProducts = async () => {
    if (!window.confirm('⚠️ Are you sure you want to delete ALL products? This cannot be undone!')) return;
    if (!window.confirm('This will permanently remove all products from the database. Type YES to confirm.')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;
      toast.success('All products deleted');
      fetchProducts();
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || newProduct.price <= 0) {
      toast.error('Please fill in required fields (name and price)');
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          category: newProduct.category,
          stock_quantity: newProduct.stock_quantity,
          image_key: newProduct.image_key || newProduct.name.toLowerCase().replace(/\s+/g, '-'),
          image_url: newProduct.image_url,
          in_stock: true
        });

      if (error) throw error;
      
      toast.success('Product added successfully!');
      setShowAddDialog(false);
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        category: "cakes",
        stock_quantity: 10,
        image_key: "",
        image_url: ""
      });
      fetchProducts();
    } catch (err: any) {
      toast.error(`Failed to add product: ${err.message}`);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!window.confirm('Delete this product?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast.success('Product deleted');
      fetchProducts();
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      setNewProduct(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image uploaded!');
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
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
        .update({ in_stock: !currentStatus })
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
    return products.filter(p => isLowStock(p.stock_quantity) && p.available);
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
      {/* Database Actions */}
      <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Management
            </h3>
            <p className="text-sm text-muted-foreground">
              {products.length} products in database
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input 
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Chocolate Cake"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Product description..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (KSH) *</Label>
                      <Input 
                        id="price"
                        type="number"
                        value={newProduct.price || ''}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={newProduct.category} 
                        onValueChange={(val) => setNewProduct(prev => ({ ...prev, category: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input 
                      id="stock"
                      type="number"
                      value={newProduct.stock_quantity}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Product Image</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <label className="cursor-pointer">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload}
                          disabled={uploading}
                        />
                        <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-secondary/50">
                          <Upload className="w-4 h-4" />
                          {uploading ? 'Uploading...' : 'Upload Image'}
                        </div>
                      </label>
                      {newProduct.image_url && (
                        <img 
                          src={newProduct.image_url} 
                          alt="Preview" 
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                    </div>
                    <Input 
                      className="mt-2"
                      value={newProduct.image_url}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="Or paste image URL..."
                    />
                  </div>
                  <Button onClick={addProduct} className="w-full">
                    Add Product
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              onClick={seedProducts} 
              disabled={seeding}
              variant="outline"
              className="border-pink-500 text-pink-600 hover:bg-pink-500/10"
            >
              <Database className="w-4 h-4 mr-2" />
              {seeding ? 'Seeding...' : 'Seed Sample Products'}
            </Button>
            
            {products.length > 0 && (
              <Button 
                onClick={deleteAllProducts}
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>
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
                <th className="text-left p-4 font-medium">Price (KSH)</th>
                <th className="text-left p-4 font-medium">Stock</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No products yet</p>
                    <p className="text-sm">Click "Seed Sample Products" to add starter products or "Add Product" to create new ones.</p>
                  </td>
                </tr>
              ) : products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-secondary/20">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.image_url && (
                        <img src={product.image_url} alt={product.title} className="w-10 h-10 rounded object-cover" />
                      )}
                      <div>
                        <p className="font-medium">{product.name || product.title}</p>
                        {product.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-secondary rounded text-sm capitalize">
                      {product.category}
                    </span>
                  </td>
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
                        isLowStock(product.stock_quantity) ? 'text-orange-500' :
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
                      className="mr-2"
                    >
                      {product.available ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteProduct(product.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
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
