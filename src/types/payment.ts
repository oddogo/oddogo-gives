
export interface Payment {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  stripe_payment_intent_id: string;
  stripe_payment_email: string;
  message?: string;
  campaign_id?: string;
  campaign_title?: string;
  campaign_slug?: string;
  donor_name?: string;
}

export interface CampaignPaymentGroup {
  [key: string]: Payment[];
}
