
import { Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePaymentHistory } from "@/hooks/usePaymentHistory";
import { PaymentSummaryCards } from "@/components/payment/PaymentSummaryCards";
import { CampaignProgress } from "@/components/payment/CampaignProgress";
import { PaymentsTable } from "@/components/payment/PaymentsTable";

interface PaymentHistoryProps {
  userId: string;
}

export const PaymentHistory = ({ userId }: PaymentHistoryProps) => {
  const {
    payments,
    totalReceived,
    pendingAmount,
    campaignPayments,
    loading
  } = usePaymentHistory(userId);

  return (
    <div className="w-full bg-gradient-to-b from-teal-950 to-teal-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="rounded-lg border border-white/20 overflow-hidden backdrop-blur-xl bg-slate-900/30">
          <CardHeader className="border-b border-white/20 bg-slate-900/50">
            <CardTitle className="text-xl font-semibold flex items-center gap-2 text-white">
              <Receipt className="w-5 h-5" />
              Donation History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <PaymentSummaryCards 
              totalReceived={totalReceived} 
              pendingAmount={pendingAmount} 
            />

            {/* Campaign donations sections */}
            {Object.keys(campaignPayments).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white/90">Campaign Donations</h3>
                {Object.entries(campaignPayments).map(([campaignId, payments]) => (
                  <CampaignProgress 
                    key={campaignId}
                    campaignId={campaignId} 
                    payments={payments} 
                  />
                ))}
              </div>
            )}

            {/* All payments table */}
            <PaymentsTable payments={payments} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
