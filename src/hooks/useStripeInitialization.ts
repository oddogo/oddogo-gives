
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStripeInitialization = () => {
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(true);

  useEffect(() => {
    const initializeStripe = async () => {
      setIsStripeLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-stripe-key');
        
        if (error) {
          console.error('Error fetching Stripe key:', error);
          toast.error("Failed to initialize payment system");
          return;
        }
        
        if (data?.publishableKey) {
          setStripePromise(loadStripe(data.publishableKey));
        }
      } catch (error) {
        console.error("Error initializing Stripe:", error);
        toast.error("Payment system initialization failed");
      } finally {
        setIsStripeLoading(false);
      }
    };
    
    initializeStripe();
  }, []);

  return { stripePromise, isStripeLoading };
};
