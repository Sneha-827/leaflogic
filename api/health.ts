/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function handler(req: any, res: any) {
  try {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      return res.end();
    }

    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);

    const payload = JSON.stringify({
      status: 'ok',
      service: 'LeafLogic AI Serverless Function (Vercel)',
      primaryModel: 'gemini-3.1-flash-lite',
      hasApiKey: hasKey,
      timestamp: new Date().toISOString(),
    });

    if (typeof res.status === 'function') {
      if (typeof res.json === 'function') {
        return res.status(200).json(JSON.parse(payload));
      }
      res.status(200);
      return res.end(payload);
    }

    res.statusCode = 200;
    return res.end(payload);
  } catch (err: any) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: err?.message || 'Health check failed' }));
  }
}
