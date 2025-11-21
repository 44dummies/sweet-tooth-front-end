import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PreOrderForm = () => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    cakeType: "",
    phone: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSending, setIsSending] = useState<"idle" | "sending" | "sent">("idle");

  const cakeTypes = ["Muffins", "Loafs", "Fruit Cakes", "Birthday Cakes"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setIsSending("sending");

    const newErrors: Record<string, boolean> = {};
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.cakeType) newErrors.cakeType = true;
    if (!formData.phone.trim()) newErrors.phone = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      setIsSending("idle");
      return;
    }

    const message = `Hello Sweet Tooth Bakery! I'd like to place an order:\n\nName: ${formData.name}\nCake Type: ${formData.cakeType}\nPhone: ${formData.phone}\nNotes: ${formData.notes || "None"}`;
    const whatsappUrl = `https://wa.me/254795436192?text=${encodeURIComponent(
      message
    )}`;

    setTimeout(() => {
      window.open(whatsappUrl, "_blank");

      toast({
        title: "Redirecting to WhatsApp",
        description: "Complete your order via WhatsApp",
      });

      setIsSending("sent");

      setTimeout(() => {
        setIsSending("idle");
      }, 1500);
    }, 1200);

    setFormData({ name: "", cakeType: "", phone: "", notes: "" });
    setErrors({});
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  return (
    <section id="order" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Pre-Order Now
            </h2>
            <p className="text-xl text-muted-foreground">
              Fill in your details and we'll contact you to confirm your order
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-card p-8 md:p-10 rounded-3xl shadow-luxury border-2 border-border animate-scale-in"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Your Name <span className="text-primary">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`rounded-xl border-2 transition-all focus:border-primary ${
                  errors.name ? "border-destructive" : ""
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Cake Type <span className="text-primary">*</span>
              </label>
              <Select
                value={formData.cakeType}
                onValueChange={(value) => handleChange("cakeType", value)}
              >
                <SelectTrigger
                  className={`rounded-xl border-2 transition-all ${
                    errors.cakeType ? "border-destructive" : ""
                  }`}
                >
                  <SelectValue placeholder="Select a cake type" />
                </SelectTrigger>
                <SelectContent>
                  {cakeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Phone Number <span className="text-primary">*</span>
              </label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={`rounded-xl border-2 transition-all focus:border-primary ${
                  errors.phone ? "border-destructive" : ""
                }`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Special Requests (Optional)
              </label>
              <Textarea
                placeholder="Any special requests or dietary requirements?"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="rounded-xl border-2 transition-all focus:border-primary min-h-[120px]"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSending === "sending"}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6 text-lg font-semibold shadow-lg hover:shadow-luxury transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {isSending === "sending" && (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
              )}

              {isSending === "idle" && "ORDER NOW"}
              {isSending === "sending" && "Sending..."}
              {isSending === "sent" && "Sent ✓"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default PreOrderForm;
