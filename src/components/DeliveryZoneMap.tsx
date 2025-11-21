import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { MapPin, Clock, DollarSign, Search, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface DeliveryZone {
  id: string;
  zone_name: string;
  areas: string[];
  delivery_fee: number;
  estimated_time_min: number;
  estimated_time_max: number;
  is_active: boolean;
}

const DeliveryZoneMap = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [matchedZone, setMatchedZone] = useState<DeliveryZone | null>(null);

  useEffect(() => {
    fetchDeliveryZones();
  }, []);

  const fetchDeliveryZones = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('is_active', true)
        .order('delivery_fee', { ascending: true });

      if (error) throw error;

      setZones(data || []);
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
      toast.error('Failed to load delivery zones');
    } finally {
      setLoading(false);
    }
  };

  const searchArea = () => {
    if (!searchTerm.trim()) {
      setMatchedZone(null);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const found = zones.find(zone => 
      zone.areas.some(area => area.toLowerCase().includes(term)) ||
      zone.zone_name.toLowerCase().includes(term)
    );

    if (found) {
      setMatchedZone(found);
      toast.success(`Found in ${found.zone_name}`);
    } else {
      setMatchedZone(null);
      toast.error('Area not found in our delivery zones');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchArea();
    }
  };

  const getZoneColor = (fee: number) => {
    if (fee === 0) return 'bg-green-100 dark:bg-green-950/30 border-green-300 dark:border-green-700';
    if (fee <= 200) return 'bg-blue-100 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700';
    if (fee <= 400) return 'bg-yellow-100 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-700';
    return 'bg-orange-100 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700';
  };

  const getZoneBadgeColor = (fee: number) => {
    if (fee === 0) return 'bg-green-600 text-white';
    if (fee <= 200) return 'bg-blue-600 text-white';
    if (fee <= 400) return 'bg-yellow-600 text-white';
    return 'bg-orange-600 text-white';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6 transition-all duration-300 hover:shadow-lg">
        <div className="mb-4 md:mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 md:w-7 md:h-7" />
            Delivery Zones
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Check if we deliver to your area and view delivery fees
          </p>
        </div>

        <div className="mb-8">
          <div className="flex gap-2">
            <Input
              placeholder="Enter your area (e.g., Westlands, Karen, Kilimani...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={searchArea} disabled={!searchTerm.trim()}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {matchedZone && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-700 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Great news! We deliver to your area 🎉
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{matchedZone.zone_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>
                        Delivery Fee: <strong>
                          {matchedZone.delivery_fee === 0 
                            ? 'FREE' 
                            : `Ksh ${matchedZone.delivery_fee}`}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span>
                        Estimated Time: <strong>
                          {matchedZone.estimated_time_min}-{matchedZone.estimated_time_max} minutes
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
        {loading ? (
          <Card className="p-4 md:p-6 animate-pulse col-span-1 md:col-span-2">
            <div className="bg-muted h-6 rounded mb-4" />
            <div className="bg-muted h-4 rounded w-2/3" />
          </Card>
        ) : zones.length === 0 ? (
          <Card className="p-6 md:p-8 text-center col-span-1 md:col-span-2">
            <XCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No delivery zones available</p>
          </Card>
        ) : (
          zones.map((zone) => (
            <Card 
              key={zone.id} 
              className={`p-4 md:p-6 border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                matchedZone?.id === zone.id 
                  ? 'ring-2 ring-green-500 scale-105' 
                  : ''
              } ${getZoneColor(zone.delivery_fee)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <h3 className="text-xl font-semibold">{zone.zone_name}</h3>
                </div>
                <Badge className={getZoneBadgeColor(zone.delivery_fee)}>
                  {zone.delivery_fee === 0 ? 'FREE' : `Ksh ${zone.delivery_fee}`}
                </Badge>
              </div>

              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {zone.estimated_time_min}-{zone.estimated_time_max} min delivery
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium mb-2">Areas covered:</p>
                <div className="flex flex-wrap gap-2">
                  {zone.areas.map((area, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary"
                      className={
                        searchTerm.trim() && 
                        area.toLowerCase().includes(searchTerm.toLowerCase().trim())
                          ? 'bg-green-200 dark:bg-green-800 border-green-400'
                          : ''
                      }
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Delivery Information
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Delivery times are estimates and may vary based on traffic and weather</p>
          <p>• Free delivery available in select zones</p>
          <p>• Same-day delivery available for orders placed before 2 PM</p>
          <p>• We deliver Monday to Saturday, 9 AM - 8 PM</p>
          <p>• Minimum order value may apply for certain zones</p>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium mb-2">Don't see your area?</p>
          <p className="text-sm text-muted-foreground mb-3">
            We're constantly expanding! Contact us to check if we can deliver to you.
          </p>
          <Button variant="outline" size="sm">
            Contact Us
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Delivery Fee Guide</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-green-100 dark:bg-green-950/30 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">FREE</div>
            <div className="text-xs text-muted-foreground">Central zones</div>
          </div>
          <div className="p-4 bg-blue-100 dark:bg-blue-950/30 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">≤200</div>
            <div className="text-xs text-muted-foreground">Near zones</div>
          </div>
          <div className="p-4 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">≤400</div>
            <div className="text-xs text-muted-foreground">Extended zones</div>
          </div>
          <div className="p-4 bg-orange-100 dark:bg-orange-950/30 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">&gt;400</div>
            <div className="text-xs text-muted-foreground">Far zones</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DeliveryZoneMap;
