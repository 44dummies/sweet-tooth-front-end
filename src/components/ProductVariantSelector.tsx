import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, ShoppingCart, Minus, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProductVariant {
  id: string;
  name: string;
  priceModifier?: number; // Added cost or discount
  description?: string;
}

interface ProductVariantSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    image: string;
    variantType: string;
    flavorOptions?: string[];
    sizeOptions?: ProductVariant[];
    quantityOptions?: ProductVariant[];
  };
}

const ProductVariantSelector = ({ isOpen, onClose, product }: ProductVariantSelectorProps) => {
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductVariant | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const hasFlavors = product.flavorOptions && product.flavorOptions.length > 0;
  const hasSizes = product.sizeOptions && product.sizeOptions.length > 0;
  const hasQuantities = product.quantityOptions && product.quantityOptions.length > 0;

  // Calculate final price
  const calculatePrice = () => {
    let finalPrice = product.price;
    if (selectedSize?.priceModifier) {
      finalPrice += selectedSize.priceModifier;
    }
    if (selectedQuantity?.priceModifier) {
      finalPrice += selectedQuantity.priceModifier;
    }
    return finalPrice;
  };

  const handleAddToCart = () => {
    // Check if user is signed in
    if (!user) {
      toast.error("Please sign in to add items to cart");
      onClose();
      navigate("/login");
      return;
    }

    // Validate required selections
    if (hasFlavors && !selectedFlavor) {
      toast.error(`Please select a flavor`);
      return;
    }
    if (hasSizes && !selectedSize) {
      toast.error(`Please select a size`);
      return;
    }
    if (hasQuantities && !selectedQuantity) {
      toast.error(`Please select a quantity`);
      return;
    }

    // Build variant description
    const variantParts: string[] = [];
    if (selectedFlavor) variantParts.push(selectedFlavor);
    if (selectedSize) variantParts.push(selectedSize.name);
    if (selectedQuantity) variantParts.push(selectedQuantity.name);
    
    const variantDescription = variantParts.join(' - ');
    const finalPrice = calculatePrice();

    const item = {
      id: `${product.id}-${variantParts.join('-').toLowerCase().replace(/\s+/g, '-')}`,
      title: variantDescription ? `${product.title} - ${variantDescription}` : product.title,
      image: product.image,
      price: finalPrice,
      quantity: quantity,
      variant: variantDescription,
      baseProductId: product.id,
    };

    addItem(item);
    toast.success(`${product.title} added to cart`);
    
    // Reset selections
    setSelectedFlavor(null);
    setSelectedSize(null);
    setSelectedQuantity(null);
    setQuantity(1);
    onClose();
  };

  const variantLabel = product.variantType === 'flavor' ? 'Flavor' :
                       product.variantType === 'filling' ? 'Filling' :
                       product.variantType === 'topping' ? 'Topping' : 'Option';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.title}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Image */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold">
              Ksh {calculatePrice().toLocaleString()}
            </div>
          </div>

          {/* Flavor Selection */}
          {hasFlavors && (
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Choose Your {variantLabel}:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.flavorOptions!.map((flavor) => (
                  <Badge
                    key={flavor}
                    variant={selectedFlavor === flavor ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-2 text-sm transition-all hover:scale-105 ${
                      selectedFlavor === flavor
                        ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                        : "hover:bg-primary/10"
                    }`}
                    onClick={() => setSelectedFlavor(flavor)}
                  >
                    {selectedFlavor === flavor && (
                      <Check className="w-3 h-3 mr-1" />
                    )}
                    {flavor}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {hasSizes && (
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Choose Size:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.sizeOptions!.map((size) => (
                  <div
                    key={size.id}
                    className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:scale-105 ${
                      selectedSize?.id === size.id
                        ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{size.name}</p>
                        {size.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {size.description}
                          </p>
                        )}
                      </div>
                      {selectedSize?.id === size.id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    {size.priceModifier !== undefined && size.priceModifier !== 0 && (
                      <p className="text-xs font-medium text-primary mt-1">
                        {size.priceModifier > 0 ? '+' : ''}Ksh {size.priceModifier}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Options (e.g., 6, 12, 24 pieces) */}
          {hasQuantities && (
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Choose Quantity:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {product.quantityOptions!.map((qty) => (
                  <div
                    key={qty.id}
                    className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:scale-105 text-center ${
                      selectedQuantity?.id === qty.id
                        ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedQuantity(qty)}
                  >
                    <div className="flex flex-col items-center">
                      <p className="font-bold text-lg">{qty.name}</p>
                      {qty.description && (
                        <p className="text-xs text-muted-foreground">
                          {qty.description}
                        </p>
                      )}
                      {selectedQuantity?.id === qty.id && (
                        <Check className="w-4 h-4 text-primary mt-1" />
                      )}
                      {qty.priceModifier !== undefined && qty.priceModifier !== 0 && (
                        <p className="text-xs font-medium text-primary mt-1">
                          {qty.priceModifier > 0 ? '+' : ''}Ksh {qty.priceModifier}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cart Quantity Adjuster */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Number of Items:
            </label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-bold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Selection Summary */}
          {(selectedFlavor || selectedSize || selectedQuantity) && (
            <div className="bg-muted/50 rounded-lg p-3 border">
              <p className="text-sm text-muted-foreground mb-1">Your selection:</p>
              <p className="font-semibold">
                {product.title}
                {selectedFlavor && <span className="text-primary"> - {selectedFlavor}</span>}
                {selectedSize && <span className="text-primary"> - {selectedSize.name}</span>}
                {selectedQuantity && <span className="text-primary"> - {selectedQuantity.name}</span>}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Total: <span className="font-semibold text-foreground">Ksh {(calculatePrice() * quantity).toLocaleString()}</span>
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={(hasFlavors && !selectedFlavor) || (hasSizes && !selectedSize) || (hasQuantities && !selectedQuantity)}
            className="flex-1"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductVariantSelector;
