
import { PaymentRequest } from './types.ts';

export const validatePaymentRequest = (data: any): { isValid: boolean; error?: string } => {
  // Check if the required fields exist
  if (!data.amount) {
    return { isValid: false, error: 'Amount is required' };
  }

  if (!data.recipientId) {
    return { isValid: false, error: 'Recipient ID is required' };
  }

  // Check if amount is a valid number
  const amount = Number(data.amount);
  if (isNaN(amount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }

  // Check if amount is positive
  if (amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }

  // Check if email is valid if provided
  if (data.email && !isValidEmail(data.email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
};

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
