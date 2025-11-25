import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ReviewCardProps {
  id?: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

const ReviewCard = ({ name, rating, comment, date }: ReviewCardProps) => {
  const initials = name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="backdrop-blur-sm bg-gradient-to-br from-card/40 to-card/20 border border-border/20 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">{name}</h4>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
        </div>
      </div>

      {}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={`${
              i < rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {}
      <p className="text-sm text-muted-foreground leading-relaxed flex-grow">{comment}</p>
    </Card>
  );
};

export default ReviewCard;
