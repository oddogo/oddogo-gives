
import { PaymentRequest } from './types.ts';

export function validatePaymentRequest(data: any): { valid: boolean; errors?: string } {
  console.log('Validating payment request:', JSON.stringify(data));

  // Check if data exists
  if (!data) {
    return { valid: false, errors: 'No payment data provided' };
  }

  // Check if the required fields exist
  if (!data.amount) {
    return { valid: false, errors: 'Amount is required' };
  }

  if (!data.email) {
    return { valid: false, errors: 'Email is required' };
  }

  // Check if amount is a valid number
  const amount = Number(data.amount);
  if (isNaN(amount)) {
    return { valid: false, errors: 'Amount must be a valid number' };
  }

  // Check if amount is positive
  if (amount <= 0) {
    return { valid: false, errors: 'Amount must be greater than 0' };
  }

  // Check if recipientId is provided
  if (!data.recipientId || typeof data.recipientId !== 'string') {
    return { valid: false, errors: 'Recipient ID is required and must be a string' };
  }

  // Check if email is valid
  if (!isValidEmail(data.email)) {
    return { valid: false, errors: 'Invalid email format' };
  }

  // Check if URLs are provided
  if (!data.successUrl || typeof data.successUrl !== 'string') {
    return { valid: false, errors: 'Success URL is required and must be a string' };
  }

  if (!data.cancelUrl || typeof data.cancelUrl !== 'string') {
    return { valid: false, errors: 'Cancel URL is required and must be a string' };
  }

  console.log('Validation successful');
  return { valid: true };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
