import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ReviewCardProps {
  name: string;
  rating: number;
  comment: string;
  date: string;
}

const ReviewCard = ({ name, rating, comment, date }: ReviewCardProps) => {
  return (
    <Card className="p-6 rounded-2xl border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
          {name.charAt(0)}
        </div>
        <div className="ml-4 flex-1">
          <h4 className="font-semibold text-foreground">{name}</h4>
          <div className="flex items-center space-x-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={`${
                  i < rating
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-muted-foreground leading-relaxed mb-3">{comment}</p>
      <p className="text-sm text-muted-foreground">{date}</p>
    </Card>
  );
};

export default ReviewCard;
