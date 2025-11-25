import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type Props = {
  open: boolean;
  onClose: () => void;
};

const CustomOrderModal = ({ open, onClose }: Props) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const order = {
      id: Date.now(),
      name,
      phone,
      email,
      details,
      createdAt: new Date().toISOString(),
    };

    try {
      try {
        await supabase.from('custom_orders').insert([{
          customer_name: name,
          customer_phone: phone,
          customer_email: email || null,
          order_details: details,
          status: 'PENDING',
        }]);
      } catch (supabaseErr) {
        console.warn('Supabase save failed, using localStorage:', supabaseErr);
      }

      const existing = JSON.parse(localStorage.getItem("sweet_tooth_custom_orders") || "[]");
      existing.push(order);
      localStorage.setItem("sweet_tooth_custom_orders", JSON.stringify(existing));
      toast({ title: "Custom order saved", description: "We'll contact you soon to confirm details." });
      setName("");
      setPhone("");
      setEmail("");
      setDetails("");
      onClose();
    } catch (err) {
      toast({ title: "Error", description: "Could not save your custom order." });
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Custom Order</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input id="custom-name" name="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" className="w-full p-3 rounded-md border" autoComplete="name" />
          <input id="custom-phone" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Phone (WhatsApp)" className="w-full p-3 rounded-md border" autoComplete="tel" />
          <input id="custom-email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="w-full p-3 rounded-md border" autoComplete="email" />
          <textarea id="custom-details" name="details" value={details} onChange={(e) => setDetails(e.target.value)} required placeholder="Describe your custom preferences (flavour, size, decorations)" className="w-full p-3 rounded-md border h-28" autoComplete="off" />
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-primary">Send</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomOrderModal;
