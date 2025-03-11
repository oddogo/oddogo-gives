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

interface Payment {
  id: string;
  created_at: string;
  amount: number;
  status: string;
}

interface PaymentHistoryProps {
  fingerprintId: string;
}

export const PaymentHistory = ({ fingerprintId }: PaymentHistoryProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);

  const fetchPayments = async () => {
    const { data: fingerprint, error: fingerprintError } = await supabase
      .from('fingerprints_users')
      .select('user_id')
      .eq('fingerprint_id', fingerprintId)
      .single();

    if (fingerprintError) {
      console.error('Error fetching fingerprint:', fingerprintError);
      return;
    }

    const { data: userFingerprints } = await supabase
      .from('fingerprints_users')
      .select('fingerprint_id')
      .eq('user_id', fingerprint.user_id);

    if (!userFingerprints?.length) {
      console.error('No fingerprints found for user');
      return;
    }

    const fingerprintIds = userFingerprints.map(f => f.fingerprint_id);

    const { data, error } = await supabase
      .from('stripe_payments')
      .select('*')
      .in('fingerprint_id', fingerprintIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return;
    }

    setPayments(data || []);

    const completed = data?.filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0) || 0;
    const pending = data?.filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0) || 0;

    setTotalReceived(completed);
    setPendingAmount(pending);
  };

  useEffect(() => {
    fetchPayments();

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
        (payload) => {
          console.log('Payment update received:', payload);
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
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
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
