/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CropAnalysisInput, CropAnalysisResult } from '../types';
import { validateAIResponseSchema } from '../utils/validation';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isSimulated?: boolean;
}

export async function requestCropAnalysis(input: CropAnalysisInput): Promise<CropAnalysisResult> {
  const startTime = Date.now();
  const isDev = Boolean((import.meta as any).env?.DEV);

  if (isDev) {
    console.group(`[LeafLogic Client API] Sending crop analysis request for: "${input.cropName}"`);
    console.log('Symptoms:', input.symptoms);
    console.log('Duration:', input.duration);
    console.log('Weather:', input.weather);
    console.log('Irrigation:', input.irrigation);
    console.log('Image length:', input.image ? `${input.image.length} chars` : 'empty');
    console.groupEnd();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for multimodal AI

  try {
    const response = await fetch('/api/analyze-crop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: input.image,
        cropName: input.cropName,
        symptoms: input.symptoms,
        duration: input.duration,
        weather: input.weather,
        irrigation: input.irrigation,
        language: input.language || 'en',
        additionalNotes: input.additionalNotes,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      let errorMessage = `Server responded with status ${response.status}: ${response.statusText}`;
      
      if (contentType.includes('application/json')) {
        const errorBody = await response.json().catch(() => ({}));
        errorMessage = errorBody.error || errorMessage;
      } else {
        const textBody = await response.text().catch(() => '');
        if (textBody && textBody.length < 200 && !textBody.includes('<!DOCTYPE')) {
          errorMessage = textBody;
        } else if (response.status === 404) {
          errorMessage = 'API endpoint not found (/api/analyze-crop). Please verify serverless API deployment.';
        }
      }

      if (isDev) {
        console.error(`[LeafLogic Client API] Request failed (${response.status}) in ${durationMs}ms:`, errorMessage);
      }

      if (response.status === 429) {
        throw new Error('Gemini API rate limit or quota exceeded. Please wait a moment before trying again.');
      } else if (response.status === 503) {
        throw new Error('The Gemini AI service is currently experiencing high demand. Please try again in a few seconds.');
      } else if (response.status === 400) {
        throw new Error(`Input validation error: ${errorMessage}`);
      } else if (response.status === 502) {
        throw new Error(`Gemini AI service error: ${errorMessage}`);
      }

      throw new Error(errorMessage);
    }

    const rawData = await response.json();
    if (isDev) {
      console.log(`[LeafLogic Client API] Response received successfully in ${durationMs}ms:`, rawData);
    }

    const validation = validateAIResponseSchema(rawData);
    if (!validation.valid || !validation.result) {
      if (isDev) {
        console.error('[LeafLogic Client API] Schema validation error:', validation.error, rawData);
      }
      throw new Error(`AI Output Validation Error: ${validation.error || 'Malformed response format.'}`);
    }

    return validation.result;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Analysis request timed out after 60 seconds. Please check your network connection and try again.');
    }
    throw error;
  }
}

export async function checkServerHealth(): Promise<{ ok: boolean; hasApiKey: boolean; primaryModel?: string }> {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) return { ok: false, hasApiKey: false };
    const data = await response.json();
    return {
      ok: true,
      hasApiKey: Boolean(data.hasApiKey),
      primaryModel: data.primaryModel,
    };
  } catch {
    return { ok: false, hasApiKey: false };
  }
}
