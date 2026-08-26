/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processCropAnalysis, CropAnalysisRequestData } from './_lib/geminiService';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed. Expected POST.` });
  }

  try {
    let bodyData: CropAnalysisRequestData;

    if (typeof req.body === 'string') {
      try {
        bodyData = JSON.parse(req.body);
      } catch {
        return res.status(400).json({ error: 'Malformed JSON payload in request body.' });
      }
    } else if (req.body && typeof req.body === 'object') {
      bodyData = req.body as CropAnalysisRequestData;
    } else {
      return res.status(400).json({ error: 'Request body is missing or invalid.' });
    }

    const requestId = Math.random().toString(36).substring(2, 8);
    const result = await processCropAnalysis(bodyData, requestId);

    return res.status(result.statusCode).json(result.body);
  } catch (error: any) {
    console.error('Unhandled error in /api/analyze-crop serverless handler:', error);
    return res.status(500).json({
      error: error.message || 'An unexpected internal error occurred while analyzing the crop.',
    });
  }
}
