
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";

export function useStripeInitialization() {
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      const { data, error } = await supabase.functions.invoke('get-stripe-key');
      
      if (error) {
        console.error('Error fetching Stripe key:', error);
        return;
      }
      
      if (data?.publishableKey) {
        setStripePromise(loadStripe(data.publishableKey));
      }
    };
    
    initializeStripe();
  }, []);

  return stripePromise;
}
