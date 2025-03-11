
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const payment_id = searchParams.get("payment_id");

    const updatePaymentStatus = async () => {
      if (payment_id) {
        try {
          const { error } = await supabase
            .from('stripe_payments')
            .update({ status: 'completed' })
            .eq('id', payment_id);

          if (error) {
            console.error('Error updating payment status:', error);
            toast.error("Failed to confirm payment status");
          }
        } catch (error) {
          console.error('Error:', error);
          toast.error("Failed to confirm payment status");
        }
      }
    };

    updatePaymentStatus();
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for your donation. Your support makes a real difference.
          </p>
          <Button asChild>
            <a href="/">Return Home</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
