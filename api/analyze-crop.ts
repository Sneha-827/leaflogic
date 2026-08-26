/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
  maxDuration: 60,
};

interface NormalizedImage {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic' | 'image/heif';
  base64Data: string;
}

interface CropAnalysisRequestData {
  image?: string;
  cropName?: string;
  symptoms?: string;
  duration?: string;
  weather?: string;
  irrigation?: string;
  additionalNotes?: string;
}

const LEAFLOGIC_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    crop_identified: {
      type: Type.STRING,
      description: 'The crop identified from the image and user context.',
    },
    image_quality: {
      type: Type.STRING,
      enum: ['sufficient', 'poor_focus', 'blurry', 'too_far', 'insufficient_detail', 'unclear'],
      description: 'Evaluation of optical image clarity.',
    },
    assessment_status: {
      type: Type.STRING,
      enum: ['actionable', 'needs_more_info', 'low_confidence', 'inconclusive'],
      description: 'Status of the assessment after Confidence Gate verification.',
    },
    confidence_score: {
      type: Type.INTEGER,
      description: 'Conservative confidence score between 0 and 100.',
    },
    risk_level: {
      type: Type.STRING,
      enum: ['Low', 'Moderate', 'High', 'Critical', 'Unknown'],
      description: 'Estimated agricultural risk to the crop.',
    },
    likely_issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Common name and scientific/pathogen name.' },
          confidence: { type: Type.INTEGER, description: 'Confidence for this candidate issue (0-100).' },
          supporting_observations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Specific visual features and environmental factors supporting this possibility.',
          },
        },
        required: ['name', 'confidence', 'supporting_observations'],
      },
      description: 'Primary candidate conditions supported by the evidence.',
    },
    alternative_possibilities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Alternative disease, pest, or physiological stress.' },
          reason: { type: Type.STRING, description: 'Why this alternative is plausible or less likely.' },
          likelihood: { type: Type.STRING, enum: ['Low', 'Moderate', 'High', 'Possible'] },
        },
        required: ['name', 'reason', 'likelihood'],
      },
      description: 'Alternative conditions considered in differential diagnosis.',
    },
    observed_evidence: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Bullet points of concrete visual observations in the image.',
    },
    missing_information: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Information or photos needed for a more definitive assessment.',
    },
    safe_next_steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Safe, non-hazardous cultural and management actions.',
    },
    expert_verification_required: {
      type: Type.BOOLEAN,
      description: 'Whether field verification by a certified extension officer is recommended.',
    },
    explanation: {
      type: Type.STRING,
      description: 'Clear, transparent explanation of how LeafLogic reached this assessment.',
    },
  },
  required: [
    'crop_identified',
    'image_quality',
    'assessment_status',
    'confidence_score',
    'risk_level',
    'likely_issues',
    'alternative_possibilities',
    'observed_evidence',
    'missing_information',
    'safe_next_steps',
    'expert_verification_required',
    'explanation',
  ],
};

const LEAFLOGIC_SYSTEM_INSTRUCTION = `You are LeafLogic, a rigorous agricultural decision-support assistant designed for agronomists, extension officers, and farmers.
You analyze crop/leaf photographs combined with user-provided contextual and environmental information to evaluate possible plant health issues.

MANDATORY SCIENTIFIC & SAFETY PRINCIPLES:
1. NEVER claim a 100% guaranteed diagnosis from a single photo. Always present candidate conditions with supporting visual and environmental observations.
2. Clearly distinguish observable visual evidence (e.g. 'concentric target spots with chlorotic yellow halo', 'mosaic mottling', 'interveinal chlorosis') from diagnostic inferences.
3. CONFIDENCE GATE:
   - Evaluate optical image quality: 'sufficient', 'poor_focus', 'blurry', 'too_far', 'insufficient_detail', 'unclear'.
   - If the image is blurry, out-of-focus, taken from too far away, or crucial context is missing, set image_quality accordingly, set assessment_status to 'needs_more_info', and detail missing items in missing_information.
   - If multiple diseases share the same visual signs (e.g. bacterial spot vs early blight) and cannot be definitively separated without laboratory testing, set assessment_status to 'low_confidence' and expert_verification_required to true.
4. STRICT SAFETY:
   - NEVER recommend hazardous chemical cocktails, unapproved toxic mixtures, or off-label pesticide recipes.
   - Only recommend safe, non-hazardous cultural and agronomic practices (e.g. drip irrigation, avoiding overhead splashing, sanitation of pruning shears, weed management, crop rotation, organic mulching, adequate spacing).
   - Whenever risk is moderate or high, recommend consulting a local certified agricultural extension officer.
5. Provide realistic alternative possibilities for differential diagnosis.
6. Return ONLY a valid JSON object strictly matching the schema.`;

function sendJson(res: any, status: number, data: any) {
  try {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (typeof res.status === 'function') {
      if (typeof res.json === 'function') {
        return res.status(status).json(data);
      }
      res.status(status);
      return res.end(JSON.stringify(data));
    }
    res.statusCode = status;
    return res.end(JSON.stringify(data));
  } catch (err) {
    console.error('Error sending JSON response:', err);
    try {
      res.statusCode = status;
      res.end(JSON.stringify(data));
    } catch {
      // ignore
    }
  }
}

async function parseBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return req.body;
    }
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    if (Buffer.isBuffer(req.body)) {
      try {
        return JSON.parse(req.body.toString('utf8'));
      } catch {
        return {};
      }
    }
  }

  // Stream fallback
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw || raw.trim().length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

function normalizeAndValidateImage(rawImage: string): { success: true; image: NormalizedImage } | { success: false; error: string; statusCode: number } {
  if (!rawImage || typeof rawImage !== 'string' || rawImage.trim().length === 0) {
    return { success: false, error: 'No image data provided in request.', statusCode: 400 };
  }

  const trimmed = rawImage.trim();

  if (trimmed.startsWith('data:image/svg') || trimmed.includes('<svg') || trimmed.startsWith('%3Csvg')) {
    return {
      success: false,
      error: 'SVG vector graphics cannot be analyzed for optical crop disease pathology. Please upload a real photograph in JPEG, PNG, or WebP format.',
      statusCode: 400,
    };
  }

  let mimeType: NormalizedImage['mimeType'] = 'image/jpeg';
  let base64Data = '';

  if (trimmed.startsWith('data:')) {
    const dataUriRegex = /^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/s;
    const match = trimmed.match(dataUriRegex);

    if (match) {
      const declaredMime = match[1].toLowerCase();
      base64Data = match[2].trim();

      if (declaredMime === 'image/jpeg' || declaredMime === 'image/jpg') {
        mimeType = 'image/jpeg';
      } else if (declaredMime === 'image/png') {
        mimeType = 'image/png';
      } else if (declaredMime === 'image/webp') {
        mimeType = 'image/webp';
      } else if (declaredMime === 'image/heic') {
        mimeType = 'image/heic';
      } else if (declaredMime === 'image/heif') {
        mimeType = 'image/heif';
      } else {
        return {
          success: false,
          error: `Unsupported image MIME type (${declaredMime}). Please provide a JPEG, PNG, or WebP photo.`,
          statusCode: 400,
        };
      }
    } else {
      const commaIdx = trimmed.indexOf(',');
      if (commaIdx !== -1) {
        base64Data = trimmed.substring(commaIdx + 1).trim();
      } else {
        return { success: false, error: 'Invalid data URI format for image payload.', statusCode: 400 };
      }
    }
  } else {
    base64Data = trimmed;
    if (base64Data.startsWith('/9j/')) {
      mimeType = 'image/jpeg';
    } else if (base64Data.startsWith('iVBORw0KGgo')) {
      mimeType = 'image/png';
    } else if (base64Data.startsWith('UklGR')) {
      mimeType = 'image/webp';
    }
  }

  if (!base64Data || base64Data.length < 50) {
    return { success: false, error: 'Image base64 data is empty or too short.', statusCode: 400 };
  }

  const cleanBase64 = base64Data.replace(/\s+/g, '');
  return {
    success: true,
    image: {
      mimeType,
      base64Data: cleanBase64,
    },
  };
}

export default async function handler(req: any, res: any) {
  // CORS Preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: `Method ${req.method} Not Allowed. Expected POST.` });
  }

  try {
    const bodyData: CropAnalysisRequestData = await parseBody(req);
    const { image, cropName, symptoms, duration, weather, irrigation, additionalNotes } = bodyData;

    // 1. Validate text inputs
    if (!cropName || typeof cropName !== 'string' || cropName.trim().length === 0) {
      return sendJson(res, 400, { error: 'Crop name is required (e.g. Tomato, Corn, Cucumber).' });
    }

    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
      return sendJson(res, 400, { error: 'Observed symptoms description is required.' });
    }

    // 2. Validate and normalize image
    const imageNorm = normalizeAndValidateImage(image || '');
    if (imageNorm.success === false) {
      return sendJson(res, imageNorm.statusCode, { error: imageNorm.error });
    }

    const { mimeType, base64Data } = imageNorm.image;

    // 3. Verify Gemini API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      console.error('[LeafLogic Vercel Serverless] Missing GEMINI_API_KEY environment variable');
      return sendJson(res, 500, {
        error: 'The Gemini API key is not configured on the server. Please set GEMINI_API_KEY in your Vercel Project Environment Variables.',
      });
    }

    // 4. Initialize Gemini client
    const ai = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `Please evaluate this agricultural crop specimen:
- Crop Type: ${cropName.trim()}
- Observed Symptoms: ${symptoms.trim()}
- Duration of Symptoms: ${duration ? duration.trim() : 'Not specified'}
- Recent Rainfall & Weather: ${weather ? weather.trim() : 'Not specified'}
- Irrigation Method & Frequency: ${irrigation ? irrigation.trim() : 'Not specified'}
- Additional Notes: ${additionalNotes ? additionalNotes.trim() : 'None'}

Examine the uploaded leaf/plant image carefully. Assess optical clarity, visible lesions, spots, discoloration, or structural abnormalities. Apply the Confidence Gate principles and return structured JSON.`;

    const modelsToAttempt = ['gemini-3.1-flash-lite', 'gemini-3.6-flash'];
    let lastError: any = null;
    let successfulResponseText: string | null = null;

    for (const model of modelsToAttempt) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              {
                text: promptText,
              },
            ],
          },
          config: {
            systemInstruction: LEAFLOGIC_SYSTEM_INSTRUCTION,
            temperature: 0.15,
            responseMimeType: 'application/json',
            responseSchema: LEAFLOGIC_RESPONSE_SCHEMA,
          },
        });

        if (response.text && response.text.trim().length > 0) {
          successfulResponseText = response.text.trim();
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[LeafLogic Serverless] Model ${model} failed:`, err?.message || err);
      }
    }

    if (!successfulResponseText) {
      const errorMsg = lastError?.message || 'Failed to generate content with Gemini API.';
      const status = lastError?.status || lastError?.statusCode;

      if (status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota')) {
        return sendJson(res, 429, {
          error: 'Gemini API quota or rate limit exceeded. Please wait a moment and try again.',
          details: errorMsg,
        });
      }

      return sendJson(res, 502, {
        error: `Gemini API communication failed: ${errorMsg}`,
        details: errorMsg,
      });
    }

    // 5. Parse structured output
    try {
      const parsedResult = JSON.parse(successfulResponseText);
      return sendJson(res, 200, parsedResult);
    } catch (parseErr: any) {
      console.error('[LeafLogic Serverless] JSON parse error:', parseErr);
      return sendJson(res, 502, {
        error: 'The AI model returned an invalid response structure. Please try running the evaluation again.',
      });
    }
  } catch (unhandled: any) {
    console.error('[LeafLogic Serverless] Critical unhandled error in handler:', unhandled);
    return sendJson(res, 500, {
      error: unhandled?.message || 'An unexpected error occurred while analyzing the crop.',
    });
  }
}
