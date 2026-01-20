// pages/api/analyzeImage.js

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const MODEL_NAME = "gemini-1.5-flash"; // Or "gemini-pro-vision"

// Helper function to fetch image data from a URL
async function urlToGenerativePart(url, mimeType) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(buffer).toString("base64"),
      mimeType,
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const API_KEY = req.headers['x-google-api-key'] || process.env.GOOGLE_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "Server configuration error: Google API key is missing. Please add it in settings." });
  }

  // Initialize the Google Generative AI client
  const genAI = new GoogleGenerativeAI(API_KEY);

  const { imageUrl, imageMimeType } = req.body;

  if (!imageUrl || !imageMimeType) {
    return res.status(400).json({ error: "imageUrl and imageMimeType are required." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // This is the detailed instruction we send to Gemini
    const prompt = `Analyze the person in this image. Based ONLY on visual information, describe them according to the following JSON schema. Be objective and focus on simple, clear descriptions suitable for a child's story. If a detail is ambiguous, leave the value as an empty string.

    {
      "gender": "boy, girl, or person",
      "hair_color": "e.g., brown, blonde, black",
      "hair_style": "e.g., short, long, curly, straight",
      "eye_color": "e.g., blue, brown, green",
      "wardrobe": "A simple description of their main clothing, e.g., 'a blue t-shirt and jeans'",
      "signature_item": "Identify one unique, memorable object or piece of clothing, e.g., 'red glasses' or 'a baseball cap'"
    }
    `;

    const imagePart = await urlToGenerativePart(imageUrl, imageMimeType);

    // Make the API call to Gemini
    const result = await model.generateContent([prompt, imagePart]);

    const responseText = result.response.text();

    // Clean the response to ensure it's valid JSON
    const jsonResponse = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());

    res.status(200).json(jsonResponse);

  } catch (error) {
    console.error("Error calling Google Generative AI API:", error);
    res.status(500).json({ error: `Failed to analyze image. ${error.message}` });
  }
}