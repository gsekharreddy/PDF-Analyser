// In file: /api/analyze.js

export const config = {
  runtime: 'edge', // Use the Edge Runtime for better performance
};

export default async function handler(req) {
  // Handle preflight OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: `Method ${req.method} Not Allowed` }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    });
  }

  // Securely get the API key from Vercel's environment variables
  const { GEMINI_API_KEY } = process.env;
  if (!GEMINI_API_KEY) {
    const errorMessage = "API key not found. Please ensure GEMINI_API_KEY is set in your Vercel project's Environment Variables.";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Call the Gemini API's streaming endpoint
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:streamGenerateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      }),
    });

    // **Improved Error Handling:** If the API call itself fails, provide a detailed error.
    if (!apiResponse.ok) {
        let errorBody;
        try {
            errorBody = await apiResponse.json();
        } catch {
            errorBody = { error: { message: "An unknown error occurred with the Gemini API." }};
        }
        console.error("Gemini API Error:", errorBody);
        const detailedError = errorBody.error?.message || `API call failed with status: ${apiResponse.status}`;
        return new Response(JSON.stringify({ error: `Gemini API Error: ${detailedError}` }), {
            status: apiResponse.status,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // If the call is successful, stream the response body directly to the client
    return new Response(apiResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err) {
    console.error("Server-side error:", err);
    return new Response(JSON.stringify({ error: `An internal server error occurred: ${err.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
