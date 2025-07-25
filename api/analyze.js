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

    const { GEMINI_API_KEY } = process.env;
    if (!GEMINI_API_KEY) return res.status(500).json({ error: "Missing GEMINI_API_KEY in Vercel env." });

    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Prompt is required." });

        // --- ⬇️ STEP 1: CHANGE THE MODEL NAME HERE ⬇️ ---
        // You can swap this with other models like 'gemini-1.5-pro-latest'.
        const modelName = 'gemini-1.5-flash-latest';
        // ----------------------------------------------------

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || "Gemini API error." });
        }

        const output = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!output) return res.status(500).json({ error: "No output from model." });

        res.status(200).json({ analysis: output });
    } catch (err) {
        res.status(500).json({ error: "Server error: " + err.message });
    }
}
