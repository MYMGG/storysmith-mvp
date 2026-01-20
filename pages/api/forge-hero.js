// Example: /pages/api/forge-hero.js (final version with external .txt loader)

import fs from 'fs';
import path from 'path';
import OpenAI from "openai";

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
  try {
    const { userMessage, apiKey } = req.body;
    if (!userMessage) return res.status(400).json({ error: "Missing userMessage" });

    // Load prompt text from external .txt file
    const promptPath = path.join(process.cwd(), 'prompts', '01_Hero_And_Blueprint.txt');
    const fullPrompt = fs.readFileSync(promptPath, 'utf8');

    const openai = getOpenAIClient(apiKey);

    // Call OpenAI API
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: fullPrompt },
        { role: "user", content: userMessage }
      ]
    });

    res.status(200).json({ reply: chatResponse.choices[0].message.content });
  } catch (err) {
    console.error("Error in forge-hero:", err);
    res.status(500).json({ error: err.message });
  }
}
