
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const paymentId = searchParams.get("payment_id");
  const [recipientId, setRecipientId] = useState<string | null>(searchParams.get("recipient_id"));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const processPayment = async () => {
      if (!paymentId) {
        setError("No payment ID was provided");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Processing payment success for payment ID:", paymentId);
        setIsLoading(true);
        
        // Fetch the payment details
        const { data: paymentData, error: paymentError } = await supabase
          .from('stripe_payments')
          .select('*')
          .eq('id', paymentId)
          .single();
          
        if (paymentError) {
          console.error("Error fetching payment details:", paymentError);
          setError(`Could not find payment details: ${paymentError.message}`);
          setIsLoading(false);
          return;
        }
        
        console.log("Payment details fetched:", paymentData);
        setPaymentDetails(paymentData);
        
        if (!recipientId && paymentData?.user_id) {
          console.log("Setting recipient ID from payment user_id:", paymentData.user_id);
          setRecipientId(paymentData.user_id);
        }
        
        // Check if this payment is associated with a campaign
        // Use optional chaining to safely access campaign_id which might not exist in the type
        const campaignId = (paymentData as any)?.campaign_id;
        if (campaignId) {
          console.log("Payment associated with campaign:", campaignId);
          
          // Ensure payment is linked to campaign if not already
          const { data: campaignPayment, error: campaignCheckError } = await supabase
            .from('campaign_payments')
            .select('id')
            .eq('payment_id', paymentId)
            .maybeSingle();
            
          if (campaignCheckError) {
            console.error("Error checking campaign payment link:", campaignCheckError);
          } else if (!campaignPayment) {
            console.log("Linking payment to campaign:", campaignId);
            
            const { error: linkError } = await supabase
              .from('campaign_payments')
              .insert({
                campaign_id: campaignId,
                payment_id: paymentId
              });
              
            if (linkError) {
              console.error("Error linking payment to campaign:", linkError);
            } else {
              console.log("Payment successfully linked to campaign");
              toast.success("Your donation has been linked to the campaign!");
            }
          } else {
            console.log("Payment already linked to campaign");
          }
        }
        
        toast.success("Payment processed successfully!");
      } catch (error) {
        console.error("Error processing payment success:", error);
        setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    processPayment();
  }, [paymentId, recipientId]);

  const handleReturnClick = () => {
    // Use optional chaining and type assertion to safely access campaign_id property
    if (recipientId) {
      navigate(`/profile/${recipientId}`);
    } else if ((paymentDetails as any)?.campaign_id) {
      navigate(`/campaign/${(paymentDetails as any).campaign_id}`);
    } else {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">
              Processing Payment...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
            <p className="text-gray-600">
              Please wait while we confirm your payment details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-700">
              Payment Verification Issue
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <p className="text-gray-600">
              Your payment may have been processed, but we encountered an issue verifying the details.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Thank you for your donation of 
            {paymentDetails && (
              <span className="font-semibold">
                {" "}£{(paymentDetails.amount / 100).toFixed(2)}
              </span>
            )}.
            Your payment has been processed successfully.
          </p>
          <Button onClick={handleReturnClick}>
            Return to {recipientId ? "Profile" : "Home"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
