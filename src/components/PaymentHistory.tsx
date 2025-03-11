
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
import { Receipt, DollarSign, Clock, CreditCard } from "lucide-react";
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
  fingerprintId: string;
}

export const PaymentHistory = ({ fingerprintId }: PaymentHistoryProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);

  const fetchPayments = async () => {
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('stripe_payments')
        .select('*')
        .eq('fingerprint_id', fingerprintId)
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
    if (fingerprintId) {
      fetchPayments();
    }

    const channel = supabase
      .channel('stripe_payments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stripe_payments',
          filter: `fingerprint_id=eq.${fingerprintId}`
        },
        () => {
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fingerprintId]);

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800">Total Received</span>
            </div>
            <span className="text-lg font-bold text-green-700">
              £{(totalReceived / 100).toFixed(2)}
            </span>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-yellow-800">Pending</span>
            </div>
            <span className="text-lg font-bold text-yellow-700">
              £{(pendingAmount / 100).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {new Date(payment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>£{(payment.amount / 100).toFixed(2)}</TableCell>
                  <TableCell>{payment.stripe_payment_email || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <CreditCard className="w-4 h-4" />
                      {payment.stripe_payment_intent_id ? 
                        payment.stripe_payment_intent_id.slice(-8) : 
                        'N/A'
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`
                    }>
                      {payment.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No payments received yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

