/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { processCropAnalysis } from './src/server/geminiService';

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

// Crop Analysis API endpoint
app.post('/api/analyze-crop', async (req: Request, res: Response) => {
  const reqStartTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 8);

  try {
    devLog('REQ-START', `[${requestId}] Incoming crop analysis request for: "${req.body?.cropName || 'unknown'}"`);

    const result = await processCropAnalysis(req.body, requestId);

    devLog('REQ-RESULT', `[${requestId}] Finished with status ${result.statusCode} in ${Date.now() - reqStartTime}ms`);
    return res.status(result.statusCode).json(result.body);
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
