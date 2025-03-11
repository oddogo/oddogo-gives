import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HandHeart, Coins, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentFormProps {
  recipientId: string;
  recipientName: string;
}

const PRESET_AMOUNTS = [5, 10, 20, 50, 100];

export const PaymentForm = ({ recipientId, recipientName }: PaymentFormProps) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const handlePresetClick = (value: number) => {
    setSelectedPreset(value);
    setAmount(value.toString());
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('Starting payment process...', { amount, recipientId });

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      setLoading(false);
      return;
    }

    try {
      console.log('Invoking create-payment function...');
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          amount: parseFloat(amount) * 100, // Convert to cents
          recipientId 
        }
      });

      console.log('Payment function response:', { data, error });

      if (error) {
        console.error('Payment error:', error);
        toast.error("Failed to process payment. Please try again.");
        throw error;
      }

      if (data?.url) {
        console.log('Redirecting to payment URL:', data.url);
        window.location.href = data.url;
      } else {
        toast.error("Invalid response from payment service");
        console.error('No URL in response:', data);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader className="text-center space-y-3">
        <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
          <HandHeart className="w-6 h-6" />
          Support {recipientName}
        </CardTitle>
        <CardDescription className="text-base">
          Your donation helps make a real difference in supporting important causes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {PRESET_AMOUNTS.map((preset) => (
            <Button
              key={preset}
              variant={selectedPreset === preset ? "default" : "outline"}
              className="relative group transition-all duration-300"
              onClick={() => handlePresetClick(preset)}
            >
              <Coins className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
              £{preset}
            </Button>
          ))}
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="font-medium">
              Custom Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">£</span>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setSelectedPreset(null);
                }}
                className="pl-7"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full group" 
            disabled={loading}
          >
            <Trophy className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
            {loading ? "Processing..." : "Make Donation"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Secure payment powered by Stripe
        </div>
      </CardContent>
    </Card>
  );
};
