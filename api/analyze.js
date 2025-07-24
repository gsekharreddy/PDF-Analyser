// /api/analyze.js

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    // --- STEP 1: Update your Vercel Environment Variable ---
    // This now looks for 'API_KEY'
    const { API_KEY } = process.env;
    if (!API_KEY) return res.status(500).json({ error: "Missing API_KEY in Vercel env." });
    // ---------------------------------------------------------

    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Prompt is required." });

        // --- STEP 2: API Details for DeepSeek ---
        const modelName = 'deepseek-chat'; // Or 'deepseek-coder' for coding tasks
        const apiUrl = 'https://api.deepseek.com/chat/completions';
        // -----------------------------------------

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // DeepSeek uses a Bearer token for authentication
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                // DeepSeek uses a 'messages' array structure
                messages: [
                    { "role": "user", "content": prompt }
                ],
                model: modelName
            })
        });

        const data = await response.json();
        if (!response.ok) {
            // Forward the error message from DeepSeek's API
            return res.status(response.status).json({ error: data.error?.message || "DeepSeek API error." });
        }

        // Extract the text from DeepSeek's response structure
        const output = data.choices?.[0]?.message?.content;
        if (!output) return res.status(500).json({ error: "No output from model." });

        res.status(200).json({ analysis: output });
    } catch (err) {
        res.status(500).json({ error: "Server error: " + err.message });
    }
}
