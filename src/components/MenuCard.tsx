import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface MenuCardProps {
  id: string;
  image: string;
  title: string;
  description: string;
  price: string; 
}

const MenuCard = ({ id, image, title, description, price }: MenuCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    const numericPrice = parseFloat(price.replace("$", ""));

    const item = {
      id,
      title,
      image,
      price: numericPrice,
      quantity: 1,
    };

    addItem(item);
    toast.success(`${title} added to cart`);
  };

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      </CardHeader>

      <CardContent className="p-5 flex flex-col flex-1">
        <CardTitle className="text-xl font-semibold mb-2">{title}</CardTitle>

        <p className="text-muted-foreground text-sm flex-grow">{description}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">{price}</span>

          <Button onClick={handleAddToCart} size="sm">
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuCard;
