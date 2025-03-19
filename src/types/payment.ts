
export interface Payment {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  stripe_payment_intent_id: string;
  stripe_payment_email: string;
  stripe_payment_method_id?: string;
  stripe_charge_id?: string;
  message?: string;
  campaign_id?: string;
  campaign_title?: string;
  campaign_slug?: string;
  donor_name?: string;
  fingerprint_id?: string;
  user_id?: string;
}

export interface CampaignPaymentGroup {
  [key: string]: Payment[];
}
