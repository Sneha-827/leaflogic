/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;
const app = express();
const isDev = process.env.NODE_ENV !== 'production';

// Increase JSON payload limit to handle base64 image data safely
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Development diagnostic logger helper
function devLog(tag: string, message: string, data?: unknown) {
  if (isDev) {
    const timestamp = new Date().toISOString().substring(11, 23);
    if (data !== undefined) {
      console.log(`[${timestamp}] [LeafLogic-Dev] [${tag}] ${message}`, data);
    } else {
      console.log(`[${timestamp}] [LeafLogic-Dev] [${tag}] ${message}`);
    }
  }
}

// Health Check API
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  devLog('HEALTH', `Health check queried. API Key configured: ${hasKey}`);
  res.json({
    status: 'ok',
    service: 'LeafLogic AI Server',
    primaryModel: 'gemini-3.1-flash-lite',
    hasApiKey: hasKey,
    timestamp: new Date().toISOString(),
  });
});

interface NormalizedImage {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic' | 'image/heif';
  base64Data: string;
}

/**
 * Normalizes input image string into verified raster base64 and standard MIME type.
 * Rejects SVGs or corrupt inputs with clear descriptive error messages.
 */
function normalizeAndValidateImage(rawImage: string): { success: true; image: NormalizedImage } | { success: false; error: string; statusCode: number } {
  if (!rawImage || typeof rawImage !== 'string' || rawImage.trim().length === 0) {
    return { success: false, error: 'No image data provided in request.', statusCode: 400 };
  }

  const trimmed = rawImage.trim();

  // Reject SVG uploads because multimodal vision requires raster optical pixel data
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
      // Data URI without base64 prefix
      const commaIdx = trimmed.indexOf(',');
      if (commaIdx !== -1) {
        base64Data = trimmed.substring(commaIdx + 1).trim();
      } else {
        return { success: false, error: 'Invalid data URI format for image payload.', statusCode: 400 };
      }
    }
  } else {
    // Raw base64 string provided
    base64Data = trimmed;
    // Magic byte sniffing
    if (base64Data.startsWith('/9j/')) {
      mimeType = 'image/jpeg';
    } else if (base64Data.startsWith('iVBORw0KGgo')) {
      mimeType = 'image/png';
    } else if (base64Data.startsWith('UklGR')) {
      mimeType = 'image/webp';
    }
  }

  // Validate base64 structure and minimum length
  if (!base64Data || base64Data.length < 50) {
    return { success: false, error: 'Image base64 data is empty or too short.', statusCode: 400 };
  }

  // Quick sanity check on base64 characters
  const cleanBase64 = base64Data.replace(/\s+/g, '');
  if (!/^[A-Za-z0-9+/=]+$/.test(cleanBase64.substring(0, Math.min(cleanBase64.length, 1000)))) {
    return { success: false, error: 'Image contains invalid non-base64 characters.', statusCode: 400 };
  }

  return {
    success: true,
    image: {
      mimeType,
      base64Data: cleanBase64,
    },
  };
}

/**
 * Validates the parsed AI response structure against LeafLogic schema requirements
 */
function validateParsedAIOutput(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'AI output is not a JSON object.' };
  }

  const requiredStringFields = ['crop_identified', 'image_quality', 'assessment_status', 'risk_level', 'explanation'];
  for (const field of requiredStringFields) {
    if (typeof data[field] !== 'string' || data[field].trim().length === 0) {
      return { valid: false, error: `Missing or invalid required field: '${field}'` };
    }
  }

  if (typeof data.confidence_score !== 'number' || isNaN(data.confidence_score)) {
    return { valid: false, error: 'Missing or invalid numeric field: confidence_score' };
  }

  if (typeof data.expert_verification_required !== 'boolean') {
    return { valid: false, error: 'Missing or invalid boolean field: expert_verification_required' };
  }

  const requiredArrayFields = ['likely_issues', 'alternative_possibilities', 'observed_evidence', 'missing_information', 'safe_next_steps'];
  for (const field of requiredArrayFields) {
    if (!Array.isArray(data[field])) {
      return { valid: false, error: `Field '${field}' must be an array.` };
    }
  }

  return { valid: true };
}

// Sleep utility for exponential backoff
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Crop Analysis API endpoint
app.post('/api/analyze-crop', async (req: Request, res: Response) => {
  const reqStartTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 8);

  try {
    const { image, cropName, symptoms, duration, weather, irrigation, additionalNotes } = req.body;

    devLog('REQ-START', `[${requestId}] Incoming crop analysis request for: "${cropName || 'unknown'}"`);

    // 1. Validate required text inputs
    if (!cropName || typeof cropName !== 'string' || cropName.trim().length === 0) {
      return res.status(400).json({ error: 'Crop name is required (e.g. Tomato, Corn, Cucumber).' });
    }

    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
      return res.status(400).json({ error: 'Observed symptoms description is required.' });
    }

    // 2. Validate and normalize image
    const imageNormalization = normalizeAndValidateImage(image);
    if (imageNormalization.success === false) {
      devLog('IMAGE-ERR', `[${requestId}] Image validation failed: ${imageNormalization.error}`);
      return res.status(imageNormalization.statusCode).json({ error: imageNormalization.error });
    }

    const { mimeType, base64Data } = imageNormalization.image;
    devLog('IMAGE-OK', `[${requestId}] Validated image: MIME=${mimeType}, size=${Math.round(base64Data.length * 0.75 / 1024)} KB`);

    // 3. Verify Gemini API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      devLog('AUTH-ERR', `[${requestId}] GEMINI_API_KEY is not defined in environment variables.`);
      return res.status(500).json({
        error: 'The Gemini API key is not configured on the server. Please ensure GEMINI_API_KEY is set in your environment.',
      });
    }

    // 4. Initialize Gemini client
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are LeafLogic, a rigorous agricultural decision-support assistant designed for agronomists, extension officers, and farmers.
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

    const promptText = `Please evaluate this agricultural crop specimen:
- Crop Type: ${cropName.trim()}
- Observed Symptoms: ${symptoms.trim()}
- Duration of Symptoms: ${duration ? duration.trim() : 'Not specified'}
- Recent Rainfall & Weather: ${weather ? weather.trim() : 'Not specified'}
- Irrigation Method & Frequency: ${irrigation ? irrigation.trim() : 'Not specified'}
- Additional Notes: ${additionalNotes ? additionalNotes.trim() : 'None'}

Examine the uploaded leaf/plant image carefully. Assess optical clarity, visible lesions, spots, discoloration, or structural abnormalities. Apply the Confidence Gate principles and return structured JSON.`;

    const responseSchema = {
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

    // Candidate models: Primary is 'gemini-3.1-flash-lite', Fallback is 'gemini-3.6-flash'
    const modelsToAttempt = ['gemini-3.1-flash-lite', 'gemini-3.6-flash'];
    let lastError: any = null;
    let successfulResponseText: string | null = null;
    let modelUsed = '';

    for (const model of modelsToAttempt) {
      const maxRetries = 2;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          devLog('GEMINI-CALL', `[${requestId}] Attempt ${attempt}/${maxRetries} using model: ${model}`);

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
              systemInstruction,
              temperature: 0.15,
              responseMimeType: 'application/json',
              responseSchema,
            },
          });

          if (response.text && response.text.trim().length > 0) {
            successfulResponseText = response.text.trim();
            modelUsed = model;
            devLog('GEMINI-SUCCESS', `[${requestId}] Successful response received from ${model} in ${Date.now() - reqStartTime}ms`);
            break;
          } else {
            throw new Error('Gemini API returned an empty text response.');
          }
        } catch (err: any) {
          lastError = err;
          const status = err.status || err.statusCode || (err.message && err.message.includes('503') ? 503 : null);
          const isTransient = status === 503 || status === 429 || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT';

          devLog('GEMINI-ERR', `[${requestId}] Model ${model} attempt ${attempt} failed: ${err.message || err}`);

          // Only retry if the error is genuinely transient and we have attempts left
          if (isTransient && attempt < maxRetries) {
            const backoffMs = attempt * 1000;
            devLog('RETRY-WAIT', `[${requestId}] Waiting ${backoffMs}ms before retrying transient error (${status})...`);
            await delay(backoffMs);
          } else {
            break; // Move to next fallback model if available
          }
        }
      }

      if (successfulResponseText) {
        break;
      }
    }

    if (!successfulResponseText) {
      const errorMsg = lastError?.message || 'Unknown error occurred contacting the Gemini API.';
      const status = lastError?.status || lastError?.statusCode;

      devLog('REQ-FAIL', `[${requestId}] All model attempts failed. Last error: ${errorMsg}`);

      if (status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota')) {
        return res.status(429).json({
          error: 'Gemini API quota or rate limit exceeded. Please wait a moment and try again.',
          details: errorMsg,
        });
      }

      if (status === 503 || errorMsg.includes('overloaded') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE')) {
        return res.status(503).json({
          error: 'The Gemini AI service is currently experiencing high demand. Please retry in a few seconds.',
          details: errorMsg,
        });
      }

      return res.status(502).json({
        error: `Gemini API communication failed: ${errorMsg}`,
        details: errorMsg,
      });
    }

    // 5. Parse and validate structured output
    let parsedResult: any;
    try {
      parsedResult = JSON.parse(successfulResponseText);
    } catch (parseErr: any) {
      devLog('PARSE-ERR', `[${requestId}] Failed to parse JSON response: ${parseErr.message}`);
      return res.status(502).json({
        error: 'The AI model returned an invalid JSON response structure. Please try running the evaluation again.',
        details: successfulResponseText.substring(0, 300),
      });
    }

    const validation = validateParsedAIOutput(parsedResult);
    if (!validation.valid) {
      devLog('SCHEMA-ERR', `[${requestId}] Schema validation failed: ${validation.error}`);
      return res.status(502).json({
        error: `AI response schema validation error: ${validation.error}`,
      });
    }

    devLog('REQ-DONE', `[${requestId}] Successfully completed in ${Date.now() - reqStartTime}ms using ${modelUsed}`);
    return res.json(parsedResult);
  } catch (error: any) {
    devLog('UNHANDLED-ERR', `[${requestId}] Unhandled exception in /api/analyze-crop:`, error);
    return res.status(500).json({
      error: error.message || 'An unexpected internal server error occurred while analyzing the crop.',
      details: error.toString(),
    });
  }
});

async function startServer() {
  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LeafLogic Server running on http://localhost:${PORT}`);
  });
}

startServer();
