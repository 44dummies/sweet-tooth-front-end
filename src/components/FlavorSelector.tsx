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
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface FlavorSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    image: string;
    variantType: string;
    flavorOptions: string[];
  };
}

const FlavorSelector = ({ isOpen, onClose, product }: FlavorSelectorProps) => {
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!selectedFlavor) {
      toast.error(`Please select a ${product.variantType}`);
      return;
    }

    const item = {
      id: `${product.id}-${selectedFlavor.toLowerCase().replace(/\s+/g, '-')}`,
      title: `${product.title} - ${selectedFlavor}`,
      image: product.image,
      price: product.price,
      quantity: 1,
      variant: selectedFlavor,
      baseProductId: product.id,
    };

    addItem(item);
    toast.success(`${product.title} (${selectedFlavor}) added to cart`);
    setSelectedFlavor(null);
    onClose();
  };

  const variantLabel = product.variantType === 'flavor' ? 'Flavor' : 
                       product.variantType === 'filling' ? 'Filling' :
                       product.variantType === 'topping' ? 'Topping' : 'Option';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
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
              Ksh {product.price.toLocaleString()}
            </div>
          </div>

          {/* Flavor Selection */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Choose Your {variantLabel}:
            </label>
            <div className="flex flex-wrap gap-2">
              {product.flavorOptions.map((flavor) => (
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

          {/* Selected Summary */}
          {selectedFlavor && (
            <div className="bg-muted/50 rounded-lg p-3 border">
              <p className="text-sm text-muted-foreground">Your selection:</p>
              <p className="font-semibold">
                {product.title} - <span className="text-primary">{selectedFlavor}</span>
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={!selectedFlavor}
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

export default FlavorSelector;
