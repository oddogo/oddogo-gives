
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const UNSPLASH_ACCESS_KEY = Deno.env.get('UNSPLASH_API_KEY')
    if (!UNSPLASH_ACCESS_KEY) {
      console.error('Missing UNSPLASH_API_KEY environment variable')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const { query } = await req.json()
    console.log(`Processing search request for: "${query}"`)

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Make request to Unsplash API
    const url = new URL('https://api.unsplash.com/search/photos')
    url.searchParams.append('query', query)
    url.searchParams.append('per_page', '10')
    url.searchParams.append('content_filter', 'high')

    console.log(`Sending request to Unsplash API: ${url.toString()}`)
    const unsplashResponse = await fetch(url.toString(), {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    })

    if (!unsplashResponse.ok) {
      const errorText = await unsplashResponse.text()
      console.error(`Unsplash API error (${unsplashResponse.status}): ${errorText}`)
      return new Response(
        JSON.stringify({ 
          error: `Unsplash API returned an error: ${unsplashResponse.status}`,
          details: errorText
        }),
        { 
          status: unsplashResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const data = await unsplashResponse.json()
    console.log(`Received ${data.results?.length || 0} results from Unsplash API`)

    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
