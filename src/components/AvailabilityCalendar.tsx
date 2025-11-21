import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface AvailabilityDate {
  date: Date;
  total_capacity: number;
  booked_slots: number;
  is_available: boolean;
  notes?: string;
}

const AvailabilityCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availability, setAvailability] = useState<Map<string, AvailabilityDate>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailability();

    const channel = supabase
      .channel('availability-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'availability_calendar'
        },
        () => {
          fetchAvailability();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAvailability = async () => {
    try {
      const today = new Date();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

      const { data, error } = await supabase
        .from('availability_calendar')
        .select('*')
        .gte('date', today.toISOString().split('T')[0])
        .lte('date', threeMonthsLater.toISOString().split('T')[0]);

      if (error) throw error;

      const availabilityMap = new Map<string, AvailabilityDate>();
      (data || []).forEach((item: any) => {
        availabilityMap.set(item.date, {
          date: new Date(item.date),
          total_capacity: item.total_capacity,
          booked_slots: item.booked_slots,
          is_available: item.is_available,
          notes: item.notes
        });
      });

      setAvailability(availabilityMap);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const getDateStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dateInfo = availability.get(dateStr);

    if (!dateInfo) {
      // No data means available (default capacity)
      return { status: 'available', slotsLeft: 10, color: 'text-green-600' };
    }

    const slotsLeft = dateInfo.total_capacity - dateInfo.booked_slots;
    
    if (slotsLeft === 0) {
      return { status: 'fully-booked', slotsLeft: 0, color: 'text-red-600' };
    } else if (slotsLeft <= 3) {
      return { status: 'limited', slotsLeft, color: 'text-orange-600' };
    }
    
    return { status: 'available', slotsLeft, color: 'text-green-600' };
  };

  const selectedDateInfo = selectedDate ? getDateStatus(selectedDate) : null;

  const modifiers = {
    fullyBooked: (date: Date) => {
      const status = getDateStatus(date);
      return status.status === 'fully-booked';
    },
    limited: (date: Date) => {
      const status = getDateStatus(date);
      return status.status === 'limited';
    },
    available: (date: Date) => {
      const status = getDateStatus(date);
      return status.status === 'available';
    }
  };

  const modifiersClassNames = {
    fullyBooked: 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300 line-through',
    limited: 'bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-300',
    available: 'bg-green-50 dark:bg-green-900/20'
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="p-4 md:p-6 transition-all duration-300 hover:shadow-lg">
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 md:w-6 md:h-6" />
            Order Availability Calendar
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Check available dates for custom orders. Book early to secure your preferred date!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              className="rounded-md border w-full"
            />
          </div>

          {/* Date Info */}
          <div className="space-y-4">
            <div className="p-4 bg-secondary/20 rounded-lg">
              <h3 className="font-semibold mb-3">Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Available - 4+ slots left</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Limited - 1-3 slots left</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Fully Booked</span>
                </div>
              </div>
            </div>

            {selectedDate && selectedDateInfo && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge 
                      variant={
                        selectedDateInfo.status === 'fully-booked' ? 'destructive' :
                        selectedDateInfo.status === 'limited' ? 'default' : 
                        'outline'
                      }
                      className={selectedDateInfo.color}
                    >
                      {selectedDateInfo.status === 'fully-booked' ? 'Fully Booked' :
                       selectedDateInfo.status === 'limited' ? 'Limited Availability' :
                       'Available'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Slots Remaining:</span>
                    <span className={`font-bold ${selectedDateInfo.color}`}>
                      {selectedDateInfo.slotsLeft}
                    </span>
                  </div>

                  {selectedDateInfo.status === 'fully-booked' ? (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-3">
                      This date is fully booked. Please select another date.
                    </p>
                  ) : selectedDateInfo.status === 'limited' ? (
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-3">
                      Only {selectedDateInfo.slotsLeft} slot{selectedDateInfo.slotsLeft !== 1 ? 's' : ''} left! Book now to secure your date.
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-3">
                      Great choice! This date has plenty of availability.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Note:</strong> We recommend ordering at least 3-5 days in advance for custom cakes.
                For large events, please book 1-2 weeks ahead.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AvailabilityCalendar;
