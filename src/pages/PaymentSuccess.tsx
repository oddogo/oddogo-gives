
import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, AlertCircle, Home, User } from "lucide-react";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get("payment_id");
  const campaignId = searchParams.get("campaign_id");
  const recipientId = searchParams.get("recipient_id");
  
  const [paymentStatus, setPaymentStatus] = useState<"loading" | "completed" | "processing" | "failed">("loading");
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      console.error("No payment ID found in URL");
      setErrorMessage("No payment ID was found in the URL. Please contact support if this issue persists.");
      setPaymentStatus("failed");
      toast.error("Payment verification failed: Missing payment ID");
      return;
    }
    
    console.log(`Checking payment status for ID: ${paymentId}`);
    
    const checkPaymentStatus = async () => {
      try {
        // Use maybeSingle() instead of single() to handle the case where the record isn't found
        const { data, error } = await supabase
          .from("stripe_payments")
          .select("*")
          .eq("id", paymentId)
          .maybeSingle();

        // Log the response for debugging
        console.log("Payment query response:", { data, error });

        if (error) {
          console.error("Error fetching payment status:", error);
          if (pollingCount > 10) { // Stop after ~20 seconds
            setErrorMessage(`Unable to verify payment status: ${error.message}`);
            setPaymentStatus("failed");
            toast.error("Payment verification failed. Please contact support.");
          }
          return;
        }

        // Handle the case where no payment was found
        if (!data) {
          console.log(`No payment found with ID: ${paymentId}, attempt: ${pollingCount + 1}`);
          if (pollingCount < 15) { // Continue polling for ~30 seconds
            setPollingCount(prev => prev + 1);
          } else {
            // After 15 attempts, assume something went wrong
            setPaymentStatus("failed");
            setErrorMessage("Payment not found. It may still be processing. Please check your email for confirmation or contact support.");
            toast.error("Payment verification timed out. Please check your email for confirmation.");
          }
          return;
        }

        console.log("Payment data:", data);
        setPaymentDetails(data);
        
        if (data.status === "completed") {
          setPaymentStatus("completed");
          toast.success("Payment completed successfully!");
          // Clear the interval since we're done
          return true;
        } else if (data.status === "failed") {
          setPaymentStatus("failed");
          setErrorMessage("Payment processing failed. Please try again or contact support.");
          toast.error("Payment failed. Please contact support.");
          // Clear the interval since we're done
          return true;
        } else {
          // Still processing, keep polling
          setPaymentStatus("processing");
          
          if (pollingCount < 30) { // Cap polling at ~1 minute total
            setPollingCount(prev => prev + 1);
          } else {
            // After too many attempts, assume something went wrong with the webhook
            setPaymentStatus("failed");
            setErrorMessage("Payment verification timed out. The payment might still be processing. Please check your email for confirmation or contact support.");
            toast.error("Payment verification timed out. Please check your email for confirmation.");
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error("Error checking payment status:", error);
        if (pollingCount > 10) {
          setPaymentStatus("failed");
          setErrorMessage("An unexpected error occurred while verifying payment. Please contact support.");
          return true;
        }
        return false;
      }
    };

    // Check payment status immediately
    checkPaymentStatus();
    
    // Set up polling at intervals of 2 seconds
    const intervalId = setInterval(async () => {
      if (paymentStatus === "loading" || paymentStatus === "processing") {
        const shouldStopPolling = await checkPaymentStatus();
        if (shouldStopPolling) {
          clearInterval(intervalId);
        }
      } else {
        // If we're already in a terminal state, clear the interval
        clearInterval(intervalId);
      }
    }, 2000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [paymentId, paymentStatus, pollingCount]);

  // Handle returning to donor's profile or home
  const handleReturnToDonor = () => {
    if (recipientId) {
      navigate(`/profile/${recipientId}`);
    } else {
      navigate("/");
    }
  };

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
              <AlertCircle className="h-16 w-16 text-yellow-500" />
            </div>
          )}
          
          <CardTitle className="text-2xl font-bold">
            {paymentStatus === "loading" ? "Processing Your Donation..." :
             paymentStatus === "processing" ? "Processing Your Donation..." :
             paymentStatus === "completed" ? "Thank You For Your Donation!" :
             "Payment Verification Issue"}
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
                      <span className="font-semibold">£{paymentDetails.amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-center text-gray-600">
                  {errorMessage || "We're still waiting to confirm your payment. You'll receive an email confirmation when completed."}
                </p>
                {paymentId && (
                  <p className="text-center text-sm text-gray-500">
                    Payment ID: {paymentId}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center space-x-4 pt-2">
          {paymentStatus === "completed" && campaignId && paymentDetails?.campaign_slug && (
            <Button asChild>
              <Link to={`/campaigns/${paymentDetails.campaign_slug}`}>
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
          
          <Button 
            onClick={handleReturnToDonor} 
            variant={paymentStatus === "completed" ? "outline" : "default"}
          >
            <User className="w-4 h-4 mr-2" />
            {recipientId ? "Return to Profile" : "Return Home"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
