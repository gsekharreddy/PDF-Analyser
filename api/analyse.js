// /api/analyze.js - Vercel Serverless Function

// Import Dependencies
const fetch = require('node-fetch');

// Securely Get API Key from Vercel Environment Variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// The main function that Vercel will run
module.exports = async (req, res) => {
    // Set CORS headers for all responses to allow frontend access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle CORS pre-flight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Ensure the request is a POST request
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    // Check if the API key is configured on Vercel
    if (!GEMINI_API_KEY) {
        console.error("Server Error: GEMINI_API_KEY is not configured.");
        return res.status(500).json({ error: "The server is missing its API key configuration." });
    }

    try {
        // Ensure there is a request body
        if (!req.body) {
            return res.status(400).json({ error: 'Request body is missing.' });
        }

        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required in the request body.' });
        }

        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
        
        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }]
        };

        // Server-to-server call to Google API
        const geminiResponse = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const geminiResult = await geminiResponse.json();

        if (!geminiResponse.ok) {
            const errorMsg = geminiResult?.error?.message || 'An unknown error occurred with the Gemini API.';
            console.error('Gemini API Error:', errorMsg);
            return res.status(geminiResponse.status).json({ error: errorMsg });
        }
        
        const generatedText = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            console.error('No text in Gemini response:', geminiResult);
            const blockReason = geminiResult?.promptFeedback?.blockReason;
            const errorMessage = blockReason 
                ? `Content was blocked by the API. Reason: ${blockReason}`
                : 'Failed to get a valid response from the model.';
            return res.status(500).json({ error: errorMessage });
        }
        
        // Send the successful response back to the frontend
        return res.status(200).json({ analysis: generatedText });

    } catch (error) {
        // This will catch any unexpected errors, like network issues or JSON parsing errors.
        console.error('Internal Server Error:', error);
        return res.status(500).json({ error: `An internal server error occurred: ${error.message}` });
    }
};
