
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStripeInitialization = () => {
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(true);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      setIsStripeLoading(true);
      setStripeError(null);
      
      try {
        const { data, error } = await supabase.functions.invoke('get-stripe-key', {
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        
        if (error) {
          console.error('Error fetching Stripe key:', error);
          setStripeError('Payment system unavailable. Please try again later.');
          toast.error("Payment system unavailable");
          return;
        }
        
        if (data?.publishableKey) {
          try {
            const stripe = await loadStripe(data.publishableKey);
            setStripePromise(stripe);
          } catch (loadError) {
            console.error("Error loading Stripe:", loadError);
            setStripeError('Unable to initialize payment system');
            toast.error("Payment system initialization failed");
          }
        } else {
          setStripeError('Payment configuration missing');
          toast.error("Payment system configuration issue");
        }
      } catch (error) {
        console.error("Error initializing Stripe:", error);
        setStripeError('Payment service connection failed');
        toast.error("Payment system unavailable");
      } finally {
        setIsStripeLoading(false);
      }
    };
    
    initializeStripe();
  }, []);

  return { stripePromise, isStripeLoading, stripeError };
};
