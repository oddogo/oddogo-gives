
import { useEffect, useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentFormProps {
  user: User;
}

const PaymentFormContent = ({ user }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !amount) return;

    setIsProcessing(true);

    try {
      // Create payment intent
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { amount: parseFloat(amount), userId: user.id }
      });

      if (error) throw error;

      // Confirm payment
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required'
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Payment successful!');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount (£)
        </label>
        <Input
          id="amount"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
};

export const PaymentForm = ({ user }: PaymentFormProps) => {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Initialize payment intent
    const initializePayment = async () => {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { amount: 0, userId: user.id }
      });

      if (error) {
        toast.error('Failed to initialize payment');
        return;
      }

      setClientSecret(data.clientSecret);
    };

    initializePayment();
  }, [user.id]);

  if (!clientSecret) {
    return <div>Loading payment form...</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentFormContent user={user} />
    </Elements>
  );
};
