// pages/api/generateImage.js

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

  const { prompt, apiKey } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "A 'prompt' is required in the request body." });
  }

  try {
    const openai = getOpenAIClient(apiKey);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data[0].url;
    res.status(200).json({ imageUrl });

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ error: `Failed to generate image. ${error.message}` });
  }
}