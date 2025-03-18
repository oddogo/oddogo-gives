
import { PaymentRequest } from './types.ts';

export const validatePaymentRequest = (data: any): { isValid: boolean; error?: string } => {
  console.log('Validating payment request:', data);

  // Check if data exists
  if (!data) {
    return { isValid: false, error: 'No payment data provided' };
  }

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

  // Check if recipientId is a valid string
  if (typeof data.recipientId !== 'string') {
    return { isValid: false, error: 'Recipient ID must be a string' };
  }

  // Check if email is valid if provided
  if (data.email && !isValidEmail(data.email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  console.log('Validation successful');
  return { isValid: true };
};

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
