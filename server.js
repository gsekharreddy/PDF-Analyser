// server.js

// 1. Import Dependencies
// Make sure to install these with: npm install express node-fetch cors dotenv
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config(); // This loads the variables from your .env file

// 2. Setup Express App
const app = express();
const port = 3000; // The port your server will run on

// 3. Middleware
app.use(cors()); // Allows your frontend (on a different origin) to make requests to this backend
app.use(express.json()); // Allows the server to understand JSON in request bodies

// 4. Securely Get API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// A check to ensure the server doesn't start without the key
if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in the .env file.");
    process.exit(1);
}

// 5. Create the API Endpoint
app.post('/analyze', async (req, res) => {
    // Extract the 'prompt' from the frontend's request body
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

    try {
        // This is the server-to-server call to the Google API
        const geminiResponse = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const geminiResult = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error('Gemini API Error:', geminiResult);
            const errorMsg = geminiResult?.error?.message || 'An error occurred with the Gemini API.';
            return res.status(geminiResponse.status).json({ error: errorMsg });
        }
        
        const generatedText = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            console.error('No text found in Gemini response:', geminiResult);
            return res.status(500).json({ error: 'Failed to get a valid response from the model.' });
        }
        
        // Send the extracted text back to the frontend
        res.json({ analysis: generatedText });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

// 6. Start the Server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log('Waiting for requests to /analyze...');
});
