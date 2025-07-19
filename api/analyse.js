// /api/analyze.js - Vercel Serverless Function

// Import Dependencies
const fetch = require('node-fetch');

// Securely Get API Key from Vercel Environment Variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// The main function that Vercel will run
module.exports = async (req, res) => {
    // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle pre-flight requests for CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Ensure the request is a POST request
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Check if the API key is configured on Vercel
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured in Vercel's environment variables." });
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

        // Server-to-server call to Google API
        const geminiResponse = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const geminiResult = await geminiResponse.json();

        if (!geminiResponse.ok) {
            const errorMsg = geminiResult?.error?.message || 'An error occurred with the Gemini API.';
            return res.status(geminiResponse.status).json({ error: errorMsg });
        }
        
        const generatedText = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            return res.status(500).json({ error: 'Failed to get a valid response from the model.' });
        }
        
        // Send the successful response back to the frontend
        res.status(200).json({ analysis: generatedText });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};
