
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

  // Check if this is a GET request
  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("query");

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

    // Make the request to Unsplash API
    const response = await fetch(searchUrl.toString(), {
      headers: {
        "Authorization": `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Unsplash API responded with status: ${response.status}`);
    }

    const data = await response.json();

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
