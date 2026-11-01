/**
 * Gemini Flash AI Service for Clean Quest AI
 * Handles medicine label analysis and conversational chat with strict anti-doping safety guardrails.
 */

const SYSTEM_INSTRUCTION = `
You are "Clean Quest AI", an educational medicine and anti-doping assistant designed to assist athletes, coaches, and sports practitioners.

CORE PRINCIPLES & SAFETY RULES:
1. EDUCATIONAL ROLE ONLY: You are an educational anti-doping assistant, NOT a doctor, pharmacist, or official anti-doping authority (like WADA or NADA).
2. NEVER DECLARE DEFINITIVE SAFETY: You must NEVER claim that a medicine or supplement is definitely "safe", "healthy", "permitted", or "doping-free".
3. MANDATORY VERIFICATION: Always advise the user to verify the exact product, batch, formulation, and ingredients through official resources (e.g., Global DRO, WADA Prohibited List, or their National Anti-Doping Organisation).
4. ACCURACY OVER GUESSWORK:
   - Analyze ONLY information supported by the provided image or text.
   - NEVER invent or hallucinate ingredients.
   - If a label is blurry, cropped, incomplete, or unreadable, explicitly state the uncertainty in the "uncertainties" field.
   - Distinguish active ingredients from inactive/excipient ingredients whenever visible.
5. NO MEDICAL ADVICE:
   - Do NOT diagnose medical conditions.
   - Do NOT prescribe or recommend specific medications.
   - Do NOT instruct an athlete to start, stop, or change a prescribed treatment.
6. CAUTION WITH SUPPLEMENTS: Highlight that dietary supplements frequently carry risk of contamination or undeclared substances even if the label appears clear.

ALLOWED antiDopingStatus VALUES:
- "NO_CONCERN_IDENTIFIED": Visible ingredients do not match commonly known prohibited classes, but official verification is still mandatory.
- "POTENTIAL_CONCERN": One or more ingredients or product types may be associated with prohibited classes (e.g. stimulants, diuretics, anabolic agents, beta-2 agonists, hormone modulators).
- "VERIFY_REQUIRED": Specific formulation, route of administration, or ingredient details require thorough verification before consumption.
- "INSUFFICIENT_INFORMATION": Label text or image is incomplete, ambiguous, or lacks ingredient details to perform an initial screening.

RESPONSE REQUIREMENTS:
When analyzing a medicine or supplement label, you MUST return a valid JSON object matching this schema:
{
  "productName": "Detected product or medicine brand name, or 'Unknown Product' if unclear",
  "activeIngredients": ["List of active ingredients detected"],
  "strength": "Dosage/strength if visible (e.g. '500 mg', '10 mg/5ml'), or 'Not specified'",
  "manufacturer": "Manufacturer/distributor if visible, or 'Not visible'",
  "detectedText": "Key relevant text detected from the package label",
  "antiDopingStatus": "NO_CONCERN_IDENTIFIED | POTENTIAL_CONCERN | VERIFY_REQUIRED | INSUFFICIENT_INFORMATION",
  "potentialConcerns": ["List of specific anti-doping or ingredient concerns, or empty list if none identified"],
  "reasoning": "Clear, objective explanation of the assessment in neutral educational tone",
  "uncertainties": ["List of uncertainties such as unreadable text, missing inactive ingredients, batch risk"],
  "recommendedNextStep": "Specific action, emphasizing checking official anti-doping database (Global DRO / NADO) or consulting sports medicine staff"
}
`.trim();

export const AVAILABLE_FLASH_MODELS = [
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite', badge: 'Fastest', desc: 'Ultra-fast inference' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', badge: 'Balanced', desc: 'Next-gen vision & text' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', badge: 'Comprehensive', desc: 'Deep label inspection' },
];

/**
 * Perform label and text analysis using Gemini Flash
 */
export async function analyzeMedicineWithGemini({
  apiKey,
  model = 'gemini-3.5-flash-lite',
  prompt,
  imageBuffer,
  mimeType = 'image/jpeg',
}) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please set it in your environment or .env file.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const contents = [];
  const parts = [];

  // Add image if provided
  if (imageBuffer) {
    const base64Data = Buffer.isBuffer(imageBuffer)
      ? imageBuffer.toString('base64')
      : imageBuffer; // Already base64 string

    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: base64Data,
      },
    });
  }

  // Add text inquiry
  const textPrompt = prompt && prompt.trim()
    ? prompt.trim()
    : 'Please analyze this medicine or supplement package label for active ingredients and anti-doping considerations according to your system instructions.';

  parts.push({ text: textPrompt });
  contents.push({ role: 'user', parts });

  const requestBody = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents,
    generationConfig: {
      response_mime_type: 'application/json',
      temperature: 0.1, // Low temperature for high factual precision
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errBody = '';
    try {
      errBody = await response.text();
    } catch {
      // ignore
    }
    console.warn(`Gemini model ${model} returned ${response.status}:`, errBody);

    // Automatic cascade fallback if model is unavailable or busy
    const fallbackMap = {
      'gemini-3.5-flash': 'gemini-3.5-flash-lite',
      'gemini-3-flash-preview': 'gemini-3.5-flash-lite',
      'gemini-3.5-flash-lite': 'gemini-3-flash-preview',
      'gemini-2.5-flash': 'gemini-3.5-flash-lite',
    };

    const nextFallback = fallbackMap[model];
    if (nextFallback && nextFallback !== model) {
      console.log(`Cascading to fallback model: ${nextFallback}...`);
      return analyzeMedicineWithGemini({
        apiKey,
        model: nextFallback,
        prompt,
        imageBuffer,
        mimeType,
      });
    }

    if (response.status === 400 || response.status === 403) {
      throw new Error(`Gemini API authorization or parameter error (${response.status}). Please verify your GEMINI_API_KEY.`);
    } else if (response.status === 429) {
      throw new Error('Gemini API rate limit reached. Please wait a moment before trying again.');
    } else {
      throw new Error(`Gemini API request failed with status ${response.status}.`);
    }
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('No analysis text received from Gemini.');
  }

  try {
    const parsed = JSON.parse(rawText);
    return sanitizeAnalysisResponse(parsed);
  } catch (err) {
    console.error('Failed to parse Gemini JSON response:', rawText, err);
    throw new Error('Failed to parse structured anti-doping analysis from Gemini.');
  }
}

/**
 * Handle conversational follow-up questions
 */
export async function chatWithGemini({
  apiKey,
  model = 'gemini-3.5-flash-lite',
  messages = [],
  contextProduct = null,
}) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please set it in your environment or .env file.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let systemPrompt = SYSTEM_INSTRUCTION + `\n\nYou are answering follow-up questions in an interactive chat session.
Format your answer in clear, friendly markdown paragraphs with bullet points where helpful.
Never claim medication is guaranteed safe. Keep responses concise, educational, and focused on anti-doping awareness.`;

  if (contextProduct) {
    systemPrompt += `\n\nCURRENT PRODUCT CONTEXT:
Product Name: ${contextProduct.productName || 'Unknown'}
Active Ingredients: ${(contextProduct.activeIngredients || []).join(', ') || 'None identified'}
Anti-Doping Status: ${contextProduct.antiDopingStatus || 'VERIFY_REQUIRED'}
Potential Concerns: ${(contextProduct.potentialConcerns || []).join('; ') || 'None'}
Reasoning: ${contextProduct.reasoning || ''}`;
  }

  // Format messages for Gemini format (role: user | model)
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content || '' }],
  }));

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      temperature: 0.3,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errBody = '';
    try {
      errBody = await response.text();
    } catch {
      // ignore
    }
    console.warn(`Gemini Chat model ${model} returned ${response.status}:`, errBody);

    const fallbackModel = model === 'gemini-3.5-flash-lite' ? 'gemini-3-flash-preview' : 'gemini-3.5-flash-lite';
    if (model !== fallbackModel) {
      return chatWithGemini({
        apiKey,
        model: fallbackModel,
        messages,
        contextProduct,
      });
    }

    throw new Error(`Gemini Chat error (${response.status}). Please check API key and try again.`);
  }

  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!reply) {
    throw new Error('No response generated by Gemini.');
  }

  return { text: reply };
}

/**
 * Validate and sanitize structured analysis output
 */
function sanitizeAnalysisResponse(parsed) {
  const allowedStatuses = [
    'NO_CONCERN_IDENTIFIED',
    'POTENTIAL_CONCERN',
    'VERIFY_REQUIRED',
    'INSUFFICIENT_INFORMATION',
  ];

  const status = allowedStatuses.includes(parsed.antiDopingStatus)
    ? parsed.antiDopingStatus
    : 'VERIFY_REQUIRED';

  return {
    productName: typeof parsed.productName === 'string' ? parsed.productName : 'Product Under Review',
    activeIngredients: Array.isArray(parsed.activeIngredients) ? parsed.activeIngredients : [],
    strength: typeof parsed.strength === 'string' ? parsed.strength : 'Not specified',
    manufacturer: typeof parsed.manufacturer === 'string' ? parsed.manufacturer : 'Not visible',
    detectedText: typeof parsed.detectedText === 'string' ? parsed.detectedText : '',
    antiDopingStatus: status,
    potentialConcerns: Array.isArray(parsed.potentialConcerns) ? parsed.potentialConcerns : [],
    reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
    uncertainties: Array.isArray(parsed.uncertainties) ? parsed.uncertainties : [],
    recommendedNextStep: typeof parsed.recommendedNextStep === 'string' && parsed.recommendedNextStep.trim()
      ? parsed.recommendedNextStep
      : 'Verify the exact product and ingredients using an authoritative anti-doping medication resource.',
  };
}

/**
 * Mock analysis for local demo/testing when no API key is set yet
 */
export function getDemoAnalysisFallback(prompt, hasImage) {
  const isCoughCold = /pseudoephedrine|cough|cold|decongestant|sinus/i.test(prompt || '');
  const isSupplement = /creatine|pre-workout|whey|bcaa|protein|boost|energy/i.test(prompt || '');

  if (isCoughCold) {
    return {
      productName: 'Cold & Sinus Relief Tablet (Demo Assessment)',
      activeIngredients: ['Pseudoephedrine HCl (60mg)', 'Paracetamol (500mg)'],
      strength: '60mg / 500mg',
      manufacturer: 'Demo Health Labs',
      detectedText: 'Active Ingredients: Pseudoephedrine Hydrochloride 60mg, Paracetamol 500mg',
      antiDopingStatus: 'POTENTIAL_CONCERN',
      potentialConcerns: [
        'Pseudoephedrine is on the WADA Prohibited List (In-Competition threshold applies: urinary concentration > 150 µg/mL).',
        'Multi-symptom cold medications often combine permissible analgesics with prohibited stimulants.',
      ],
      reasoning: 'The detected active ingredient Pseudoephedrine is a prohibited stimulant during in-competition periods under WADA Section S6. Athletes must cease use well before competition window or apply for a TUE if medically necessary.',
      uncertainties: [
        'Demo mode response (configure GEMINI_API_KEY in .env for live Gemini Flash analysis).',
        'Batch formulation details not fully verified.',
      ],
      recommendedNextStep: 'Do NOT use in-competition without checking exact clearance times and consulting with your team physician or national anti-doping authority.',
    };
  }

  if (isSupplement) {
    return {
      productName: 'Performance Workout Powder (Demo Assessment)',
      activeIngredients: ['Creatine Monohydrate', 'Beta-Alanine', 'Caffeine'],
      strength: 'Per 10g scoop: 5g Creatine, 2g Beta-Alanine, 200mg Caffeine',
      manufacturer: 'Demo Nutrition Group',
      detectedText: 'Supplement Facts: Creatine Monohydrate, Beta-Alanine, Natural Flavors',
      antiDopingStatus: 'VERIFY_REQUIRED',
      potentialConcerns: [
        'Dietary supplements carry a recognized risk of cross-contamination with unlisted prohibited substances.',
        'High caffeine levels may trigger performance monitoring or gastrointestinal distress.',
      ],
      reasoning: 'While Creatine and Beta-Alanine are not prohibited substances on the WADA Prohibited List, supplements without third-party batch certification (e.g., Informed Sport, NSF Certified for Sport) carry a risk of inadvertent doping.',
      uncertainties: [
        'Demo mode response (configure GEMINI_API_KEY in .env for live Gemini Flash analysis).',
        'No third-party anti-doping testing stamp detected on visible label.',
      ],
      recommendedNextStep: 'Verify if this specific batch has been tested by Informed Sport or Cologne List before consumption.',
    };
  }

  return {
    productName: hasImage ? 'Paracetamol 500mg Tablets (Demo Assessment)' : 'Standard Analgesic Query (Demo Assessment)',
    activeIngredients: ['Paracetamol (Acetaminophen)'],
    strength: '500 mg',
    manufacturer: 'Demo Pharma Ltd',
    detectedText: 'Paracetamol 500 mg - Relief of pain and fever',
    antiDopingStatus: 'NO_CONCERN_IDENTIFIED',
    potentialConcerns: [],
    reasoning: 'Paracetamol is not prohibited under current World Anti-Doping Code rules (both in-competition and out-of-competition). However, verify that the formulation does not include added codeine, pseudoephedrine, or other stimulants.',
    uncertainties: [
      'Demo mode response (configure GEMINI_API_KEY in .env for live Gemini Flash analysis).',
      'Inactive ingredients and multi-ingredient brand variants should always be checked.',
    ],
    recommendedNextStep: 'Verify the exact brand and packaging with your official national anti-doping database (e.g. Global DRO) before use.',
  };
}
