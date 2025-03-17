
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";
const UNSPLASH_ACCESS_KEY = Deno.env.get("UNSPLASH_ACCESS_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request data
    let query = "";
    
    // Check if this is a POST or GET request and get the query parameter accordingly
    if (req.method === "POST") {
      // For POST requests, extract query from the request body
      const body = await req.json();
      query = body.query || "";
    } else if (req.method === "GET") {
      // For GET requests, extract query from URL parameters
      const url = new URL(req.url);
      query = url.searchParams.get("query") || "";
    } else {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { 
          status: 405, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!UNSPLASH_ACCESS_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error", 
          message: "Unsplash API key is not configured" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Construct the search URL
    const searchUrl = new URL(UNSPLASH_API_URL);
    searchUrl.searchParams.append("query", query);
    searchUrl.searchParams.append("per_page", "12");
    searchUrl.searchParams.append("orientation", "landscape");

    // Add some debugging logs
    console.log(`Searching Unsplash for: ${query}`);
    console.log(`Using API URL: ${searchUrl.toString()}`);
    console.log(`Access Key available: ${UNSPLASH_ACCESS_KEY ? 'Yes' : 'No'}`);

    // Make the request to Unsplash API
    const response = await fetch(searchUrl.toString(), {
      headers: {
        "Authorization": `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    if (!response.ok) {
      console.error(`Unsplash API responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Unsplash API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Found ${data.results?.length || 0} results`);

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to search for images", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
