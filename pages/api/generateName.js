// pages/api/generateName.js

import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const apiKey = req.headers['x-openai-api-key'] || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: 'Missing OpenAI API Key. Please add it in settings.' });
  }

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  const { type, gender } = req.body;

  let prompt = "";
  if (type === 'whimsical') {
    prompt = `Generate a whimsical, fantasy-style name for a child hero. The name should be creative and imaginative. The hero's gender is ${gender}. Provide only the name, without any other text.`;
  } else if (type === 'surprise') {
    prompt = `Generate a surprising and unique fantasy hero name for a child. The name should be memorable and fit the fantasy genre. The hero's gender is ${gender}. Provide only the name, without any other text.`;
  } else {
    return res.status(400).json({ message: 'Invalid name type provided' });
  }

  try {
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