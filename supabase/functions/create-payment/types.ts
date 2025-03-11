
export interface PaymentRequest {
  amount: number;
  recipientId: string;
}

export interface PaymentData {
  amount: number;
  currency: string;
  user_id: string | null;
  fingerprint_id: string;
  status: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
