
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  // Only allow GET and POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Handle GET request - retrieve webhook statistics
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const days = parseInt(url.searchParams.get('days') || '7');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const status = url.searchParams.get('status') || null;
      
      // Set the date range for the query
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Create the base query
      let query = supabase
        .from('stripe_webhook_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);
      
      // Add status filter if provided
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data: webhookLogs, error: logsError } = await query;
      
      if (logsError) {
        throw new Error(`Error fetching webhook logs: ${logsError.message}`);
      }
      
      // Get counts by status
      const { data: statusCounts, error: statusError } = await supabase
        .from('stripe_webhook_logs')
        .select('status, count(*)')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .group('status');
        
      if (statusError) {
        throw new Error(`Error fetching status counts: ${statusError.message}`);
      }
      
      // Get counts by event type
      const { data: typeCounts, error: typeError } = await supabase
        .from('stripe_webhook_logs')
        .select('event_type, count(*)')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .group('event_type');
        
      if (typeError) {
        throw new Error(`Error fetching type counts: ${typeError.message}`);
      }
      
      return new Response(
        JSON.stringify({
          webhooks: webhookLogs,
          statusCounts,
          typeCounts,
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Handle POST request - retry a failed webhook
    if (req.method === 'POST') {
      const { webhookId } = await req.json();
      
      if (!webhookId) {
        return new Response(
          JSON.stringify({ error: 'Missing webhookId parameter' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Get the webhook details
      const { data: webhook, error: webhookError } = await supabase
        .from('stripe_webhook_logs')
        .select('*')
        .eq('id', webhookId)
        .single();
        
      if (webhookError || !webhook) {
        return new Response(
          JSON.stringify({ error: `Webhook not found: ${webhookError?.message || 'No record found'}` }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Mark the webhook as being retried
      const { error: updateError } = await supabase
        .from('stripe_webhook_logs')
        .update({ 
          status: 'retry_requested',
          retried_at: new Date().toISOString()
        })
        .eq('id', webhookId);
        
      if (updateError) {
        return new Response(
          JSON.stringify({ error: `Failed to update webhook status: ${updateError.message}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // For now, we're just marking the webhook for retry - actual retry logic would be implemented
      // in a background job or cron function
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Webhook marked for retry',
          webhookId,
          status: 'retry_requested'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // This should never be reached given the method checks above
    return new Response(
      JSON.stringify({ error: 'Unknown request type' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Webhook monitoring error:', error);
    
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message || 'Unknown error'}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
