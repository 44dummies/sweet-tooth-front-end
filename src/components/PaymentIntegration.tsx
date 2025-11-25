import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { CreditCard } from "lucide-react";

type PaymentMethod = 'BANK_TRANSFER' | 'CASH';

interface PaymentIntegrationProps {
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentIntegration = ({ orderId, amount, onSuccess, onCancel }: PaymentIntegrationProps) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setProcessing(true);

      await supabase.from('payments').insert([{
        order_id: orderId,
        payment_method: selectedMethod,
        amount: amount,
        status: 'PENDING',
      }]);

      toast.success(`${selectedMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Cash on Delivery'} payment recorded. We'll contact you with details.`);
      onSuccess();
    } catch (error) {
      toast.error('Failed to record payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Complete Payment</h3>
        <p className="text-3xl font-bold text-primary">Ksh {amount.toLocaleString()}</p>
      </div>

      {}
      <div className="space-y-3">
        <button
          onClick={() => setSelectedMethod('BANK_TRANSFER')}
          className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
            selectedMethod === 'BANK_TRANSFER'
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <CreditCard className="w-6 h-6" />
          <div className="text-left flex-1">
            <div className="font-semibold">Bank Transfer</div>
            <div className="text-sm text-muted-foreground">Direct bank payment</div>
          </div>
        </button>

        <button
          onClick={() => setSelectedMethod('CASH')}
          className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
            selectedMethod === 'CASH'
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="w-6 h-6 flex items-center justify-center text-2xl">💵</div>
          <div className="text-left flex-1">
            <div className="font-semibold">Cash on Delivery</div>
            <div className="text-sm text-muted-foreground">Pay when you receive</div>
          </div>
        </button>
      </div>

      {}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePayment}
          className="flex-1"
          disabled={processing}
        >
          {processing ? 'Processing...' : 'Confirm Payment'}
        </Button>
      </div>

      {}
      {selectedMethod === 'BANK_TRANSFER' && (
        <div className="bg-secondary/20 p-4 rounded-lg text-sm">
          <p className="font-semibold mb-2">Bank Details:</p>
          <p>Bank: Equity Bank</p>
          <p>Account: 1234567890</p>
          <p>Account Name: Sweet Tooth Bakery</p>
          <p className="text-xs text-muted-foreground mt-2">
            Send payment confirmation via WhatsApp
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentIntegration;
