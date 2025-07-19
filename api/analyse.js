// /api/analyze.js - Vercel Serverless Function (Final Debugging Version)

import fetch from 'node-fetch';

// The main function that Vercel will run
export default async function handler(req, res) {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS pre-flight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // --- START OF DEBUGGING LOGS ---
    console.log("Function /api/analyze invoked.");
    const { GEMINI_API_KEY } = process.env;

    if (!GEMINI_API_KEY) {
        console.error("CRITICAL ERROR: GEMINI_API_KEY is not found in environment variables.");
        // Send a specific error back to the frontend
        return res.status(500).json({ error: "Server configuration error: The API key is missing. Please check the Vercel project settings." });
    } else {
        console.log("GEMINI_API_KEY found.");
    }
    // --- END OF DEBUGGING LOGS ---

    // Ensure the request is a POST request
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
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
            const blockReason = geminiResult?.promptFeedback?.blockReason;
            const errorMessage = blockReason 
                ? `Content was blocked by the API. Reason: ${blockReason}`
                : 'Failed to get a valid response from the model.';
            console.error('Response Error:', errorMessage);
            return res.status(500).json({ error: errorMessage });
        }
        
        return res.status(200).json({ analysis: generatedText });

    } catch (error) {
        console.error('Internal Server Error:', error);
        return res.status(500).json({ error: `An unexpected server error occurred: ${error.message}` });
    }
}
