import { chatWithGemini } from '../../src/server/geminiService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;

  try {
    const { messages, contextProduct, model } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Messages list is required.',
      });
    }

    if (!apiKey) {
      return res.status(200).json({
        success: true,
        isDemoMode: true,
        reply: 'This is a demo response. To converse with live Gemini Flash, please configure GEMINI_API_KEY in your environment variables.',
      });
    }

    const chatResult = await chatWithGemini({
      apiKey,
      model: model || 'gemini-3.5-flash-lite',
      messages,
      contextProduct,
    });

    return res.status(200).json({
      success: true,
      reply: chatResult.text,
    });
  } catch (err) {
    console.error('[Clean Quest AI Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred while processing with Gemini Flash.',
    });
  }
}

