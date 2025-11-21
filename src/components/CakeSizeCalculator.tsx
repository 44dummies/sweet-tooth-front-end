import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Calculator, Users, CakeSlice, Info } from "lucide-react";

interface CakeSize {
  id: string;
  size_name: string;
  serves_min: number;
  serves_max: number;
  diameter_inches: number;
  height_inches: number;
  price_multiplier: number;
  description: string;
}

const CakeSizeCalculator = () => {
  const [guests, setGuests] = useState<number | string>("");
  const [cakeSizes, setCakeSizes] = useState<CakeSize[]>([]);
  const [recommendations, setRecommendations] = useState<CakeSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [basePrice] = useState(2500); // Base price for standard cake

  useEffect(() => {
    fetchCakeSizes();
  }, []);

  const fetchCakeSizes = async () => {
    try {
      const { data, error } = await supabase
        .from('cake_size_guide')
        .select('*')
        .order('serves_min', { ascending: true });

      if (error) throw error;

      setCakeSizes(data || []);
    } catch (error) {
      console.error('Error fetching cake sizes:', error);
      toast.error('Failed to load cake sizes');
    } finally {
      setLoading(false);
    }
  };

  const calculateRecommendations = () => {
    const numGuests = Number(guests);

    if (!numGuests || numGuests < 1) {
      toast.error('Please enter a valid number of guests');
      return;
    }

    if (numGuests > 200) {
      toast.info('For events over 200 guests, please contact us for custom arrangements');
      return;
    }

    // Find sizes that can serve the number of guests
    const suitable = cakeSizes.filter(
      size => numGuests >= size.serves_min && numGuests <= size.serves_max
    );

    // If no exact match, find the next size up
    if (suitable.length === 0) {
      const nextSizeUp = cakeSizes.find(size => size.serves_min > numGuests);
      if (nextSizeUp) {
        setRecommendations([nextSizeUp]);
      } else {
        // Need multiple cakes
        const largestSize = cakeSizes[cakeSizes.length - 1];
        const numCakes = Math.ceil(numGuests / largestSize.serves_max);
        toast.info(`We recommend ${numCakes} ${largestSize.size_name} cakes for your event`);
        setRecommendations([largestSize]);
      }
    } else {
      setRecommendations(suitable);
    }
  };

  const getSizeIcon = (sizeName: string) => {
    const size = sizeName.toLowerCase();
    if (size.includes('small') || size.includes('mini')) return '🧁';
    if (size.includes('medium') || size.includes('standard')) return '🎂';
    if (size.includes('large')) return '🎂';
    if (size.includes('extra')) return '🎂';
    if (size.includes('tier') || size.includes('jumbo')) return '🎂';
    return '🍰';
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <Card className="p-4 md:p-6 transition-all duration-300 hover:shadow-lg">
        <div className="mb-4 md:mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
            <Calculator className="w-5 h-5 md:w-6 md:h-6" />
            Cake Size Calculator
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Find the perfect cake size for your event
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="guestCount" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Number of Guests
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="guestCount"
                type="number"
                min="1"
                placeholder="e.g., 25"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') calculateRecommendations();
                }}
              />
              <Button onClick={calculateRecommendations} disabled={!guests}>
                Calculate
              </Button>
            </div>
          </div>

          {recommendations.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border border-pink-200 dark:border-pink-800 rounded-lg">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CakeSlice className="w-5 h-5" />
                Recommended Sizes for {guests} Guests:
              </h3>
              
              <div className="grid gap-3 md:gap-4 sm:grid-cols-2">
                {recommendations.map((size) => (
                  <Card key={size.id} className="p-3 md:p-4 bg-white/50 dark:bg-black/20 transition-all duration-300 hover:shadow-md hover:scale-105">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getSizeIcon(size.size_name)}</span>
                        <div>
                          <h4 className="font-semibold">{size.size_name}</h4>
                          <Badge variant="secondary" className="mt-1">
                            {size.serves_min}-{size.serves_max} servings
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {size.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Diameter:</span>
                        <span className="font-medium">{size.diameter_inches}"</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Height:</span>
                        <span className="font-medium">{size.height_inches}"</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Est. Price:</span>
                        <span className="font-bold text-lg">
                          Ksh {Math.round(basePrice * size.price_multiplier).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span className="text-blue-900 dark:text-blue-100">
                    Prices are estimates based on standard flavors. Final pricing depends on design, flavors, and decorations.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">All Available Sizes</h3>
        
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading sizes...
          </div>
        ) : cakeSizes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sizes available
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cakeSizes.map((size) => (
              <Card key={size.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl">{getSizeIcon(size.size_name)}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold">{size.size_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {size.serves_min}-{size.serves_max} servings
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  {size.description}
                </p>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span>{size.diameter_inches}" × {size.height_inches}"</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>From:</span>
                    <span>Ksh {Math.round(basePrice * size.price_multiplier).toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm">Serving Size Guide:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Standard serving: 1" × 2" slice (party serving)</li>
            <li>• Generous serving: 1" × 3" slice (wedding/formal)</li>
            <li>• Children's serving: 1" × 1" slice</li>
            <li>• Order 10-15% extra for events to ensure enough cake</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Need Help Choosing?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Not sure which size is right for you? Our team can help! We'll consider:
        </p>
        <ul className="text-sm space-y-2 mb-4">
          <li className="flex items-start gap-2">
            <span className="text-orange-600 dark:text-orange-400">✓</span>
            <span>Your event type and guest demographics</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-600 dark:text-orange-400">✓</span>
            <span>Whether cake is the main dessert or one of many</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-600 dark:text-orange-400">✓</span>
            <span>Time of day and meal schedule</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-600 dark:text-orange-400">✓</span>
            <span>Your budget and design preferences</span>
          </li>
        </ul>
        <Button className="w-full sm:w-auto">
          Contact Us for Consultation
        </Button>
      </Card>
    </div>
  );
};

export default CakeSizeCalculator;
