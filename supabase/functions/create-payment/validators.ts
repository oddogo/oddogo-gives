
import { PaymentRequest } from './types.ts';

export const validatePaymentRequest = (data: any): { isValid: boolean; error?: string } => {
  const { amount, recipientId } = data as PaymentRequest;
  const numericAmount = Number(amount);

  if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
    return { isValid: false, error: 'Invalid amount provided' };
  }

  if (!recipientId) {
    return { isValid: false, error: 'Missing recipient ID' };
  }

  return { isValid: true };
};
