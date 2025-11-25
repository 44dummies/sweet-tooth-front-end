import { useState, useEffect, useRef } from "react";
import ReviewCard from "./ReviewCard.tsx";
import ReviewSubmission from "./ReviewSubmission.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { supabase } from "@/lib/supabase";

const staticReviews = [
  {
    name: "Danielle Warui",
    rating: 5,
    comment: "Absolutely divine! The birthday cake I ordered was not only beautiful but incredibly delicious. Everyone at the party kept asking where I got it from!",
    date: "2 weeks ago",
  },
  {
    name: "Kevin Mwangi",
    rating: 5,
    comment: "Best muffins I've ever had! Fresh, moist, and perfectly sweet. The blueberry ones are my favorite. Highly recommend!",
    date: "1 month ago",
  },
  {
    name: "Stephanie Kimani",
    rating: 5,
    comment: "The banana bread loaf was perfection! It reminded me of my grandmother's recipe. Will definitely be ordering again.",
    date: "3 weeks ago",
  },
  {
    name: "Damian Muindi",
    rating: 5,
    comment: "Ordered a custom birthday cake for my daughter's 5th birthday. It exceeded all expectations! Beautiful design and tasted amazing.",
    date: "1 week ago",
  },
];

const ReviewsSection = () => {
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.2 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [allReviews, setAllReviews] = useState<any[]>(staticReviews);
  const [isPaused, setIsPaused] = useState(false);
  const startX = useRef<number | null>(null);
  const isPointerDown = useRef(false);
  const autoScrollTimer = useRef<number | null>(null);

  useEffect(() => {
    fetchReviews();

    const channel = supabase
      .channel('reviews-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: 'approved=eq.true'
        },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDbReviews = (data || []).map(review => ({
        name: review.name,
        rating: review.rating,
        comment: review.comment,
        date: getRelativeTime(review.created_at)
      }));

      setAllReviews([...formattedDbReviews, ...staticReviews]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setAllReviews(staticReviews);
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? 's' : ''} ago`;
  };

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
  }, [allReviews]);

  const maxIndex = Math.max(0, allReviews.length - itemsPerPage);

  useEffect(() => {
    if (window.innerWidth >= 768) return; 

    const startAutoScroll = () => {
      if (autoScrollTimer.current) {
        window.clearInterval(autoScrollTimer.current);
      }
      
      autoScrollTimer.current = window.setInterval(() => {
        if (!isPaused && !isPointerDown.current) {
          setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }
      }, 4000); 
    };

    startAutoScroll();

    return () => {
      if (autoScrollTimer.current) {
        window.clearInterval(autoScrollTimer.current);
      }
    };
  }, [isPaused, maxIndex, allReviews]);

  const nextReview = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    isPointerDown.current = true;
    setIsPaused(true); 
    startX.current = e.clientX;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isPointerDown.current || startX.current === null) return;
    isPointerDown.current = false;
    setIsPaused(false); 
    const endX = e.clientX;
    const diff = startX.current - endX;
    startX.current = null;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextReview();
      else prevReview();
    }
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
  };

  const onPointerCancel = (e: React.PointerEvent) => {
    isPointerDown.current = false;
    setIsPaused(false); 
    startX.current = null;
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
  };

  return (
    <section id="reviews" className="relative py-20 md:py-32 bg-gradient-to-b from-background to-secondary/20" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isRevealed ? 'animate-fade-in' : 'opacity-0'}`}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from our delighted customers
          </p>
        </div>

        <div
          className="relative w-full"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onPointerLeave={onPointerCancel}
        >
          <div className="overflow-x-hidden overflow-y-visible cursor-grab active:cursor-grabbing touch-pan-y">
            <div
              className="flex transition-transform duration-700 ease-in-out gap-0 md:gap-6"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              }}
            >
              {allReviews.map((review, index) => (
                <div
                  key={index}
                  className="flex-shrink-0"
                  style={{ width: `${100 / itemsPerPage}%` }}
                >
                  <div className="md:px-3 h-full">
                    <ReviewCard {...review} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {allReviews.length > itemsPerPage && (
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

        {/* Review Submission Form */}
        <div className="mt-16 animate-fade-in">
          <ReviewSubmission />
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
