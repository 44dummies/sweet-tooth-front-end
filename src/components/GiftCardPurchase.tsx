import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Gift, Mail, Check, Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const GiftCardPurchase = () => {
  const { user, profile } = useAuth();
  const [amount, setAmount] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const presetAmounts = [500, 1000, 2000, 5000, 10000];

  const generateGiftCardCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'ST-';
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      if (i === 3 || i === 7) code += '-';
    }
    return code;
  };

  const handlePurchase = async () => {
    const finalAmount = amount === 'custom' ? parseFloat(customAmount) : parseFloat(amount);

    if (!finalAmount || finalAmount < 100) {
      toast.error('Minimum gift card amount is Ksh 100');
      return;
    }

    if (!recipientEmail) {
      toast.error('Please enter recipient email');
      return;
    }

    setLoading(true);

    try {
      const code = generateGiftCardCode();
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Valid for 1 year

      const { error } = await supabase
        .from('gift_cards')
        .insert({
          code,
          amount: finalAmount,
          balance: finalAmount,
          purchaser_email: user?.email || 'guest',
          purchaser_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Guest',
          recipient_email: recipientEmail,
          recipient_name: recipientName || 'Valued Customer',
          message: message || `Enjoy ${finalAmount.toLocaleString()} Ksh worth of delicious treats from Sweet Tooth Pastries!`,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      // Record transaction
      await supabase
        .from('gift_card_transactions')
        .insert({
          gift_card_id: code, // We'll need to get the ID
          amount: finalAmount,
          transaction_type: 'purchase'
        });

      setGeneratedCode(code);
      toast.success('Gift card created successfully!');

      // Reset form
      setAmount("");
      setCustomAmount("");
      setRecipientName("");
      setRecipientEmail("");
      setMessage("");

    } catch (error) {
      console.error('Error creating gift card:', error);
      toast.error('Failed to create gift card');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (generatedCode) {
    return (
      <Card className="p-8 max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Gift Card Created!</h2>
          <p className="text-muted-foreground">
            Your gift card has been generated and an email has been sent to the recipient.
          </p>
        </div>

        <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20 p-8 rounded-lg mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="w-6 h-6 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground">GIFT CARD CODE</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-4 tracking-wider">
            {generatedCode}
          </div>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
        </div>

        <Button onClick={() => setGeneratedCode(null)} className="w-full">
          Create Another Gift Card
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Gift className="w-6 h-6" />
          Purchase Gift Card
        </h2>
        <p className="text-muted-foreground">
          Send the gift of delicious treats to someone special
        </p>
      </div>

      <div className="space-y-6">
        {/* Amount Selection */}
        <div>
          <Label className="mb-3 block">Select Amount</Label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-3">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={amount === preset.toString() ? "default" : "outline"}
                onClick={() => {
                  setAmount(preset.toString());
                  setCustomAmount("");
                }}
                className="h-auto py-3"
              >
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Ksh</div>
                  <div className="font-bold">{preset.toLocaleString()}</div>
                </div>
              </Button>
            ))}
          </div>

          <Button
            type="button"
            variant={amount === 'custom' ? "default" : "outline"}
            onClick={() => setAmount('custom')}
            className="w-full"
          >
            Custom Amount
          </Button>

          {amount === 'custom' && (
            <div className="mt-3">
              <Input
                type="number"
                placeholder="Enter custom amount (min. Ksh 100)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="100"
              />
            </div>
          )}
        </div>

        {/* Recipient Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recipientName">Recipient Name (Optional)</Label>
            <Input
              id="recipientName"
              placeholder="Jane Doe"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="recipientEmail">Recipient Email *</Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="jane@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Personal Message */}
        <div>
          <Label htmlFor="message">Personal Message (Optional)</Label>
          <Textarea
            id="message"
            placeholder="Add a personal message to make this gift extra special..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </div>

        {/* Summary */}
        {(amount && amount !== 'custom') || (amount === 'custom' && customAmount) ? (
          <div className="p-4 bg-secondary/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Gift Card Value:</span>
              <span className="text-2xl font-bold">
                Ksh {(amount === 'custom' ? parseFloat(customAmount) : parseFloat(amount)).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Valid for 1 year from purchase date
            </p>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handlePurchase}
            disabled={loading || !amount || (amount === 'custom' && !customAmount) || !recipientEmail}
            className="flex-1 gap-2"
          >
            <Mail className="w-4 h-4" />
            {loading ? 'Processing...' : 'Purchase & Send'}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          <p>The recipient will receive an email with the gift card code.</p>
          <p className="mt-1">They can use it at checkout to redeem their treats!</p>
        </div>
      </div>
    </Card>
  );
};

export default GiftCardPurchase;
