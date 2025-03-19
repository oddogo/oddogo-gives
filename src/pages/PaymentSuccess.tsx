
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const paymentId = searchParams.get("payment_id");
  const [recipientId, setRecipientId] = useState<string | null>(searchParams.get("recipient_id"));

  useEffect(() => {
    // If we have a payment_id but not a recipient_id, try to fetch it from the payment
    if (paymentId && !recipientId) {
      const fetchPaymentDetails = async () => {
        try {
          const { data, error } = await supabase
            .from('stripe_payments')
            .select('metadata')
            .eq('id', paymentId)
            .single();
            
          if (data?.metadata?.recipient_id) {
            setRecipientId(data.metadata.recipient_id);
          }
        } catch (error) {
          console.error("Error fetching payment details:", error);
        }
      };
      
      fetchPaymentDetails();
    }
  }, [paymentId, recipientId]);

  const handleReturnClick = () => {
    if (recipientId) {
      navigate(`/profile/${recipientId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            Payment Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for your donation. Your payment has been processed successfully.
          </p>
          <Button onClick={handleReturnClick}>
            Return to Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
