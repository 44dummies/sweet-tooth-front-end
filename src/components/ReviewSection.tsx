import { useState, useEffect } from "react";
import ReviewCard from "./ReviewCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const reviews = [
  {
    name: "Damian Muindi",
    rating: 5,
    comment: "Absolutely divine! The birthday cake I ordered was not only beautiful but incredibly delicious. Everyone at the party kept asking where I got it from!",
    date: "2 weeks ago",
  },
  {
    name: "Cecile Mungai",
    rating: 5,
    comment: "Best muffins I've ever had! Fresh, moist, and perfectly sweet. The blueberry ones are my favorite. Highly recommend!",
    date: "1 month ago",
  },
  {
    name: "Emily Rodriguez",
    rating: 5,
    comment: "The banana bread loaf was perfection! It reminded me of my grandmother's recipe. Will definitely be ordering again.",
    date: "3 weeks ago",
  },
  {
    name: "David Kimani",
    rating: 5,
    comment: "Ordered a custom birthday cake for my daughter's 5th birthday. It exceeded all expectations! Beautiful design and tasted amazing.",
    date: "1 week ago",
  },
];

const ReviewsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, reviews.length - itemsPerPage);

  const nextReview = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <section id="reviews" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from our delighted customers
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out gap-6"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              }}
            >
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="flex-shrink-0"
                  style={{ width: `${100 / itemsPerPage}%` }}
                >
                  <div className="px-3">
                    <ReviewCard {...review} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {reviews.length > itemsPerPage && (
            <>
              <Button
                onClick={prevReview}
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <ChevronLeft size={24} />
              </Button>
              <Button
                onClick={nextReview}
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <ChevronRight size={24} />
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
