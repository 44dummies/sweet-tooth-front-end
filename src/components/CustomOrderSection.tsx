import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Cake, Calendar, Users, MessageSquare, Phone, Mail, User, Sparkles } from "lucide-react";

const CustomOrderSection = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    cakeType: "",
    servings: "",
    flavor: "",
    deliveryDate: "",
    budget: "",
    specialRequests: "",
  });

  // Auto-fill cake type if passed from navigation
  useEffect(() => {
    if (location.state?.cakeType) {
      setFormData(prev => ({ ...prev, cakeType: location.state.cakeType }));
      toast.success(`${location.state.cakeType} selected!`);
    }
  }, [location.state]);

  const [loading, setLoading] = useState(false);

  const cakeTypes = [
    "Birthday Cake",
    "Wedding Cake",
    "Anniversary Cake",
    "Baby Shower Cake",
    "Corporate Event Cake",
    "Cupcakes Tower",
    "Custom Design",
  ];

  const flavors = [
    "Vanilla",
    "Chocolate",
    "Red Velvet",
    "Lemon",
    "Strawberry",
    "Carrot",
    "Marble",
    "Custom Flavor",
  ];

  const servingOptions = [
    "10-15 people",
    "20-30 people",
    "40-50 people",
    "60-80 people",
    "100+ people",
  ];

  const budgetRanges = [
    "Under Ksh 3,000",
    "Ksh 3,000 - 5,000",
    "Ksh 5,000 - 10,000",
    "Ksh 10,000 - 20,000",
    "Above Ksh 20,000",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.cakeType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('custom_orders').insert([{
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email || null,
        order_details: `Cake Type: ${formData.cakeType}\nServings: ${formData.servings}\nFlavor: ${formData.flavor}\nDelivery Date: ${formData.deliveryDate}\nBudget: ${formData.budget}\n\nSpecial Requests:\n${formData.specialRequests}`,
        status: 'PENDING',
      }]);

      if (error) throw error;

      const message = `🎂 *Custom Cake Order Request*\n\n👤 Name: ${formData.name}\n📞 Phone: ${formData.phone}\n📧 Email: ${formData.email || 'Not provided'}\n\n🎨 Cake Type: ${formData.cakeType}\n👥 Servings: ${formData.servings}\n🍰 Flavor: ${formData.flavor}\n📅 Delivery: ${formData.deliveryDate}\n💰 Budget: ${formData.budget}\n\n✨ Special Requests:\n${formData.specialRequests || 'None'}`;
      
      const whatsappUrl = `https://wa.me/254795436192?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");

      toast.success("Order request sent! We'll contact you soon.");
      
      setFormData({
        name: "",
        phone: "",
        email: "",
        cakeType: "",
        servings: "",
        flavor: "",
        deliveryDate: "",
        budget: "",
        specialRequests: "",
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error("Failed to submit order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="custom-order" className="py-8 md:py-24 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Custom Creations</span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
            Design Your Dream Cake
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Make your celebration extra special with a custom cake designed just for you. 
            Tell us your vision and we'll bring it to life!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-2 shadow-2xl">
            <CardContent className="p-4 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Your Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+254712345678"
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email (Optional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Cake Details */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Cake className="w-5 h-5 text-primary" />
                    Cake Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Cake Type <span className="text-destructive">*</span>
                      </Label>
                      <Select value={formData.cakeType} onValueChange={(value) => setFormData({ ...formData, cakeType: value })}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select cake type" />
                        </SelectTrigger>
                        <SelectContent>
                          {cakeTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Number of Servings
                      </Label>
                      <Select value={formData.servings} onValueChange={(value) => setFormData({ ...formData, servings: value })}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select servings" />
                        </SelectTrigger>
                        <SelectContent>
                          {servingOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Cake Flavor</Label>
                      <Select value={formData.flavor} onValueChange={(value) => setFormData({ ...formData, flavor: value })}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select flavor" />
                        </SelectTrigger>
                        <SelectContent>
                          {flavors.map((flavor) => (
                            <SelectItem key={flavor} value={flavor}>{flavor}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryDate" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Preferred Delivery Date
                      </Label>
                      <Input
                        id="deliveryDate"
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Budget Range</Label>
                      <Select value={formData.budget} onValueChange={(value) => setFormData({ ...formData, budget: value })}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select your budget" />
                        </SelectTrigger>
                        <SelectContent>
                          {budgetRanges.map((range) => (
                            <SelectItem key={range} value={range}>{range}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="specialRequests" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Special Requests & Design Ideas
                  </Label>
                  <Textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    placeholder="Describe your vision: colors, themes, decorations, dietary restrictions, etc."
                    className="min-h-32 resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Be as detailed as possible to help us create your perfect cake!
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-lg rounded-full hover:scale-105 active:scale-95 transition-transform duration-300 shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Submit Custom Order Request
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  We'll review your request and contact you within 24 hours via WhatsApp to discuss details and pricing.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CustomOrderSection;
