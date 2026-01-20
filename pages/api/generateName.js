// pages/api/generateName.js

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

  const { type, gender, apiKey } = req.body;

  let prompt = "";
  if (type === 'whimsical') {
    prompt = `Generate a whimsical, fantasy-style name for a child hero. The name should be creative and imaginative. The hero's gender is ${gender}. Provide only the name, without any other text.`;
  } else if (type === 'surprise') {
    prompt = `Generate a surprising and unique fantasy hero name for a child. The name should be memorable and fit the fantasy genre. The hero's gender is ${gender}. Provide only the name, without any other text.`;
  } else {
    return res.status(400).json({ message: 'Invalid name type provided' });
  }

  try {
    const openai = getOpenAIClient(apiKey);
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 20,
    });

    const name = chatCompletion.choices[0].message.content.trim().replace(/['"]+/g, '');
    res.status(200).json({ name });

  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    res.status(500).json({ message: 'Failed to generate name', error: error.message });
  }
}