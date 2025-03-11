
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ModernHeader } from "@/components/ModernHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { InfoIcon, Banknote } from "lucide-react";

interface Transaction {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  status: string;
  stripe_payment_intent_id: string | null;
  stripe_payment_email: string | null;
}

const Transactions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      await loadTransactions(user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (userId: string) => {
    try {
      console.log('Loading transactions for user:', userId);
      const { data, error } = await supabase
        .from('stripe_payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Loaded transactions:', data);
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2C1F3C] text-white">
      <div className="flex">
        <DashboardSidebar user={user} onSignOut={() => navigate("/auth")} />
        <div className="flex-1">
          <ModernHeader user={user} />
          <div className="p-6 space-y-6">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="w-5 h-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-white/10">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(new Date(transaction.created_at), 'PPp')}
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('en-GB', {
                              style: 'currency',
                              currency: transaction.currency.toUpperCase()
                            }).format(transaction.amount / 100)}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {transaction.stripe_payment_intent_id || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {transaction.stripe_payment_email || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {transactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                              <InfoIcon className="w-5 h-5" />
                              No transactions found
                            </div>
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
      </div>
    </div>
  );
};

export default Transactions;
