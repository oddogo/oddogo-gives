
export interface Campaign {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  created_at: string;
  updated_at: string;
  end_date: string | null;
  status: 'active' | 'completed' | 'cancelled';
  image_url: string | null;
  slug: string | null;
  is_featured: boolean;
}

export interface CampaignStatistic extends Campaign {
  donation_count: number;
  user_email: string;
  creator_name: string;
  creator_avatar: string | null;
}

export interface CampaignPayment {
  id: string;
  campaign_id: string;
  payment_id: string;
  created_at: string;
  assigned_by: string | null;
}
