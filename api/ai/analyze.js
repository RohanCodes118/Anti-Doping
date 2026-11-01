import { analyzeMedicineWithGemini, getDemoAnalysisFallback } from '../../src/server/geminiService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;

  try {
    const { prompt, image, mimeType, model } = req.body || {};

    if (!apiKey) {
      console.warn('[Clean Quest AI] Notice: GEMINI_API_KEY is not configured in environment. Providing demo assessment.');
      const demoResult = getDemoAnalysisFallback(prompt, Boolean(image));
      return res.status(200).json({
        success: true,
        isDemoMode: true,
        notice: 'GEMINI_API_KEY is not set. To enable live Gemini Flash analysis, add your GEMINI_API_KEY in environment variables.',
        analysis: demoResult,
      });
    }

    if (image) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      const effectiveMime = (mimeType || 'image/jpeg').toLowerCase();
      if (!allowedTypes.includes(effectiveMime)) {
        return res.status(400).json({
          success: false,
          error: 'Unsupported image format. Please upload JPG, PNG, or WEBP images only.',
        });
      }
    }

    let cleanedImageBase64 = null;
    if (image && typeof image === 'string') {
      cleanedImageBase64 = image.includes('base64,')
        ? image.split('base64,')[1]
        : image;
    }

    const analysis = await analyzeMedicineWithGemini({
      apiKey,
      model: model || 'gemini-3.5-flash-lite',
      prompt,
      imageBuffer: cleanedImageBase64,
      mimeType: mimeType || 'image/jpeg',
    });

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (err) {
    console.error('[Clean Quest AI Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred while processing with Gemini Flash.',
    });
  }
}

