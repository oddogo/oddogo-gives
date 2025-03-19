
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export interface PaymentData {
  amount: number;
  currency: string;
  fingerprint_id: string;
  user_id: string | null;
  status: string;
  stripe_payment_email?: string;
  stripe_payment_method_id?: string;
  stripe_charge_id?: string;
  message?: string;
  campaignId?: string;
  donor_name?: string;
}
