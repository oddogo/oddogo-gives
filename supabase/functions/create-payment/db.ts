
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

export const getFingerprintId = async (recipientId: string) => {
  console.log('Getting fingerprint for recipient:', recipientId);
  
  const { data: fingerprint, error: fingerprintError } = await supabaseClient
    .from('fingerprints_users')
    .select('fingerprint_id')
    .eq('user_id', recipientId)
    .maybeSingle();

  if (fingerprintError) {
    console.error('Error fetching fingerprint:', fingerprintError);
    throw new Error('Failed to fetch recipient fingerprint');
  }

  if (!fingerprint?.fingerprint_id) {
    console.error('No fingerprint found for recipient:', recipientId);
    throw new Error('Recipient not found');
  }

  console.log('Found fingerprint:', fingerprint.fingerprint_id);
  return fingerprint.fingerprint_id;
};

export const getUserId = async (authHeader: string | null) => {
  if (!authHeader) return null;
  
  try {
    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    return user?.id || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};
