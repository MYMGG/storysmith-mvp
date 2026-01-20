// pages/api/suggestNames.js

import OpenAI from 'openai';

const getOpenAIClient = (apiKey) => {
    const finalKey = apiKey || process.env.OPENAI_API_KEY;
    if (!finalKey) {
        throw new Error('Missing OPENAI_API_KEY - please set it in Settings or environment variable');
    }
    return new OpenAI({
        apiKey: finalKey,
    });
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { gender, apiKey } = req.body;
    const prompt = `Generate a list of 5 heroic fantasy names for a ${gender} child. The names should be short and easy to pronounce. Return the list as a simple JSON array of strings. Do not include any other text.`;

    try {
        const openai = getOpenAIClient(apiKey);
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