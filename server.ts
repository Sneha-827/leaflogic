/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import healthHandler from './api/health';
import analyzeCropHandler from './api/analyze-crop';

dotenv.config();

const PORT = 3000;
const app = express();
const isDev = process.env.NODE_ENV !== 'production';

// Increase JSON payload limit to handle base64 image data safely
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check API - forward to Vercel/Express compatible handler
app.get('/api/health', (req: Request, res: Response) => {
  return healthHandler(req, res);
});

// Crop Analysis API endpoint - forward to Vercel/Express compatible handler
app.post('/api/analyze-crop', async (req: Request, res: Response) => {
  return analyzeCropHandler(req, res);
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
