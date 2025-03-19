
import { useEffect, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, DollarSign, Clock, Award, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface Payment {
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

interface PaymentHistoryProps {
  userId: string;
}

export const PaymentHistory = ({ userId }: PaymentHistoryProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [campaignPayments, setCampaignPayments] = useState<{[key: string]: Payment[]}>({});
  const [standalonePayments, setStandalonePayments] = useState<Payment[]>([]);
  const [userFingerprint, setUserFingerprint] = useState<string | null>(null);

  const fetchFingerprint = async () => {
    try {
      const { data, error } = await supabase
        .from('fingerprints_users')
        .select('fingerprint_id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching fingerprint:', error);
        return null;
      }
      
      console.log('Fetched fingerprint for user:', data?.fingerprint_id);
      setUserFingerprint(data?.fingerprint_id || null);
      return data?.fingerprint_id;
    } catch (error) {
      console.error('Error in fetchFingerprint:', error);
      return null;
    }
  };

  const fetchPayments = async (fingerprintId: string | null) => {
    try {
      if (!fingerprintId) {
        console.log('No fingerprint ID available, cannot fetch payments');
        return;
      }
      
      console.log('Fetching payments for fingerprint ID:', fingerprintId);
      
      // Use v_stripe_payments view which has the necessary related data
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('v_stripe_payments')
        .select('*')
        .eq('fingerprint_id', fingerprintId)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching payments by fingerprint:', paymentsError);
        toast.error('Failed to load payment history');
        return;
      }

      console.log('Fetched payments data:', paymentsData);

      // Get campaign info for payments
      const paymentIds = paymentsData?.map(p => p.id) || [];
      
      if (paymentIds.length > 0) {
        const { data: campaignPaymentsData, error: campaignError } = await supabase
          .from('campaign_payments')
          .select(`
            campaign_id,
            payment_id,
            campaigns (
              id,
              title,
              slug
            )
          `)
          .in('payment_id', paymentIds);

        if (campaignError) {
          console.error('Error fetching campaign payment associations:', campaignError);
        } else {
          console.log('Campaign payments data:', campaignPaymentsData);
          
          // Create a map of payment IDs to campaign info
          const campaignMap: Record<string, { id: string, title: string, slug: string }> = {};
          campaignPaymentsData?.forEach(cp => {
            if (cp.campaigns) {
              campaignMap[cp.payment_id] = {
                id: cp.campaign_id,
                title: cp.campaigns.title,
                slug: cp.campaigns.slug
              };
            }
          });

          // Enhance payment data with campaign info
          const enhancedPayments = paymentsData?.map(payment => {
            const campaignInfo = campaignMap[payment.id];
            return {
              ...payment,
              campaign_id: campaignInfo?.id,
              campaign_title: campaignInfo?.title,
              campaign_slug: campaignInfo?.slug
            };
          }) || [];

          console.log('Enhanced payments with campaign data:', enhancedPayments);
          setPayments(enhancedPayments);

          // Calculate amounts
          const completed = enhancedPayments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0) || 0;
          const pending = enhancedPayments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + p.amount, 0) || 0;

          setTotalReceived(completed);
          setPendingAmount(pending);

          // Organize payments by campaign
          const byCampaign: {[key: string]: Payment[]} = {};
          const standalone: Payment[] = [];

          enhancedPayments.forEach(payment => {
            if (payment.campaign_id) {
              if (!byCampaign[payment.campaign_id]) {
                byCampaign[payment.campaign_id] = [];
              }
              byCampaign[payment.campaign_id].push(payment);
            } else {
              standalone.push(payment);
            }
          });

          setCampaignPayments(byCampaign);
          setStandalonePayments(standalone);
        }
      } else {
        // If no payments, set empty arrays
        setPayments([]);
        setCampaignPayments({});
        setStandalonePayments([]);
        setTotalReceived(0);
        setPendingAmount(0);
      }
    } catch (error) {
      console.error('Error in fetchPayments:', error);
      toast.error('Failed to load payment history');
    }
  };

  useEffect(() => {
    const init = async () => {
      if (userId) {
        const fingerprintId = await fetchFingerprint();
        if (fingerprintId) {
          fetchPayments(fingerprintId);
        }
      }
    };
    
    init();

    // Setup subscription for real-time updates
    if (userId) {
      const channel = supabase
        .channel('stripe_payments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stripe_payments'
          },
          async () => {
            const fingerprintId = await fetchFingerprint();
            if (fingerprintId) {
              fetchPayments(fingerprintId);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const formatCurrency = (amount: number) => {
    return `£${(amount / 100).toFixed(2)}`;
  };

  const renderCampaignProgress = (campaignId: string, payments: Payment[]) => {
    const campaignTitle = payments[0]?.campaign_title || 'Campaign';
    const completedAmount = payments.filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = payments.filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
    const totalAmount = completedAmount + pendingAmount;
    
    return (
      <div key={campaignId} className="space-y-4 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">{campaignTitle}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-3 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Total received</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-green-600 font-medium">Completed</span>
                <span className="text-green-600">{formatCurrency(completedAmount)}</span>
              </div>
              <Progress value={(completedAmount / totalAmount) * 100} className="h-2 bg-gray-200" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-amber-600 font-medium">Pending</span>
                <span className="text-amber-600">{formatCurrency(pendingAmount)}</span>
              </div>
              <Progress value={(pendingAmount / totalAmount) * 100} className="h-2 bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="backdrop-blur-xl bg-green-500/10 p-4 rounded-lg flex items-center justify-between border border-green-500/20">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-green-200">Total Given</span>
                </div>
                <span className="text-lg font-bold text-green-100">
                  £{(totalReceived / 100).toFixed(2)}
                </span>
              </div>
              <div className="backdrop-blur-xl bg-yellow-500/10 p-4 rounded-lg flex items-center justify-between border border-yellow-500/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-200">Pending</span>
                </div>
                <span className="text-lg font-bold text-yellow-100">
                  £{(pendingAmount / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Campaign donations sections */}
            {Object.keys(campaignPayments).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white/90">Campaign Donations</h3>
                {Object.entries(campaignPayments).map(([campaignId, payments]) => 
                  renderCampaignProgress(campaignId, payments)
                )}
              </div>
            )}

            {/* All payments table */}
            <div className="rounded-md border border-white/20 overflow-hidden backdrop-blur-xl bg-slate-900/30">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20 hover:bg-white/5">
                    <TableHead className="text-white/90">Date</TableHead>
                    <TableHead className="text-white/90">Amount</TableHead>
                    <TableHead className="text-white/90">Status</TableHead>
                    <TableHead className="text-white/90">Campaign</TableHead>
                    <TableHead className="text-white/90">From</TableHead>
                    <TableHead className="text-white/90">Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="border-white/20 hover:bg-white/5">
                      <TableCell className="text-white">
                        {new Date(payment.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        £{(payment.amount / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${payment.status === 'completed' ? 'bg-green-500/20 text-green-100' : 'bg-yellow-500/20 text-yellow-100'}`
                        }>
                          {payment.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-white/80">
                        {payment.campaign_title || 'Direct Donation'}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {payment.donor_name || payment.stripe_payment_email || 'Anonymous'}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {payment.message ? (
                          <div className="flex items-center">
                            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                            <span className="truncate max-w-[150px]">{payment.message}</span>
                          </div>
                        ) : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-white/70 py-8">
                        No donations made yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
