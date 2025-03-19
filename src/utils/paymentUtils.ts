
import { Payment } from "@/types/payment";

export const formatCurrency = (amount: number): string => {
  return `£${(amount / 100).toFixed(2)}`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
};

export const calculateTotals = (payments: Payment[]) => {
  const completed = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0) || 0;
  
  const pending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0) || 0;
    
  return { completed, pending, total: completed + pending };
};

export const organizePaymentsByCampaign = (payments: Payment[]) => {
  const byCampaign: {[key: string]: Payment[]} = {};
  const standalone: Payment[] = [];

  payments.forEach(payment => {
    if (payment.campaign_id) {
      if (!byCampaign[payment.campaign_id]) {
        byCampaign[payment.campaign_id] = [];
      }
      byCampaign[payment.campaign_id].push(payment);
    } else {
      standalone.push(payment);
    }
  });

  return { campaignPayments: byCampaign, standalonePayments: standalone };
};
