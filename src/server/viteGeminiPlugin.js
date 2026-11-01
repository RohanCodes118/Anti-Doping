/**
 * Vite Plugin that exposes server-side AI analysis and chat endpoints for Clean Quest AI.
 * Keeps GEMINI_API_KEY strictly server-side and never exposes it to client browsers.
 */

import fs from 'node:fs';
import path from 'node:path';
import { analyzeMedicineWithGemini, chatWithGemini, getDemoAnalysisFallback } from './geminiService.js';

// Read GEMINI_API_KEY from environment or directly from .env file
function getGeminiApiKey() {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY.trim();
  }

  // Fallback: Parse .env file in workspace root
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m);
      if (match && match[1]) {
        return match[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch (err) {
    console.warn('Could not read .env file for GEMINI_API_KEY:', err.message);
  }

  return null;
}

// Helper to parse JSON body from incoming stream with 10MB limit
async function parseJsonBody(req, limitBytes = 10 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;

    req.on('data', chunk => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(new Error('Payload too large. Maximum image and request size is 10MB.'));
        req.destroy();
        return;
      }
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON request payload: ' + err.message));
      }
    });

    req.on('error', err => reject(err));
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function setupAiRoutes(server) {
  server.middlewares.use(async (req, res, next) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost:5173'}`);
    const pathname = url.pathname;

    if (!pathname.startsWith('/api/ai/')) {
      return next();
    }

    const apiKey = getGeminiApiKey();

    try {
      // 1. Medicine / Supplement Label & Query Analysis
      if (pathname === '/api/ai/analyze' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { prompt, image, mimeType, model } = body;

        // If no API key is set, check if client requested demo or provide helpful demo fallback
        if (!apiKey) {
          console.warn('[Clean Quest AI] Notice: GEMINI_API_KEY is not configured in .env. Providing mock demo assessment.');
          const demoResult = getDemoAnalysisFallback(prompt, Boolean(image));
          return sendJson(res, 200, {
            success: true,
            isDemoMode: true,
            notice: 'GEMINI_API_KEY is not set in .env. To enable live Gemini Flash analysis, add your GEMINI_API_KEY in .env.',
            analysis: demoResult,
          });
        }

        // Validate image format if present
        if (image) {
          const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
          const effectiveMime = (mimeType || 'image/jpeg').toLowerCase();
          if (!allowedTypes.includes(effectiveMime)) {
            return sendJson(res, 400, {
              success: false,
              error: 'Unsupported image format. Please upload JPG, PNG, or WEBP images only.',
            });
          }
        }

        // Clean base64 string if it contains data URI prefix
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

        return sendJson(res, 200, {
          success: true,
          analysis,
        });
      }

      // 2. Interactive Chat Follow-up
      if (pathname === '/api/ai/chat' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const { messages, contextProduct, model } = body;

        if (!Array.isArray(messages) || messages.length === 0) {
          return sendJson(res, 400, {
            success: false,
            error: 'Messages list is required.',
          });
        }

        if (!apiKey) {
          return sendJson(res, 200, {
            success: true,
            isDemoMode: true,
            reply: 'This is a demo response. To converse with live Gemini Flash, please configure GEMINI_API_KEY in your .env file.',
          });
        }

        const chatResult = await chatWithGemini({
          apiKey,
          model: model || 'gemini-3.5-flash-lite',
          messages,
          contextProduct,
        });

        return sendJson(res, 200, {
          success: true,
          reply: chatResult.text,
        });
      }

      return next();
    } catch (err) {
      console.error('[Clean Quest AI Error]:', err.message);
      return sendJson(res, 500, {
        success: false,
        error: err.message || 'An error occurred while processing with Gemini Flash.',
      });
    }
  });
}

export function viteGeminiPlugin() {
  return {
    name: 'vite-gemini-server-plugin',
    configureServer(server) {
      setupAiRoutes(server);
    },
    configurePreviewServer(server) {
      setupAiRoutes(server);
    },
  };
}
