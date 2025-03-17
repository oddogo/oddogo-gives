import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Campaign } from '@/types/campaign';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Check, Loader2, PackagePlus, Trash2 } from 'lucide-react';

interface Payment {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  campaign_id?: string | null;
  campaign_title?: string | null;
}

interface PaymentAssignmentProps {
  campaign: Campaign;
  onAssignmentChange?: () => void;
}

export const PaymentAssignment = ({ campaign, onAssignmentChange }: PaymentAssignmentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [assignedPayments, setAssignedPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState<string | null>(null);
  const [unassignLoading, setUnassignLoading] = useState<string | null>(null);
  const [confirmUnassign, setConfirmUnassign] = useState<Payment | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      // Get payments associated with this campaign
      const { data: campaignPayments, error: campaignError } = await supabase
        .from('campaign_payments')
        .select('payment_id')
        .eq('campaign_id', campaign.id);

      if (campaignError) throw campaignError;
      
      // Get assigned payment details
      if (campaignPayments && campaignPayments.length > 0) {
        const paymentIds = campaignPayments.map(cp => cp.payment_id);
        
        const { data: assignedData, error: assignedError } = await supabase
          .from('stripe_payments')
          .select('*')
          .in('id', paymentIds)
          .eq('status', 'completed');

        if (assignedError) throw assignedError;
        
        setAssignedPayments(assignedData || []);
      } else {
        setAssignedPayments([]);
      }
      
      // Get all available payments (not assigned to any campaign)
      const { data: availablePayments, error: availableError } = await supabase
        .from('stripe_payments')
        .select('*')
        .eq('status', 'completed')
        .not('id', 'in', campaignPayments && campaignPayments.length > 0 
            ? `(SELECT payment_id FROM campaign_payments)` 
            : 'NULL')
        .order('created_at', { ascending: false });

      if (availableError) throw availableError;
      setPayments(availablePayments || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    fetchPayments();
  };

  const handleAssign = async (paymentId: string) => {
    try {
      setAssignLoading(paymentId);
      
      // Assign payment to campaign
      const { error } = await supabase
        .from('campaign_payments')
        .insert({ 
          campaign_id: campaign.id,
          payment_id: paymentId 
        });

      if (error) throw error;
      
      toast.success('Payment assigned to campaign');
      fetchPayments();
      if (onAssignmentChange) onAssignmentChange();
    } catch (error: any) {
      console.error('Error assigning payment:', error);
      toast.error('Failed to assign payment');
    } finally {
      setAssignLoading(null);
    }
  };

  const handleUnassign = async () => {
    if (!confirmUnassign) return;
    
    try {
      setUnassignLoading(confirmUnassign.id);
      
      // Remove payment from campaign
      const { error } = await supabase
        .from('campaign_payments')
        .delete()
        .eq('payment_id', confirmUnassign.id)
        .eq('campaign_id', campaign.id);

      if (error) throw error;
      
      toast.success('Payment removed from campaign');
      setConfirmUnassign(null);
      fetchPayments();
      if (onAssignmentChange) onAssignmentChange();
    } catch (error: any) {
      console.error('Error removing payment:', error);
      toast.error('Failed to remove payment');
    } finally {
      setUnassignLoading(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPayments();
    }
  }, [isOpen]);

  const formatAmount = (amount: number) => {
    return `£${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={handleOpen} variant="outline" className="gap-2">
            <PackagePlus size={16} />
            Assign Payments
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Payments for {campaign.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Assigned payments */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Assigned Payments</h3>
              <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-800">
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-white/70" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : assignedPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-white/70 py-8">
                          No payments have been assigned to this campaign yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignedPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.created_at)}</TableCell>
                          <TableCell className="font-medium">{formatAmount(payment.amount)}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-100">
                              {payment.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                              onClick={() => setConfirmUnassign(payment)}
                              disabled={unassignLoading === payment.id}
                            >
                              {unassignLoading === payment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Available payments */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Available Payments</h3>
              <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-800">
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-white/70" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-white/70 py-8">
                          No available payments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.created_at)}</TableCell>
                          <TableCell className="font-medium">{formatAmount(payment.amount)}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-100">
                              {payment.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                              onClick={() => handleAssign(payment.id)}
                              disabled={assignLoading === payment.id}
                            >
                              {assignLoading === payment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!confirmUnassign} onOpenChange={(open) => !open && setConfirmUnassign(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove payment from campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the payment of {confirmUnassign && formatAmount(confirmUnassign.amount)} from this campaign.
              The campaign progress will be updated accordingly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnassign}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
