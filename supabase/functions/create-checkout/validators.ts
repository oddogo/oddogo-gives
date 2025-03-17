
export const validatePaymentRequest = (data: any) => {
  if (!data.amount || isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
    return { isValid: false, error: 'Invalid amount' };
  }
  
  if (!data.email || !data.email.includes('@')) {
    return { isValid: false, error: 'Invalid email address' };
  }
  
  if (!data.name || data.name.trim().length < 2) {
    return { isValid: false, error: 'Invalid name' };
  }
  
  if (!data.recipient_id) {
    return { isValid: false, error: 'Missing recipient ID' };
  }
  
  if (!data.success_url || !data.cancel_url) {
    return { isValid: false, error: 'Missing redirect URLs' };
  }
  
  return { isValid: true };
};
