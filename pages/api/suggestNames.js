// pages/api/suggestNames.js

import OpenAI from 'openai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const apiKey = req.headers['x-openai-api-key'] || process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ message: 'Missing OpenAI API Key' });
    }

    const openai = new OpenAI({
        apiKey: apiKey,
    });

    const { gender } = req.body;
    const prompt = `Generate a list of 5 heroic fantasy names for a ${gender} child. The names should be short and easy to pronounce. Return the list as a simple JSON array of strings. Do not include any other text.`;

    try {
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8,
            max_tokens: 100,
        });

        const nameText = chatCompletion.choices[0].message.content.trim();
        const names = JSON.parse(nameText);
        res.status(200).json({ names });

    } catch (error) {
        console.error("OpenAI API Error:", error.message);
        res.status(500).json({ message: 'Failed to generate names', error: error.message });
    }
}