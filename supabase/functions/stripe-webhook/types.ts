
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  livemode: boolean;
}

export interface StripeSession {
  id: string;
  customer_email?: string;
  customer?: string;
  payment_intent?: string;
  payment_method?: string;
  metadata?: {
    payment_id?: string;
    recipient_id?: string;
    fingerprint_id?: string;
    user_id?: string;
    campaign_id?: string;
  };
}

export interface PaymentIntent {
  id: string;
  payment_method?: string;
  latest_charge?: string;
  last_payment_error?: {
    message?: string;
  };
  metadata?: {
    payment_id?: string;
    recipient_id?: string;
    fingerprint_id?: string;
    user_id?: string;
    campaign_id?: string;
  };
}
