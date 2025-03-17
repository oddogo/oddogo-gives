
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './types.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    const publishableKey = Deno.env.get('STRIPE_PUBLISHABLE_KEY');
    
    if (!publishableKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe publishable key not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ publishableKey }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error retrieving Stripe key:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve Stripe key' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
