import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Gift, Search, CheckCircle2, XCircle } from "lucide-react";

const GiftCardBalance = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cardInfo, setCardInfo] = useState<any>(null);

  const checkBalance = async () => {
    if (!code.trim()) {
      toast.error('Please enter a gift card code');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .single();

      if (error || !data) {
        toast.error('Invalid gift card code');
        setCardInfo(null);
        return;
      }

      setCardInfo(data);
      
    } catch (error) {
      console.error('Error checking balance:', error);
      toast.error('Failed to check balance');
      setCardInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkBalance();
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Gift className="w-6 h-6" />
          Check Gift Card Balance
        </h2>
        <p className="text-muted-foreground text-sm">
          Enter your gift card code to check the remaining balance
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="giftCardCode">Gift Card Code</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="giftCardCode"
              placeholder="ST-XXXX-XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="font-mono"
            />
            <Button onClick={checkBalance} disabled={loading || !code.trim()}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {cardInfo && (
          <div className="mt-6 space-y-4">
            {cardInfo.status === 'active' && cardInfo.balance > 0 ? (
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                      Active Gift Card
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      This gift card is ready to use!
                    </p>
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-black/20 p-4 rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Balance:</span>
                    <span className="text-2xl font-bold text-green-600">
                      Ksh {cardInfo.balance.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Original Amount:</span>
                    <span className="font-medium">
                      Ksh {cardInfo.amount.toLocaleString()}
                    </span>
                  </div>

                  {cardInfo.recipient_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Recipient:</span>
                      <span className="font-medium">
                        {cardInfo.recipient_name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Expires:</span>
                    <span className="font-medium">
                      {new Date(cardInfo.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {cardInfo.message && (
                  <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-md">
                    <p className="text-sm italic text-muted-foreground">
                      "{cardInfo.message}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                      {cardInfo.status === 'used' ? 'Fully Redeemed' : 
                       cardInfo.status === 'expired' ? 'Expired' : 
                       'Inactive'}
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {cardInfo.status === 'used' ? 'This gift card has been fully used.' :
                       cardInfo.status === 'expired' ? 'This gift card has expired.' :
                       'This gift card is no longer active.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                setCardInfo(null);
                setCode("");
              }}
              variant="outline"
              className="w-full"
            >
              Check Another Card
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-6">
          <p className="mb-1">• Gift cards are valid for 1 year from purchase date</p>
          <p className="mb-1">• Use your gift card code at checkout</p>
          <p>• Contact us if you have any questions about your gift card</p>
        </div>
      </div>
    </Card>
  );
};

export default GiftCardBalance;
