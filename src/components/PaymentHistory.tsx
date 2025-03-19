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
import { Receipt, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";

interface Payment {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  stripe_payment_intent_id: string;
  stripe_payment_email: string;
}

interface PaymentHistoryProps {
  userId: string;
}

export const PaymentHistory = ({ userId }: PaymentHistoryProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);

  const fetchPayments = async () => {
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('v_stripe_payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        toast.error('Failed to load payment history');
        return;
      }

      console.log('Fetched payments:', paymentsData);
      setPayments(paymentsData || []);

      const completed = paymentsData?.filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0) || 0;
      const pending = paymentsData?.filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0) || 0;

      setTotalReceived(completed);
      setPendingAmount(pending);
    } catch (error) {
      console.error('Error in fetchPayments:', error);
      toast.error('Failed to load payment history');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPayments();
    }

    const channel = supabase
      .channel('stripe_payments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'v_stripe_payments',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

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

            <div className="rounded-md border border-white/20 overflow-hidden backdrop-blur-xl bg-slate-900/30">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20 hover:bg-white/5">
                    <TableHead className="text-white/90">Date</TableHead>
                    <TableHead className="text-white/90">Amount</TableHead>
                    <TableHead className="text-white/90">Status</TableHead>
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
                    </TableRow>
                  ))}
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-white/70 py-8">
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
