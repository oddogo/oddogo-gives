import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const campaignId = searchParams.get("campaign_id");
  const recipientId = searchParams.get("recipient_id");
  
  const [paymentStatus, setPaymentStatus] = useState<"loading" | "completed" | "processing" | "failed">("loading");
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null);
  const [pollingCount, setPollingCount] = useState(0);

  useEffect(() => {
    if (!paymentId) return;
    
    const checkPaymentStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("stripe_payments")
          .select("*")
          .eq("id", paymentId)
          .single();

        if (error) {
          console.error("Error fetching payment status:", error);
          if (pollingCount > 20) { // Stop after ~40 seconds
            setPaymentStatus("failed");
          }
          return;
        }

        setPaymentDetails(data);
        
        if (data.status === "completed") {
          setPaymentStatus("completed");
        } else if (data.status === "failed") {
          setPaymentStatus("failed");
        } else {
          // Still processing, keep polling
          setPaymentStatus("processing");
          
          if (pollingCount < 60) { // Cap polling at ~2 minutes total
            setPollingCount(prev => prev + 1);
          } else {
            // After too many attempts, assume something went wrong
            setPaymentStatus("failed");
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        if (pollingCount > 20) {
          setPaymentStatus("failed");
        }
      }
    };

    checkPaymentStatus();
    
    // Poll every 2 seconds if payment is still processing
    const intervalId = setInterval(() => {
      if (paymentStatus !== "completed" && paymentStatus !== "failed") {
        checkPaymentStatus();
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [paymentId, paymentStatus, pollingCount]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          {paymentStatus === "loading" || paymentStatus === "processing" ? (
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
          ) : paymentStatus === "completed" ? (
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="64" 
                height="64" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-yellow-500"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          )}
          
          <CardTitle className="text-2xl font-bold">
            {paymentStatus === "loading" ? "Processing Your Donation..." :
             paymentStatus === "processing" ? "Processing Your Donation..." :
             paymentStatus === "completed" ? "Thank You For Your Donation!" :
             "Payment Processing"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="space-y-4">
            {paymentStatus === "loading" || paymentStatus === "processing" ? (
              <p className="text-center text-gray-600">
                Please wait while we process your donation. This might take a few moments...
              </p>
            ) : paymentStatus === "completed" ? (
              <div className="space-y-2">
                <p className="text-center text-gray-600">
                  Your donation was successful! Thank you for your generosity and support.
                </p>
                {paymentDetails && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-semibold">${paymentDetails.amount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-600">
                We're still waiting to confirm your payment. You'll receive an email confirmation when completed.
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center space-x-4 pt-2">
          {paymentStatus === "completed" && campaignId && (
            <Button asChild>
              <Link to={`/campaigns/${paymentDetails?.campaign_slug || campaignId}`}>
                View Campaign
              </Link>
            </Button>
          )}
          
          {paymentStatus === "completed" && recipientId && (
            <Button asChild>
              <Link to={`/profile/${recipientId}`}>
                View Profile
              </Link>
            </Button>
          )}
          
          <Button asChild variant={paymentStatus === "completed" ? "outline" : "default"}>
            <Link to="/">
              Return Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
